
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.user.model import User, Client
from app.lawyer.model import Lawyer
from app.reservation.model import Reservation, ReservationStatus
from app.review.model import Review
from app.review.schema import ReviewCreate, ReviewUpdate, ReviewResponse, ReviewWithClientResponse

router = APIRouter(prefix="/reviews",tags=["Reviews"])

# ──────────────────────────────────────────────────────────────
# CREATE REVIEW (Client only, after reservation was completed)
# ──────────────────────────────────────────────────────────────

@router.post("/",response_model=ReviewResponse)
def create_review(data:ReviewCreate,current_user:User = Depends(get_current_user),db:Session = Depends(get_db)):
    # verify user is a client
    if current_user.role.value != "client":
        raise HTTPException(403,"only clients can leave reviews")
    # verify client exists
    client = db.query(Client).filter(Client.user_id == current_user.id).first()
    if not client:
        raise HTTPException(404,"client profile not found")
    # verify reservation exists
    reservation = db.query(Reservation).filter(Reservation.id == data.reservation_id).first()
    if not reservation:
        raise HTTPException(404,"reservation not found")
    # verify reservation belongs to this client
    if client.user_id != reservation.client_id:
        raise HTTPException(404,"Not your reservation")
    # Only completed reservations can be reviewed
    if reservation.status != ReservationStatus.completed:
        raise HTTPException(400, "Can only review completed reservations")
    
    # Check if already reviewed
    existing = db.query(Review).filter(Review.reservation_id == data.reservation_id).first()
    if existing:
        raise HTTPException(409, "You already reviewed this reservation")
    
    review = Review(
        client_id = client.user_id,
        lawyer_id = reservation.lawyer_id,
        reservation_id = reservation.id,
        rating = data.rating,
        comment = data.comment
    )
    db.add(review)
    #calculate lawyer ratings(udpate ratings)
    lawyer = db.query(Lawyer).filter(Lawyer.user_id == reservation.lawyer_id).first()
    all_reviews = db.query(Review).filter(Review.lawyer_id == lawyer.user_id).all()

    total_ratings  = sum(r.rating for r in all_reviews) + data.rating
    count = len(all_reviews) + 1
    lawyer.rating_avg = total_ratings
    lawyer.rating_count = count

    db.commit()
    db.refresh(review)

    return review

# ──────────────────────────────────────────────────────────────
# GET REVIEWS FOR A LAWYER (Public - anyone can see regardless of role)
# ──────────────────────────────────────────────────────────────

@router.get("/lawyer/{lawyer_id}",response_model=list[ReviewWithClientResponse])
def get_lawyer_reviews(lawyer_id:int,limit:int = Query(50,ge = 1,le = 100),db:Session = Depends(get_db)):
    lawyer = db.query(Lawyer).filter(Lawyer.user_id == lawyer_id).first()
    if not lawyer:
        raise HTTPException(404,"lawyer profile not found")
    reviews = db.query(Review).filter(Review.lawyer_id == lawyer_id).order_by(Review.created_at.desc()).limit(limit).all()

    result = []
    for review in reviews:
        client = db.query(Client).filter(Client.user_id == review.client_id).first()
        client_user = db.query(User).filter(User.id == review.client_id).first() if client else None
        result.append(ReviewWithClientResponse(
            id=review.id,
            client_id=review.client_id,
            lawyer_id=review.lawyer_id,
            reservation_id=review.reservation_id,
            rating=review.rating,
            comment=review.comment,
            created_at=review.created_at,
            client_first_name=client.first_name if client else None,
            client_last_name=client.last_name if client else None,
            client_image_url=client_user.image_url if client_user else None
        ))
    return result

# ──────────────────────────────────────────────────────────────
# GET CURRENT CLIENT'S REVIEWS (Private)
# ──────────────────────────────────────────────────────────────
@router.get("/me",response_model=list[ReviewResponse])
def get_my_reviews(current_user:User = Depends(get_current_user),db:Session = Depends(get_db)):
    if current_user.role.value != "client":
        raise HTTPException(403,"only clients can access their reviews")
    client = db.query(Client).filter(Client.user_id == current_user.id).first()
    if not client:
        raise HTTPException(404,"client profile not found")
    reviews = db.query(Review).filter(Review.client_id == client.user_id).order_by(Review.created_at.desc()).all()
    return reviews

# ──────────────────────────────────────────────────────────────
# GET REVIEW BY RESERVATION ID
# ──────────────────────────────────────────────────────────────

@router.get("/reservation/{reservation_id}",response_model=ReviewResponse)
def get_review_by_reservation(reservation_id:int,current_user:User = Depends(get_current_user),db:Session = Depends(get_db)):
    # Get the reservation
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(404, "Reservation not found")
    
    # Get the review
    review = db.query(Review).filter(Review.reservation_id == reservation_id).first()
    if not review:
        raise HTTPException(404, "No review found for this reservation")
    
    if current_user.role.value == "client":
        client = db.query(Client).filter(Client.user_id == current_user.id).first()
        if review.client_id != client.user_id:
            raise HTTPException(403,"not your reservation")
    elif current_user.role.value == "lawyer":
        if review.lawyer_id != current_user.id:
            raise HTTPException(403,"not your reservation")
    else:
        raise HTTPException(403,"Invalid role")
    
    return review


# ──────────────────────────────────────────────────────────────
# UPDATE REVIEW (Client only, within time limit)
# ──────────────────────────────────────────────────────────────
@router.patch("/{review_id}",response_model=ReviewResponse)
def update_review(review_id:int,update: ReviewUpdate,current_user:User = Depends(get_current_user),db:Session = Depends(get_db)):
    if current_user.role.value != "client":
        raise HTTPException(403,"only clients can update reviews")
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(403,"review not found")
    client = db.query(Client).filter(Client.user_id == current_user.id).first()
    if review.client_id != client.user_id:
        raise HTTPException(403, "Not your review")
    # check if within edit window(7 days old)
    days_since_creation = (datetime.utcnow() - review.created_at).days
    if days_since_creation > 7:
        raise HTTPException(400,"reviews can only be edited whithin 7 days of creation")
    changed = False
    # update each field that was filled from ReviewUpdate
    if update.comment is not None:
        review.comment = update.comment
        changed = True
    if update.rating is not None:
        review.rating = update.rating
        changed = True
    if not changed:
        raise HTTPException(400,"No fields to update")
    # calculate rating for lawyer again
    lawyer = db.query(Lawyer).filter(Lawyer.user_id == review.lawyer_id).first()
    all_reviews = db.query(Review).filter(Review.lawyer_id == lawyer.user_id).all()
    total_ratings = sum(r.rating for r in all_reviews)
    count = len(all_reviews)

    lawyer.rating_avg = total_ratings/count

    db.commit()
    db.refresh(review)
    return review

# ──────────────────────────────────────────────────────────────
# DELETE REVIEW (Client only, within time limit)
# ──────────────────────────────────────────────────────────────
@router.delete("/{review_id}")
def delete_review(review_id:int,current_user:User = Depends(get_current_user),db:Session = Depends(get_db)):
    if current_user.role.value != "client":
        raise HTTPException(403,"only clients can update reviews")
    
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(403,"review not found")
    client = db.query(Client).filter(Client.user_id == current_user.id).first()
    if review.client_id != client.user_id:
        raise HTTPException(403, "Not your review")

    # check if within edit window(7 days old)
    days_since_creation = (datetime.utcnow() - review.created_at).days
    if days_since_creation > 7:
        raise HTTPException(400,"reviews can only be edited whithin 7 days of creation")

    # store lawyer_id before deleting the review since we will need it
    lawyer_id = review.lawyer_id
    # delete the review
    db.delete(review)
    # recalculate rating of lawyer
    lawyer = db.query(Lawyer).filter(Lawyer.user_id == lawyer_id).first()
    
    remaining_reviews = db.query(Review).filter(Review.lawyer_id == lawyer_id).all()
    if remaining_reviews:
        total_ratings = sum(r.rating for r in remaining_reviews)
        count = len(remaining_reviews)
        lawyer.rating_avg = total_ratings / count
        lawyer.rating_count = count
    else:
        lawyer.rating_avg = None
        lawyer.rating_count = 0

    db.commit()
    return {"message":"Review deleted successfully"}

# ──────────────────────────────────────────────────────────────
# ADMIN: GET ALL REVIEWS 
# ──────────────────────────────────────────────────────────────
@router.get("/admin/all",response_model=list[ReviewResponse])
def get_all_reviews(limit:int = Query(100,ge=1,le=100),current_user:User = Depends(get_current_user),db:Session = Depends(get_db)):
    if current_user.role.value != "admin":
        raise HTTPException(403, "Admin access required")
    reviews = db.query(Review).order_by(Review.created_at.desc()).limit(limit).all()
    return reviews

