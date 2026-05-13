
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.user.model import User, Client
from app.lawyer.model import Lawyer
from app.reservation.model import Reservation, ReservationStatus
from app.review.model import Review
from app.review.schema import ReviewCreate, ReviewUpdate, ReviewResponse, ReviewWithClientResponse

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("/", response_model=ReviewResponse)
def create_review(
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.value != "client":
        raise HTTPException(403, "only clients can leave reviews")
    client = db.query(Client).filter(Client.user_id == current_user.id).first()
    if not client:
        raise HTTPException(404, "client profile not found")

    lawyer = db.query(Lawyer).filter(Lawyer.user_id == data.lawyer_id).first()
    if not lawyer:
        raise HTTPException(404, "lawyer not found")

    existing = db.query(Review).filter(
        Review.client_id == client.user_id,
        Review.lawyer_id == data.lawyer_id,
    ).first()
    if existing:
        raise HTTPException(
            409,
            "You already reviewed this lawyer. Use PATCH to update your review.",
        )

    has_completed = db.query(Reservation).filter(
        Reservation.client_id == client.user_id,
        Reservation.lawyer_id == data.lawyer_id,
        Reservation.status == ReservationStatus.completed,
    ).first()
    if not has_completed:
        raise HTTPException(
            400,
            "You must have at least one completed consultation with this lawyer before reviewing.",
        )

    review = Review(
        client_id=client.user_id,
        lawyer_id=data.lawyer_id,
        rating=data.rating,
        comment=data.comment,
        is_anonymous=data.is_anonymous,
    )
    db.add(review)
    db.flush()

    _recalc_lawyer_rating(db, data.lawyer_id)

    db.commit()
    db.refresh(review)
    return review


@router.get("/lawyer/{lawyer_id}", response_model=list[ReviewWithClientResponse])
def get_lawyer_reviews(
    lawyer_id: int,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    lawyer = db.query(Lawyer).filter(Lawyer.user_id == lawyer_id).first()
    if not lawyer:
        raise HTTPException(404, "lawyer profile not found")
    reviews = (
        db.query(Review)
        .filter(Review.lawyer_id == lawyer_id)
        .order_by(Review.created_at.desc())
        .limit(limit)
        .all()
    )

    result = []
    for review in reviews:
        client = db.query(Client).filter(Client.user_id == review.client_id).first()
        client_user = db.query(User).filter(User.id == review.client_id).first() if client else None
        is_anon = review.is_anonymous
        result.append(
            ReviewWithClientResponse(
                id=review.id,
                client_id=review.client_id,
                lawyer_id=review.lawyer_id,
                rating=review.rating,
                comment=review.comment,
                is_anonymous=is_anon,
                created_at=review.created_at,
                updated_at=review.updated_at,
                client_first_name=None if is_anon else (client.first_name if client else None),
                client_last_name=None if is_anon else (client.last_name if client else None),
                client_image_url=None if is_anon else (client_user.image_url if client_user else None),
            )
        )
    return result


@router.get("/me", response_model=list[ReviewResponse])
def get_my_reviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.value != "client":
        raise HTTPException(403, "only clients can access their reviews")
    client = db.query(Client).filter(Client.user_id == current_user.id).first()
    if not client:
        raise HTTPException(404, "client profile not found")
    reviews = (
        db.query(Review)
        .filter(Review.client_id == client.user_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    return reviews


@router.get("/me/lawyer/{lawyer_id}", response_model=Optional[ReviewResponse])
def get_my_review_for_lawyer(
    lawyer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.value != "client":
        raise HTTPException(403, "only clients can access their reviews")
    client = db.query(Client).filter(Client.user_id == current_user.id).first()
    if not client:
        raise HTTPException(404, "client profile not found")
    review = (
        db.query(Review)
        .filter(
            Review.client_id == client.user_id,
            Review.lawyer_id == lawyer_id,
        )
        .first()
    )
    return review


@router.get("/me/can-review/{lawyer_id}")
def can_review_lawyer(
    lawyer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.value != "client":
        return {"can_review": False, "has_review": False, "review_id": None}
    client = db.query(Client).filter(Client.user_id == current_user.id).first()
    if not client:
        return {"can_review": False, "has_review": False, "review_id": None}

    has_completed = (
        db.query(Reservation)
        .filter(
            Reservation.client_id == client.user_id,
            Reservation.lawyer_id == lawyer_id,
            Reservation.status == ReservationStatus.completed,
        )
        .first()
        is not None
    )

    existing_review = (
        db.query(Review)
        .filter(
            Review.client_id == client.user_id,
            Review.lawyer_id == lawyer_id,
        )
        .first()
    )

    return {
        "can_review": has_completed,
        "has_review": existing_review is not None,
        "review_id": existing_review.id if existing_review else None,
    }


@router.patch("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    update: ReviewUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.value != "client":
        raise HTTPException(403, "only clients can update reviews")
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(404, "review not found")
    client = db.query(Client).filter(Client.user_id == current_user.id).first()
    if review.client_id != client.user_id:
        raise HTTPException(403, "Not your review")

    changed = False
    if update.comment is not None:
        review.comment = update.comment
        changed = True
    if update.rating is not None:
        review.rating = update.rating
        changed = True
    if update.is_anonymous is not None:
        review.is_anonymous = update.is_anonymous
        changed = True
    if not changed:
        raise HTTPException(400, "No fields to update")

    review.updated_at = datetime.utcnow()
    _recalc_lawyer_rating(db, review.lawyer_id)

    db.commit()
    db.refresh(review)
    return review


@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.value != "client":
        raise HTTPException(403, "only clients can delete reviews")
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(404, "review not found")
    client = db.query(Client).filter(Client.user_id == current_user.id).first()
    if review.client_id != client.user_id:
        raise HTTPException(403, "Not your review")

    lawyer_id = review.lawyer_id
    db.delete(review)
    _recalc_lawyer_rating(db, lawyer_id)

    db.commit()
    return {"message": "Review deleted successfully"}


@router.get("/admin/all", response_model=list[ReviewResponse])
def get_all_reviews(
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.value != "admin":
        raise HTTPException(403, "Admin access required")
    reviews = db.query(Review).order_by(Review.created_at.desc()).limit(limit).all()
    return reviews


def _recalc_lawyer_rating(db: Session, lawyer_id: int):
    lawyer = db.query(Lawyer).filter(Lawyer.user_id == lawyer_id).first()
    if not lawyer:
        return
    all_reviews = db.query(Review).filter(Review.lawyer_id == lawyer_id).all()
    if all_reviews:
        total = sum(r.rating for r in all_reviews)
        lawyer.rating_avg = total / len(all_reviews)
        lawyer.rating_count = len(all_reviews)
    else:
        lawyer.rating_avg = None
        lawyer.rating_count = 0
