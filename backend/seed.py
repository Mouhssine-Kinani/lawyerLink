#!/usr/bin/env python3
"""
Database seeding script for LawyerLink platform
Run with: python seed.py
"""

import sys
import os
from datetime import datetime, timedelta, timezone
from decimal import Decimal
import json

# Add app directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import all models FIRST to ensure they're registered with SQLAlchemy
from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.user.model import User, Client, Role
from app.lawyer.model import Lawyer
from app.payment.model import Subscription, SubscriptionStatus, BoostPayment, PaymentTransaction, PaymentType, PaymentStatus
from app.reservation.model import Reservation, ReservationStatus
from app.review.model import Review
from app.chat.model import ChatSession, ChatMessage, SenderEnum
from app.recommendation.model import RecommendationLog

# ============================================================================
# TEST CREDENTIALS FILE
# ============================================================================

CREDENTIALS_FILE = "test_credentials.json"

def save_credentials(credentials):
    """Save all test account credentials to a JSON file"""
    with open(CREDENTIALS_FILE, "w") as f:
        json.dump(credentials, f, indent=2)
    print(f"\n✅ Credentials saved to: {CREDENTIALS_FILE}")
    print("=" * 60)
    for cred in credentials["users"]:
        print(f"  {cred['role'].upper()}: {cred['email']} / {cred['password']}")
    print("=" * 60)


# ============================================================================
# LAWYER DATA
# ============================================================================

LAWYERS = [
    {
        "email": "sarah.jenkins@lawoffice.com",
        "password": "lawyer123",
        "first_name": "Sarah",
        "last_name": "Jenkins",
        "firm": "Jenkins & Associates Family Law",
        "license_number": "BAR-FL-45231",
        "specialties": ["Family Law", "Mediation", "Divorce", "Child Custody"],
        "languages": "English, Spanish",
        "hourly_rate": Decimal("350.00"),
        "city": "Casablanca",
        "region": "Casablanca-Settat",
        "is_active": True,
        "rating_avg": Decimal("4.9"),
        "rating_count": 124,
    },
    {
        "email": "marcus.thorne@corporatelegal.ma",
        "password": "lawyer123",
        "first_name": "Marcus",
        "last_name": "Thorne",
        "firm": "Thorne Corporate Legal",
        "license_number": "BAR-CBL-78234",
        "specialties": ["Corporate Law", "Mergers & Acquisitions", "Venture Capital", "Contract Law"],
        "languages": "English, French",
        "hourly_rate": Decimal("550.00"),
        "city": "Rabat",
        "region": "Rabat-Salé-Kénitra",
        "is_active": True,
        "rating_avg": Decimal("5.0"),
        "rating_count": 89,
    },
    {
        "email": "elena.rodriguez@defenselegal.ma",
        "password": "lawyer123",
        "first_name": "Elena",
        "last_name": "Rodriguez",
        "firm": "Rodriguez Criminal Defense",
        "license_number": "BAR-CRM-34567",
        "specialties": ["Criminal Defense", "White Collar Crime", "Civil Rights", "Appeals"],
        "languages": "English, Spanish, French",
        "hourly_rate": Decimal("425.00"),
        "city": "Marrakech",
        "region": "Marrakech-Safi",
        "is_active": True,
        "rating_avg": Decimal("4.8"),
        "rating_count": 210,
    },
    {
        "email": "aymane.khalfi@legalaid.ma",
        "password": "lawyer123",
        "first_name": "Aymane",
        "last_name": "Khalfi",
        "firm": "Khalfi Law Office",
        "license_number": "BAR-FAM-12345",
        "specialties": ["Family Law", "Inheritance", "Real Estate"],
        "languages": "Arabic, French, English",
        "hourly_rate": Decimal("90.00"),
        "city": "Casablanca",
        "region": "Casablanca-Settat",
        "is_active": True,
        "rating_avg": Decimal("3.0"),
        "rating_count": 1,
    },
    {
        "email": "fatima.zahra@intellect.ma",
        "password": "lawyer123",
        "first_name": "Fatima",
        "last_name": "Zahra",
        "firm": "Zahra Intellectual Property",
        "license_number": "BAR-IP-98765",
        "specialties": ["Intellectual Property", "Trademark Law", "Copyright", "Patent Law"],
        "languages": "Arabic, French, English, German",
        "hourly_rate": Decimal("480.00"),
        "city": "Casablanca",
        "region": "Casablanca-Settat",
        "is_active": True,
        "rating_avg": Decimal("4.7"),
        "rating_count": 56,
    },
    {
        "email": "youssef.benali@employment.ma",
        "password": "lawyer123",
        "first_name": "Youssef",
        "last_name": "Benali",
        "firm": "Benali Employment Law",
        "license_number": "BAR-EMP-55432",
        "specialties": ["Employment Law", "Labor Disputes", "Workplace Harassment", "Wrongful Termination"],
        "languages": "Arabic, French",
        "hourly_rate": Decimal("250.00"),
        "city": "Tangier",
        "region": "Tanger-Tétouan-Al Hoceïma",
        "is_active": True,
        "rating_avg": Decimal("4.6"),
        "rating_count": 78,
    },
    {
        "email": "nadia.moradi@realestate.ma",
        "password": "lawyer123",
        "first_name": "Nadia",
        "last_name": "Moradi",
        "firm": "Moradi Real Estate Legal",
        "license_number": "BAR-RE-22334",
        "specialties": ["Real Estate Law", "Property Disputes", "Landlord-Tenant", "Construction Law"],
        "languages": "Arabic, French, English",
        "hourly_rate": Decimal("300.00"),
        "city": "Casablanca",
        "region": "Casablanca-Settat",
        "is_active": True,
        "rating_avg": Decimal("4.8"),
        "rating_count": 92,
    },
    {
        "email": "hicham.berrada@tax.ma",
        "password": "lawyer123",
        "first_name": "Hicham",
        "last_name": "Berrada",
        "firm": "Berrada Tax & Business Law",
        "license_number": "BAR-TAX-77654",
        "specialties": ["Tax Law", "Business Formation", "International Tax", "Estate Planning"],
        "languages": "Arabic, French, English",
        "hourly_rate": Decimal("380.00"),
        "city": "Rabat",
        "region": "Rabat-Salé-Kénitra",
        "is_active": True,
        "rating_avg": Decimal("4.5"),
        "rating_count": 34,
    },
    {
        "email": "soukaina.ait@humanrights.ma",
        "password": "lawyer123",
        "first_name": "Soukaina",
        "last_name": "Ait",
        "firm": "Ait Human Rights Law",
        "license_number": "BAR-HR-44321",
        "specialties": ["Human Rights Law", "Immigration", "Asylum", "Civil Liberties"],
        "languages": "Arabic, French, English, Berber",
        "hourly_rate": Decimal("220.00"),
        "city": "Fez",
        "region": "Fès-Meknès",
        "is_active": True,
        "rating_avg": Decimal("4.9"),
        "rating_count": 67,
    },
    {
        "email": "mehdi.chaoui@international.ma",
        "password": "lawyer123",
        "first_name": "Mehdi",
        "last_name": "Chaoui",
        "firm": "Chaoui International Legal",
        "license_number": "BAR-INT-99887",
        "specialties": ["International Law", "Cross-border Transactions", "Arbitration", "Trade Law"],
        "languages": "Arabic, French, English, Spanish",
        "hourly_rate": Decimal("600.00"),
        "city": "Casablanca",
        "region": "Casablanca-Settat",
        "is_active": True,
        "rating_avg": Decimal("4.9"),
        "rating_count": 103,
    }
]

# ============================================================================
# CLIENT DATA
# ============================================================================

CLIENTS = [
    {
        "email": "john.doe@example.com",
        "password": "client123",
        "first_name": "John",
        "last_name": "Doe",
        "phone": "+212 600 123 456",
        "city": "Casablanca",
        "region": "Casablanca-Settat",
    },
    {
        "email": "jane.smith@example.com",
        "password": "client123",
        "first_name": "Jane",
        "last_name": "Smith",
        "phone": "+212 600 234 567",
        "city": "Rabat",
        "region": "Rabat-Salé-Kénitra",
    },
    {
        "email": "mohammed.alami@example.com",
        "password": "client123",
        "first_name": "Mohammed",
        "last_name": "Alami",
        "phone": "+212 600 345 678",
        "city": "Marrakech",
        "region": "Marrakech-Safi",
    },
    {
        "email": "fatima.bensouda@example.com",
        "password": "client123",
        "first_name": "Fatima",
        "last_name": "Bensouda",
        "phone": "+212 600 456 789",
        "city": "Tangier",
        "region": "Tanger-Tétouan-Al Hoceïma",
    },
    {
        "email": "youssef.mansouri@example.com",
        "password": "client123",
        "first_name": "Youssef",
        "last_name": "Mansouri",
        "phone": "+212 600 567 890",
        "city": "Fez",
        "region": "Fès-Meknès",
    },
    {
        "email": "leila.haddad@example.com",
        "password": "client123",
        "first_name": "Leila",
        "last_name": "Haddad",
        "phone": "+212 600 678 901",
        "city": "Casablanca",
        "region": "Casablanca-Settat",
    },
    {
        "email": "karim.berrada@example.com",
        "password": "client123",
        "first_name": "Karim",
        "last_name": "Berrada",
        "phone": "+212 600 789 012",
        "city": "Rabat",
        "region": "Rabat-Salé-Kénitra",
    },
    {
        "email": "sara.elouafi@example.com",
        "password": "client123",
        "first_name": "Sara",
        "last_name": "Elouafi",
        "phone": "+212 600 890 123",
        "city": "Marrakech",
        "region": "Marrakech-Safi",
    },
    {
        "email": "nabil.chakir@example.com",
        "password": "client123",
        "first_name": "Nabil",
        "last_name": "Chakir",
        "phone": "+212 600 901 234",
        "city": "Casablanca",
        "region": "Casablanca-Settat",
    },
    {
        "email": "amina.tazi@example.com",
        "password": "client123",
        "first_name": "Amina",
        "last_name": "Tazi",
        "phone": "+212 600 012 345",
        "city": "Rabat",
        "region": "Rabat-Salé-Kénitra",
    },
]


# ============================================================================
# SEED FUNCTIONS
# ============================================================================

def create_tables():
    """Create all tables if they don't exist"""
    print("\n📋 Creating tables if they don't exist...")
    Base.metadata.create_all(bind=engine)
    print("   ✓ Tables ready")

def seed_database():
    """Main seeding function"""
    print("\n" + "=" * 60)
    print("🌱 SEEDING LAWYERLINK DATABASE")
    print("=" * 60)

    # First, create tables
    create_tables()

    db = SessionLocal()
    credentials = {"users": []}

    try:
        # Clear existing data (order matters due to foreign keys)
        print("\n📦 Clearing existing data...")
        db.query(RecommendationLog).delete()
        db.query(Review).delete()
        db.query(ChatMessage).delete()
        db.query(ChatSession).delete()
        db.query(Reservation).delete()
        db.query(BoostPayment).delete()
        db.query(PaymentTransaction).delete()
        db.query(Subscription).delete()
        db.query(Lawyer).delete()
        db.query(Client).delete()
        db.query(User).filter(User.role != "admin").delete()
        db.commit()
        print("   ✓ Existing data cleared")

        # ====================================================================
        # CREATE ADMIN
        # ====================================================================
        print("\n👑 Creating admin user...")
        admin = User(
            email="admin@lawyerlink.com",
            password_hash=hash_password("admin123"),
            role=Role.admin,
            city="Casablanca",
            region="Casablanca-Settat",
        )
        db.add(admin)
        db.flush()
        credentials["users"].append({
            "role": "admin",
            "email": "admin@lawyerlink.com",
            "password": "admin123",
            "id": admin.id
        })
        print("   ✓ Admin created: admin@lawyerlink.com / admin123")

        # ====================================================================
        # CREATE LAWYERS
        # ====================================================================
        print(f"\n⚖️ Creating {len(LAWYERS)} lawyers...")
        lawyer_objects = []

        for i, lawyer_data in enumerate(LAWYERS):
            # Create User
            user = User(
                email=lawyer_data["email"],
                password_hash=hash_password(lawyer_data["password"]),
                role=Role.lawyer,
                city=lawyer_data.get("city", ""),
                region=lawyer_data.get("region", ""),
            )
            db.add(user)
            db.flush()

            # Create Lawyer profile
            specialties_json = json.dumps(lawyer_data["specialties"])

            lawyer = Lawyer(
                user_id=user.id,
                first_name=lawyer_data["first_name"],
                last_name=lawyer_data["last_name"],
                firm=lawyer_data["firm"],
                license_number=lawyer_data["license_number"],
                specialties=specialties_json,
                languages=lawyer_data["languages"],
                hourly_rate=lawyer_data["hourly_rate"],
                rating_avg=lawyer_data.get("rating_avg", None),
                rating_count=lawyer_data.get("rating_count", 0),
                city=lawyer_data.get("city", ""),
                region=lawyer_data.get("region", ""),
                is_active=lawyer_data["is_active"],
            )
            db.add(lawyer)
            db.flush()

            lawyer_objects.append({
                "user": user,
                "lawyer": lawyer,
                "data": lawyer_data
            })

            credentials["users"].append({
                "role": "lawyer",
                "email": lawyer_data["email"],
                "password": lawyer_data["password"],
                "id": user.id,
                "name": f"{lawyer_data['first_name']} {lawyer_data['last_name']}"
            })
            print(f"   ✓ Lawyer: {lawyer_data['first_name']} {lawyer_data['last_name']} ({lawyer_data['email']})")

        # ====================================================================
        # CREATE CLIENTS
        # ====================================================================
        print(f"\n👥 Creating {len(CLIENTS)} clients...")
        client_objects = []

        for client_data in CLIENTS:
            # Create User
            user = User(
                email=client_data["email"],
                password_hash=hash_password(client_data["password"]),
                role=Role.client,
                city=client_data.get("city", ""),
                region=client_data.get("region", ""),
            )
            db.add(user)
            db.flush()

            # Create Client profile
            client = Client(
                user_id=user.id,
                first_name=client_data["first_name"],
                last_name=client_data["last_name"],
                phone=client_data["phone"],
            )
            db.add(client)
            db.flush()

            client_objects.append({
                "user": user,
                "client": client,
                "data": client_data
            })

            credentials["users"].append({
                "role": "client",
                "email": client_data["email"],
                "password": client_data["password"],
                "id": user.id,
                "name": f"{client_data['first_name']} {client_data['last_name']}"
            })
            print(f"   ✓ Client: {client_data['first_name']} {client_data['last_name']} ({client_data['email']})")

        # ====================================================================
        # CREATE SUBSCRIPTIONS (for lawyers)
        # ====================================================================
        print("\n📅 Creating subscriptions for lawyers...")
        today = datetime.now().date()

        for lawyer_obj in lawyer_objects[:8]:  # First 8 lawyers have active subscriptions
            end_date = today + timedelta(days=30)
            subscription = Subscription(
                lawyer_id=lawyer_obj["lawyer"].user_id,
                start_date=today,
                end_date=end_date,
                status=SubscriptionStatus.active,
            )
            db.add(subscription)
        db.flush()
        print("   ✓ Created subscriptions for 8 lawyers")

        # Expired subscription for lawyer 9
        if len(lawyer_objects) > 8:
            expired_sub = Subscription(
                lawyer_id=lawyer_objects[8]["lawyer"].user_id,
                start_date=today - timedelta(days=60),
                end_date=today - timedelta(days=30),
                status=SubscriptionStatus.expired,
            )
            db.add(expired_sub)
            print("   ✓ Created expired subscription for 1 lawyer")

        # ====================================================================
        # CREATE BOOST PAYMENTS
        # ====================================================================
        print("\n🚀 Creating boost payments...")
        now = datetime.now(timezone.utc)

        # Active boosts for top lawyers
        for i, lawyer_obj in enumerate(lawyer_objects[:3]):
            boost = BoostPayment(
                lawyer_id=lawyer_obj["lawyer"].user_id,
                amount=Decimal("49.00") * (i + 1),
                boost_level=i + 1,
                starts_at=now,
                expires_at=now + timedelta(days=7),
            )
            db.add(boost)

        # Expired boost
        if len(lawyer_objects) > 4:
            expired_boost = BoostPayment(
                lawyer_id=lawyer_objects[4]["lawyer"].user_id,
                amount=Decimal("98.00"),
                boost_level=2,
                starts_at=now - timedelta(days=14),
                expires_at=now - timedelta(days=7),
            )
            db.add(expired_boost)
        db.flush()
        print("   ✓ Created 3 active boosts + 1 expired boost")

        # ====================================================================
        # CREATE RESERVATIONS
        # ====================================================================
        print("\n📆 Creating reservations...")
        now_dt = datetime.now()

        reservations_data = [
            # Past completed reservations
            (client_objects[0], lawyer_objects[0], -5, ReservationStatus.completed, "Initial consultation for divorce proceedings"),
            (client_objects[1], lawyer_objects[1], -3, ReservationStatus.completed, "Merger document review"),
            (client_objects[2], lawyer_objects[2], -7, ReservationStatus.completed, "Criminal case strategy session"),
            (client_objects[3], lawyer_objects[3], -2, ReservationStatus.completed, "Real estate contract review"),
            (client_objects[4], lawyer_objects[4], -4, ReservationStatus.completed, "Trademark registration consultation"),

            # Pending reservations
            (client_objects[5], lawyer_objects[0], 2, ReservationStatus.pending, "Child custody modification"),
            (client_objects[6], lawyer_objects[1], 3, ReservationStatus.pending, "Venture capital term sheet review"),
            (client_objects[7], lawyer_objects[5], 4, ReservationStatus.pending, "Employment dispute"),

            # Accepted reservations
            (client_objects[8], lawyer_objects[6], 1, ReservationStatus.accepted, "Property dispute consultation"),
            (client_objects[9], lawyer_objects[7], 5, ReservationStatus.accepted, "Tax audit representation"),

            # Rejected and cancelled
            (client_objects[0], lawyer_objects[8] if len(lawyer_objects) > 8 else lawyer_objects[0], -1, ReservationStatus.rejected, "Human rights case"),
            (client_objects[1], lawyer_objects[9] if len(lawyer_objects) > 9 else lawyer_objects[1], 6, ReservationStatus.cancelled, "International arbitration"),
        ]

        for client_obj, lawyer_obj, day_offset, status, notes in reservations_data:
            reservation_date = now_dt + timedelta(days=day_offset)
            # Set time to business hours (10 AM if future, or keep original if past)
            if day_offset >= 0:
                reservation_date = reservation_date.replace(hour=10, minute=0, second=0, microsecond=0)

            reservation = Reservation(
                client_id=client_obj["client"].user_id,
                lawyer_id=lawyer_obj["lawyer"].user_id,
                reservation_date=reservation_date,
                status=status,
                notes=notes,
            )
            db.add(reservation)
            db.flush()

            # Create reviews for completed reservations
            if status == ReservationStatus.completed:
                rating = 5 if lawyer_obj["lawyer"].rating_avg and lawyer_obj["lawyer"].rating_avg >= Decimal("4.5") else 4
                review = Review(
                    client_id=client_obj["client"].user_id,
                    lawyer_id=lawyer_obj["lawyer"].user_id,
                    reservation_id=reservation.id,
                    rating=rating,
                    comment=f"Excellent legal service. {lawyer_obj['lawyer'].first_name} was very professional and thorough.",
                )
                db.add(review)

        db.flush()
        print(f"   ✓ Created {len(reservations_data)} reservations")

        # ====================================================================
        # CREATE CHAT SESSIONS AND MESSAGES
        # ====================================================================
        print("\n💬 Creating chat sessions and messages...")

        chat_conversations = [
            {
                "client": client_objects[0],
                "specialty": "family law",
                "location": "Casablanca",
                "messages": [
                    ("client", "I need help with a divorce case. My spouse and I have been separated for 6 months."),
                    ("ai", "I understand this is a difficult time. Could you tell me which city you're in?"),
                    ("client", "I'm in Casablanca."),
                    ("ai", "Thank you. Is this related to family law, specifically divorce proceedings?"),
                    ("client", "Yes, exactly. We have two children and some property to divide."),
                    ("ai", "Do you have a preferred language for your lawyer?"),
                    ("client", "English or French is fine."),
                    ("ai", "Do you have a budget in mind for the hourly rate?"),
                    ("client", "Around 300-400 MAD per hour would be ideal."),
                    ("ai", "Great, shall I find you the best available lawyers now?"),
                    ("client", "Yes please, that would be great."),
                ]
            },
            {
                "client": client_objects[1],
                "specialty": "corporate law",
                "location": "Rabat",
                "messages": [
                    ("client", "I need a lawyer to review a merger agreement for my startup."),
                    ("ai", "I can help with that. Which city are you in?"),
                    ("client", "Rabat."),
                    ("ai", "Is this related to corporate law, specifically mergers and acquisitions?"),
                    ("client", "Yes, we're being acquired by a larger company."),
                    ("ai", "Do you have a preferred language for your lawyer?"),
                    ("client", "English is preferred."),
                    ("ai", "Great! I'll find you the best corporate lawyers in Rabat."),
                ]
            },
            {
                "client": client_objects[2],
                "specialty": "criminal defense",
                "location": "Marrakech",
                "messages": [
                    ("client", "I've been charged with a white-collar crime and need representation."),
                    ("ai", "I'm sorry to hear that. Which city are you located in?"),
                    ("client", "Marrakech."),
                    ("ai", "Is this a criminal defense matter?"),
                    ("client", "Yes, it's related to business financial issues."),
                    ("ai", "Do you have a preferred language for your lawyer?"),
                    ("client", "French is best."),
                    ("ai", "Understood. Shall I find you the top criminal defense lawyers in Marrakech?"),
                    ("client", "Yes, please do."),
                ]
            },
        ]

        for conv in chat_conversations:
            # Create session
            session = ChatSession(
                client_id=conv["client"]["client"].user_id,
            )
            db.add(session)
            db.flush()

            # Add messages
            for sender, content in conv["messages"]:
                message = ChatMessage(
                    session_id=session.id,
                    sender=SenderEnum(sender),
                    content=content,
                )
                db.add(message)

            # Add search tag for recommendations (simulate AI search)
            search_tag_message = ChatMessage(
                session_id=session.id,
                sender=SenderEnum.ai,
                content=f"[SEARCH_LAWYERS:{conv['specialty']}:{conv['location']}]\nI'm searching for the best lawyers for your case.",
            )
            db.add(search_tag_message)

        db.flush()
        print(f"   ✓ Created {len(chat_conversations)} chat sessions")

        # ====================================================================
        # COMMIT ALL CHANGES
        # ====================================================================
        db.commit()
        print("\n" + "=" * 60)
        print("✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!")
        print("=" * 60)

        # Save credentials to file
        save_credentials(credentials)

        # Print summary
        print("\n📊 SEEDING SUMMARY:")
        print(f"   • Admin users: 1")
        print(f"   • Lawyers: {len(lawyer_objects)}")
        print(f"   • Clients: {len(client_objects)}")
        print(f"   • Active subscriptions: 8")
        print(f"   • Active boosts: 3")
        print(f"   • Reservations: {len(reservations_data)}")
        print(f"   • Chat sessions: {len(chat_conversations)}")

        return True

    except Exception as e:
        db.rollback()
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    success = seed_database()
    sys.exit(0 if success else 1)