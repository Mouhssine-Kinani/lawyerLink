from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date, datetime

from app.core.database import get_db
from app.core.dependencies import require_role
from app.user.model import User
from app.lawyer.model import Lawyer
from app.review.model import Review
from app.review.schema import ReviewResponse
from app.reservation.model import Reservation, ReservationStatus
from app.reservation.schema import ReservationUpdate, ReservationResponse
from app.payment.model import PaymentTransaction, PaymentType, PaymentStatus
from app.user.model import Client

router = APIRouter(prefix="/lawyer", tags=["Lawyer"])


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
