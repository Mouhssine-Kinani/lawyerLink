# backend/app/chat/service.py
import json
import re
import ollama
import unicodedata

from datetime import datetime, timezone

#db
from sqlalchemy.orm import Session
from sqlalchemy import case

#models
from app.chat.model import ChatMessage
from app.chat.cache import get_cached_specialties, get_cached_cities
from app.chat.config import MODEL, MAX_HISTORY_MESSAGES, SYSTEM_PROMPT
from app.lawyer.model import Lawyer
from app.user.model import User
from app.payment.model import Subscription, BoostPayment, SubscriptionStatus


# ─────────────────────────────────────────────────────────────
# Language detection helper
# ─────────────────────────────────────────────────────────────

ARABIC_REGEX = re.compile(r'[\u0600-\u06FF]')
FRENCH_ACCENTS_REGEX = re.compile(r'[éèêàâçîôûëïü]', re.IGNORECASE)

# Use word boundaries to avoid matching inside words
FRENCH_WORDS_REGEX = re.compile(
    r'\b(je|j\'ai|mon|ma|mes|un|une|le|la|les|des|avec|pour|'
    r'besoin|avocat|aide|probleme|problème|affaire|contrat|divorce)\b',
    re.IGNORECASE
)


def normalize_text(text: str) -> str:
    """
    Normalize text:
    - strip spaces
    - lowercase
    - normalize unicode (important for accents)
    """
    text = text.strip().lower()
    text = unicodedata.normalize("NFKC", text)
    return text


def detect_language_from_first_message(session_id: int, db: Session) -> str:
    first_msg = (
        db.query(ChatMessage.content)
        .filter(
            ChatMessage.session_id == session_id,
            ChatMessage.sender == "client"
        )
        .order_by(ChatMessage.created_at.asc())
        .first()
    )

    if not first_msg or not first_msg[0]:
        return "english"

    text = normalize_text(first_msg[0])

    # ---- Arabic ----
    if ARABIC_REGEX.search(text):
        return "arabic"

    # ---- French scoring ----
    french_score = 0

    if FRENCH_ACCENTS_REGEX.search(text):
        french_score += 2

    if FRENCH_WORDS_REGEX.search(text):
        french_score += 1

    if re.search(r'\b(qu|est|pas|dans|sur)\b', text):
        french_score += 1

    word_count = len(text.split())

    if (word_count <= 3 and french_score >= 1) or (word_count > 3 and french_score >= 2):
        return "french"

    return "english"
# ─────────────────────────────────────────────────────────────
# Specialty extraction
# ─────────────────────────────────────────────────────────────

def extract_legal_specialty(session_id: int, db: Session) -> str:
    history = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at.asc()).all()

    if not history:
        return "general"

    all_specialties = get_cached_specialties(db)
    specialty_list = ", ".join(sorted(all_specialties))

    conversation = "\n".join([
        f"{'Client' if msg.sender == 'client' else 'Assistant'}: {msg.content}"
        for msg in history
    ])

    prompt = f"""
Based on the conversation below, what single legal specialty does the client need?

Conversation:
{conversation}

You MUST reply with ONLY one word or short phrase from this exact list, nothing else:
{specialty_list}

Do NOT write a sentence. Do NOT explain. Just pick the closest match from the list.
"""

    response = ollama.chat(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        think=False,
        options={"temperature": 0.0}
    )

    result = response["message"]["content"].strip().lower()
    result = result.replace(".", "").replace(",", "").strip()

    if result in all_specialties:
        return result

    return "general"


# ─────────────────────────────────────────────────────────────
# Location extraction
# ─────────────────────────────────────────────────────────────

def extract_location(session_id: int, db: Session) -> str:
    cities = get_cached_cities(db)

    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id,
        ChatMessage.sender == "client"
    ).order_by(ChatMessage.created_at.asc()).all()

    for msg in reversed(messages):
        text = msg.content.lower()
        for city in cities:
            if city in text:
                return city

    return ""


# ─────────────────────────────────────────────────────────────
# Lawyer fetching
# ─────────────────────────────────────────────────────────────

def fetch_top_lawyers(specialty: str, location: str, db: Session) -> list[dict]:
    now = datetime.now(timezone.utc)
    today = now.date()

    boosted_ids = db.query(BoostPayment.lawyer_id).filter(
        BoostPayment.starts_at <= now,
        BoostPayment.expires_at >= now
    ).subquery()

    active_sub_ids = db.query(Subscription.lawyer_id).filter(
        Subscription.status == SubscriptionStatus.active,
        Subscription.start_date <= today,
        Subscription.end_date >= today
    ).subquery()

    boost_priority = case(
        (Lawyer.user_id.in_(boosted_ids), 1),
        else_=0
    )

    base_query = db.query(Lawyer, User).join(
        User, User.id == Lawyer.user_id
    ).filter(
        Lawyer.is_active == True,
        Lawyer.user_id.in_(active_sub_ids)
    )

    # Filter by city if provided
    if location:
        city_query = base_query.filter(User.city.ilike(f"%{location}%"))
        results = []
        if specialty and specialty != "general":
            results = city_query.filter(
                Lawyer.specialties.ilike(f"%{specialty}%")
            ).order_by(boost_priority.desc()).limit(15).all()
        if not results:
            results = city_query.order_by(boost_priority.desc()).limit(15).all()
    else:
        results = []

    # Fallback: ignore city filter
    if not results:
        if specialty and specialty != "general":
            results = base_query.filter(
                Lawyer.specialties.ilike(f"%{specialty}%")
            ).order_by(boost_priority.desc()).limit(15).all()
        if not results:
            results = base_query.order_by(boost_priority.desc()).limit(15).all()

    output = []
    for lawyer, user in results:
        specialties = []
        if lawyer.specialties:
            try:
                specialties = json.loads(lawyer.specialties)
            except (json.JSONDecodeError, TypeError):
                specialties = [s.strip() for s in lawyer.specialties.split(",")]

        is_boosted = db.query(BoostPayment).filter(
            BoostPayment.lawyer_id == lawyer.user_id,
            BoostPayment.starts_at <= now,
            BoostPayment.expires_at >= now
        ).first() is not None

        output.append({
            "id": lawyer.user_id,
            "name": f"{lawyer.first_name} {lawyer.last_name}",
            "city": user.city,
            "region": user.region,
            "specialties": specialties,
            "languages": lawyer.languages,
            "hourly_rate": str(lawyer.hourly_rate),
            "boosted": is_boosted,
        })

    return output


# ─────────────────────────────────────────────────────────────
# AI top-3 picker
# ─────────────────────────────────────────────────────────────

def get_top3_from_ai(candidates: list[dict], case_summary: str) -> list[dict]:
    if not candidates:
        return []

    candidates_text = "\n".join([
        f"ID:{c['id']}|{c['name']}|City:{c['city']}|Specialties:{','.join(c['specialties'])}|Lang:{c['languages']}|Rate:{c['hourly_rate']}|Boosted:{c['boosted']}"
        for c in candidates
    ])

    prompt = f"""
You are a legal matching assistant. Select TOP 3 best lawyers from this list.

Client case: {case_summary}

Available lawyers:
{candidates_text}

Reply ONLY with IDs (comma-separated), no other text. Example: 5,12,3
"""

    response = ollama.chat(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        think=False,
        options={"temperature": 0.0}
    )

    result = response["message"]["content"].strip()
    try:
        selected_ids = [int(x.strip()) for x in result.split(",") if x.strip().isdigit()]
        return [c for c in candidates if c["id"] in selected_ids[:3]]
    except Exception:
        return candidates[:3]


# ─────────────────────────────────────────────────────────────
# Search orchestration
# ─────────────────────────────────────────────────────────────

def search_lawyers_for_ai(
    session_id: int,
    ai_extracted_specialty: str,
    ai_extracted_location: str,
    db: Session
) -> list[dict]:
    extracted_specialty = extract_legal_specialty(session_id, db)
    extracted_location = extract_location(session_id, db)

    specialty = ai_extracted_specialty.strip() if ai_extracted_specialty.strip() else extracted_specialty
    location = ai_extracted_location.strip() if ai_extracted_location.strip() else extracted_location

    if not specialty:
        specialty = "general"

    candidates = fetch_top_lawyers(specialty, location, db)

    case_summary = f"Specialty: {specialty}, Location: {location}"
    top3 = get_top3_from_ai(candidates, case_summary)

    boosted_not_in_top3 = [c for c in candidates if c["boosted"] and c not in top3]
    all_recommendations = top3 + boosted_not_in_top3[:2]

    return all_recommendations


# ─────────────────────────────────────────────────────────────
# Main AI response entry point
# ─────────────────────────────────────────────────────────────

def get_ai_response(session_id: int, user_message: str, db: Session) -> dict:
    history = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at.asc()).limit(MAX_HISTORY_MESSAGES).all()

    # Detect language from first client message and reinforce it in the system prompt
    detected_lang = detect_language_from_first_message(session_id, db)
    lang_injection = f"\n\nCRITICAL REMINDER: The client's language is {detected_lang.upper()}. Every reply MUST be in {detected_lang.upper()} only."

    messages = [{"role": "system", "content": SYSTEM_PROMPT + lang_injection}]

    for msg in history:
        role = "user" if msg.sender.value == "client" else "assistant"
        messages.append({"role": role, "content": msg.content})

    messages.append({"role": "user", "content": user_message})

    response = ollama.chat(
        model=MODEL,
        messages=messages,
        think=False,
        options={"temperature": 0.3}
    )

    ai_message = response["message"]["content"]

    lawyers = None

    search_match = re.search(r'\[SEARCH_LAWYERS:([^\]]+)\]', ai_message, re.IGNORECASE)
    if search_match:
        parts = search_match.group(1).split(":")
        ai_specialty = parts[0].strip() if len(parts) > 0 else ""
        ai_location = parts[1].strip() if len(parts) > 1 else ""

        lawyers = search_lawyers_for_ai(session_id, ai_specialty, ai_location, db)

        remaining = re.sub(
            r'\[SEARCH_LAWYERS:[^\]]+\]', '', ai_message, flags=re.IGNORECASE
        ).strip()

        if not remaining:
            ai_message = "I'm searching for the best lawyers for your case — here are my top recommendations!"
        else:
            ai_message = remaining

    return {
        "message": ai_message,
        "lawyers": lawyers
    }


# ─────────────────────────────────────────────────────────────
# Admin / maintenance utilities
# ─────────────────────────────────────────────────────────────

def check_and_update_expired_subscriptions(db: Session) -> dict:
    from datetime import date
    today = date.today()

    updated = db.query(Subscription).filter(
        Subscription.status == SubscriptionStatus.active,
        Subscription.end_date < today
    ).update({"status": SubscriptionStatus.expired})

    db.commit()
    return {"subscriptions_updated": updated}


def cleanup_expired_boosts(db: Session) -> dict:
    now = datetime.now(timezone.utc)
    expired_count = db.query(BoostPayment).filter(
        BoostPayment.expires_at < now
    ).count()
    return {"expired_boosts": expired_count}