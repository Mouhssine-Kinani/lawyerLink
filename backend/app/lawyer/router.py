from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date, datetime, time, timedelta

from app.core.database import get_db
from app.core.dependencies import require_role
from app.user.model import User
from app.lawyer.model import Lawyer
from app.lawyer.schema import LawyerUpdate, LawyerResponse, LawyerPublicResponse
from app.review.model import Review
from app.review.schema import ReviewResponse
from app.reservation.model import Reservation, ReservationStatus
from app.reservation.schema import ReservationUpdate, ReservationResponse
from app.payment.model import PaymentTransaction, PaymentType, PaymentStatus

router = APIRouter(prefix="/lawyer", tags=["Lawyer"])

# ──────────────────────────────────────────────────────────────
# LIST ALL UNIQUE SPECIALTIES (Public)
# ──────────────────────────────────────────────────────────────

@router.get("/specialties")
def list_specialties(db: Session = Depends(get_db)):
    from sqlalchemy import text
    rows = db.execute(
        text("SELECT DISTINCT specialties FROM lawyers WHERE is_active = TRUE")
    ).all()
    seen = set()
    result = []
    for (row,) in rows:
        if not row:
            continue
        try:
            import json
            specs = json.loads(row) if isinstance(row, str) else row
        except (json.JSONDecodeError, TypeError):
            specs = str(row).split(",")
        if isinstance(specs, list):
            for s in specs:
                s = s.strip()
                if s and s not in seen:
                    seen.add(s)
                    result.append(s)
    return sorted(result)


# ──────────────────────────────────────────────────────────────
# SEARCH LAWYERS (Public - autocomplete)
# ──────────────────────────────────────────────────────────────

@router.get("/search", response_model=list[dict])
def search_lawyers(
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=20),
    db: Session = Depends(get_db),
):
    from sqlalchemy import or_
    query = (
        db.query(Lawyer, User)
        .join(User, User.id == Lawyer.user_id)
        .filter(Lawyer.is_active == True)
        .filter(
            or_(
                Lawyer.first_name.ilike(f"%{q}%"),
                Lawyer.last_name.ilike(f"%{q}%"),
                Lawyer.firm.ilike(f"%{q}%"),
                Lawyer.specialties.ilike(f"%{q}%"),
            )
        )
        .limit(limit)
        .all()
    )
    return [
        {
            "user_id": lawyer.user_id,
            "first_name": lawyer.first_name,
            "last_name": lawyer.last_name,
            "firm": lawyer.firm,
            "specialties": lawyer.specialties,
            "image_url": user.image_url,
        }
        for lawyer, user in query
    ]


# ──────────────────────────────────────────────────────────────
# Auto-complete reservations whose date+time has passed
# ──────────────────────────────────────────────────────────────

def auto_complete_reservations(db: Session):
    now = datetime.now()
    completed = (
        db.query(Reservation)
        .filter(
            Reservation.reservation_date <= now,
            Reservation.status == ReservationStatus.accepted,
        )
        .all()
    )
    for r in completed:
        r.status = ReservationStatus.completed
    if completed:
        db.commit()
    return len(completed)


# ──────────────────────────────────────────────────────────────
# LIST ALL ACTIVE LAWYERS (Public)
# ──────────────────────────────────────────────────────────────

@router.get("/public", response_model=list[LawyerPublicResponse])
def list_lawyers_public(
    specialty: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    min_rate: Optional[float] = Query(None),
    max_rate: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    language: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    from sqlalchemy import or_

    query = (
        db.query(Lawyer, User)
        .join(User, User.id == Lawyer.user_id)
        .filter(Lawyer.is_active == True)
    )

    if specialty:
        specs = [s.strip() for s in specialty.split(",") if s.strip()]
        if specs:
            filters = [Lawyer.specialties.ilike(f"%{s}%") for s in specs]
            query = query.filter(or_(*filters))
    if language:
        langs = [l.strip() for l in language.split(",") if l.strip()]
        if langs:
            filters = [Lawyer.languages.ilike(f"%{l}%") for l in langs]
            query = query.filter(or_(*filters))
    if city:
        query = query.filter(
            (Lawyer.city.ilike(f"%{city}%")) | (User.city.ilike(f"%{city}%"))
        )
    if min_rate is not None:
        query = query.filter(Lawyer.hourly_rate >= min_rate)
    if max_rate is not None:
        query = query.filter(Lawyer.hourly_rate <= max_rate)
    if min_rating is not None:
        query = query.filter(Lawyer.rating_avg >= min_rating)

    if sort_by == "rating":
        query = query.order_by(Lawyer.rating_avg.desc())
    elif sort_by == "rate":
        query = query.order_by(Lawyer.hourly_rate.is_(None).asc(), Lawyer.hourly_rate.asc())
    elif sort_by == "experience":
        query = query.order_by(Lawyer.rating_count.desc())
    else:
        query = query.order_by(Lawyer.rating_avg.desc())

    results = query.limit(limit).all()

    return [
        LawyerPublicResponse(
            user_id=lawyer.user_id,
            email=user.email,
            first_name=lawyer.first_name,
            last_name=lawyer.last_name,
            firm=lawyer.firm,
            specialties=lawyer.specialties,
            languages=lawyer.languages,
            hourly_rate=float(lawyer.hourly_rate) if lawyer.hourly_rate else None,
            rating_avg=float(lawyer.rating_avg) if lawyer.rating_avg else None,
            rating_count=lawyer.rating_count,
            city=lawyer.city or user.city,
            region=lawyer.region or user.region,
            image_url=user.image_url,
            is_active=lawyer.is_active
        )
        for lawyer, user in results
    ]


# ──────────────────────────────────────────────────────────────
# GET LAWYER DETAIL (Public)
# ──────────────────────────────────────────────────────────────

@router.get("/public/{lawyer_id}", response_model=LawyerPublicResponse)
def get_lawyer_public(
    lawyer_id: int,
    db: Session = Depends(get_db)
):
    lawyer = db.query(Lawyer).filter(Lawyer.user_id == lawyer_id).first()
    if not lawyer:
        raise HTTPException(404, "Lawyer not found")

    user = db.query(User).filter(User.id == lawyer.user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    return LawyerPublicResponse(
        user_id=lawyer.user_id,
        email=user.email,
        first_name=lawyer.first_name,
        last_name=lawyer.last_name,
        firm=lawyer.firm,
        specialties=lawyer.specialties,
        languages=lawyer.languages,
        hourly_rate=float(lawyer.hourly_rate) if lawyer.hourly_rate else None,
        rating_avg=float(lawyer.rating_avg) if lawyer.rating_avg else None,
        rating_count=lawyer.rating_count,
        city=lawyer.city or user.city,
        region=lawyer.region or user.region,
        image_url=user.image_url,
        is_active=lawyer.is_active
    )


# ──────────────────────────────────────────────────────────────
# GET LAWYER AVAILABILITY (Public - time slots for a given date)
# ──────────────────────────────────────────────────────────────

@router.get("/public/{lawyer_id}/availability")
def get_lawyer_availability(
    lawyer_id: int,
    date_str: str = Query(..., alias="date"),
    db: Session = Depends(get_db)
):
    lawyer = db.query(Lawyer).filter(Lawyer.user_id == lawyer_id).first()
    if not lawyer:
        raise HTTPException(404, "Lawyer not found")

    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(400, "Invalid date format. Use YYYY-MM-DD")

    # Generate hourly time slots from 9 AM to 5 PM
    slots = []
    for hour in range(9, 18):
        slot_dt = datetime.combine(target_date, time(hour, 0))

        is_booked = bool(
            db.query(Reservation)
            .filter(
                Reservation.lawyer_id == lawyer_id,
                Reservation.reservation_date == slot_dt,
                Reservation.status.in_([ReservationStatus.pending, ReservationStatus.accepted]),
            )
            .first()
        )

        ampm = "AM" if hour < 12 else "PM"
        display_hour = hour if hour <= 12 else hour - 12
        slots.append({
            "time": f"{display_hour:02d}:00 {ampm}",
            "datetime": slot_dt.isoformat(),
            "available": not is_booked,
        })

    return {"date": date_str, "slots": slots}


# ──────────────────────────────────────────────────────────────
# GET LAWYER MONTH AVAILABILITY (Public - which dates are fully booked)
# ──────────────────────────────────────────────────────────────

@router.get("/public/{lawyer_id}/availability/month")
def get_lawyer_month_availability(
    lawyer_id: int,
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db)
):
    lawyer = db.query(Lawyer).filter(Lawyer.user_id == lawyer_id).first()
    if not lawyer:
        raise HTTPException(404, "Lawyer not found")

    # Calculate month range
    if month == 12:
        next_month = datetime(year + 1, 1, 1)
    else:
        next_month = datetime(year, month + 1, 1)
    first_day = datetime(year, month, 1)
    last_day = next_month - timedelta(days=1)

    # Get all booked reservations for this lawyer in this month
    booked_slots = db.query(Reservation.reservation_date).filter(
        Reservation.lawyer_id == lawyer_id,
        Reservation.reservation_date >= first_day,
        Reservation.reservation_date <= last_day,
        Reservation.status.in_([ReservationStatus.pending, ReservationStatus.accepted]),
    ).all()

    booked_set = {row.reservation_date.replace(tzinfo=None) for row in booked_slots}

    today = date.today()
    fully_booked = []

    for day in range(1, last_day.day + 1):
        d = date(year, month, day)
        if d < today:
            continue
        all_booked = True
        for hour in range(9, 18):
            slot_dt = datetime.combine(d, time(hour, 0))
            if slot_dt not in booked_set:
                all_booked = False
                break
        if all_booked:
            fully_booked.append(d.isoformat())

    return {"year": year, "month": month, "fully_booked_dates": fully_booked}


# ──────────────────────────────────────────────────────────────
# UPDATE LAWYER PROFILE
# ──────────────────────────────────────────────────────────────

@router.patch("/me", response_model=LawyerResponse)
def update_lawyer_profile(
    update: LawyerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("lawyer"))
):
    lawyer = db.query(Lawyer).filter(Lawyer.user_id == current_user.id).first()
    if not lawyer:
        raise HTTPException(404, "Lawyer profile not found")

    changed = False
    if update.first_name is not None:
        lawyer.first_name = update.first_name
        changed = True
    if update.last_name is not None:
        lawyer.last_name = update.last_name
        changed = True
    if update.firm is not None:
        lawyer.firm = update.firm
        changed = True
    if update.license_number is not None:
        lawyer.license_number = update.license_number
        changed = True
    if update.specialties is not None:
        lawyer.specialties = update.specialties
        changed = True
    if update.languages is not None:
        lawyer.languages = update.languages
        changed = True
    if update.hourly_rate is not None:
        lawyer.hourly_rate = update.hourly_rate
        changed = True
    if update.city is not None:
        lawyer.city = update.city
        changed = True
    if update.region is not None:
        lawyer.region = update.region
        changed = True

    if not changed:
        raise HTTPException(400, "No fields to update")

    db.commit()
    db.refresh(lawyer)

    return LawyerResponse(
        first_name=lawyer.first_name,
        last_name=lawyer.last_name,
        firm=lawyer.firm,
        license_number=lawyer.license_number,
        specialties=lawyer.specialties,
        languages=lawyer.languages,
        hourly_rate=float(lawyer.hourly_rate) if lawyer.hourly_rate else None,
        rating_avg=float(lawyer.rating_avg) if lawyer.rating_avg else None,
        rating_count=lawyer.rating_count,
        city=lawyer.city,
        region=lawyer.region,
        is_active=lawyer.is_active,
        user_id=lawyer.user_id
    )


# ──────────────────────────────────────────────────────────────
# GET LAWYER'S REVIEWS
# ──────────────────────────────────────────────────────────────

@router.get("/me/reviews", response_model=list[ReviewResponse])
def get_my_reviews(
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("lawyer"))
):
    lawyer = db.query(Lawyer).filter(Lawyer.user_id == current_user.id).first()
    if not lawyer:
        raise HTTPException(404, "Lawyer profile not found")

    reviews = (
        db.query(Review)
        .filter(Review.lawyer_id == lawyer.user_id)
        .order_by(Review.created_at.desc())
        .limit(limit)
        .all()
    )
    return reviews


# ──────────────────────────────────────────────────────────────
# GET LAWYER'S RESERVATIONS (appointments)
# ──────────────────────────────────────────────────────────────

@router.get("/me/reservations", response_model=list[ReservationResponse])
def get_my_reservations(
    status_filter: Optional[ReservationStatus] = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=100),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("lawyer"))
):
    lawyer = db.query(Lawyer).filter(Lawyer.user_id == current_user.id).first()
    if not lawyer:
        raise HTTPException(404, "Lawyer profile not found")

    # Auto-complete past accepted reservations
    auto_complete_reservations(db)

    query = (
        db.query(Reservation)
        .filter(Reservation.lawyer_id == lawyer.user_id)
    )

    if status_filter:
        query = query.filter(Reservation.status == status_filter)

    if date_from:
        query = query.filter(Reservation.reservation_date >= datetime.combine(date_from, datetime.min.time()))

    if date_to:
        query = query.filter(Reservation.reservation_date <= datetime.combine(date_to, datetime.max.time()))

    return query.order_by(Reservation.reservation_date.desc()).limit(limit).all()


# ──────────────────────────────────────────────────────────────
# UPDATE RESERVATION STATUS (accept / reject / complete / cancel)
# ──────────────────────────────────────────────────────────────

@router.patch("/me/reservations/{reservation_id}", response_model=ReservationResponse)
def update_reservation_status(
    reservation_id: int,
    update: ReservationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("lawyer"))
):
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(404, "Reservation not found")

    if reservation.lawyer_id != current_user.id:
        raise HTTPException(403, "Not your reservation")

    if update.status is not None:
        if update.status == ReservationStatus.accepted:
            if reservation.status != ReservationStatus.pending:
                raise HTTPException(400, "Can only accept pending reservations")
        elif update.status == ReservationStatus.rejected:
            if reservation.status != ReservationStatus.pending:
                raise HTTPException(400, "Can only reject pending reservations")
        elif update.status == ReservationStatus.completed:
            if reservation.status != ReservationStatus.accepted:
                raise HTTPException(400, "Can only complete accepted reservations")
        elif update.status == ReservationStatus.cancelled:
            if reservation.status not in (ReservationStatus.pending, ReservationStatus.accepted):
                raise HTTPException(400, "Can only cancel pending or accepted reservations")
        else:
            raise HTTPException(400, "Invalid status change")

    if update.reservation_date is not None:
        if reservation.status != ReservationStatus.pending:
            raise HTTPException(400, "Can only change date for pending reservations")

        existing = db.query(Reservation).filter(
            Reservation.lawyer_id == reservation.lawyer_id,
            Reservation.reservation_date == update.reservation_date,
            Reservation.id != reservation_id,
            Reservation.status.in_([ReservationStatus.pending, ReservationStatus.accepted])
        ).first()
        if existing:
            raise HTTPException(409, "This new time slot is already booked")

    changed = False
    if update.status is not None:
        reservation.status = update.status
        changed = True

    if update.reservation_date is not None:
        reservation.reservation_date = update.reservation_date
        changed = True

    if update.notes is not None:
        reservation.notes = update.notes
        changed = True

    if not changed:
        raise HTTPException(400, "No fields to update")

    db.commit()
    db.refresh(reservation)
    return reservation


# ──────────────────────────────────────────────────────────────
# GET LAWYER'S PAYMENT HISTORY (filtered by date)
# ──────────────────────────────────────────────────────────────

@router.get("/me/payments/history")
def get_payment_history(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    payment_type: Optional[PaymentType] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("lawyer"))
):
    query = (
        db.query(PaymentTransaction)
        .filter(PaymentTransaction.payer_id == current_user.id)
    )

    if date_from:
        query = query.filter(PaymentTransaction.created_at >= datetime.combine(date_from, datetime.min.time()))

    if date_to:
        query = query.filter(PaymentTransaction.created_at <= datetime.combine(date_to, datetime.max.time()))

    if payment_type:
        query = query.filter(PaymentTransaction.type == payment_type)

    transactions = query.order_by(PaymentTransaction.created_at.desc()).all()

    return [
        {
            "id": t.id,
            "amount": float(t.amount),
            "type": t.type.value,
            "status": t.status.value,
            "created_at": t.created_at,
        }
        for t in transactions
    ]
