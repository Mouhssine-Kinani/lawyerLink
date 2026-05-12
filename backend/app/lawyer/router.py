from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date, datetime

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
from app.user.model import Client

router = APIRouter(prefix="/lawyer", tags=["Lawyer"])


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
