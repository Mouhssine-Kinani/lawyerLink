from fastapi import APIRouter, Depends, UploadFile, File, HTTPException,BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.upload import save_profile_picture, delete_profile_picture
from app.user.model import User
from app.user.schema import UserResponse

from app.core.blacklist import TokenBlacklist
from app.chat.model import ChatSession, ChatMessage
from app.reservation.model import Reservation
from app.review.model import Review
from app.recommendation.model import RecommendationLog
from app.payment.model import Subscription, BoostPayment, PaymentTransaction
from app.auth.password_reset import PasswordResetToken

from app.user.model import Client
from app.lawyer.model import Lawyer

router = APIRouter(prefix="/users", tags=["Users"])

# profile routes:
@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role.value,
        city=current_user.city,
        region=current_user.region,
        image_url=current_user.image_url,
        created_at=current_user.created_at
    )


@router.post("/me/image", response_model=UserResponse)
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.image_url:
        delete_profile_picture(current_user.image_url)
    
    role = current_user.role.value
    image_url = await save_profile_picture(file, role)
    
    current_user.image_url = image_url
    db.commit()
    db.refresh(current_user)
    
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role.value,
        city=current_user.city,
        region=current_user.region,
        image_url=current_user.image_url,
        created_at=current_user.created_at
    )


@router.delete("/me/image", response_model=UserResponse)
def delete_profile_image(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.image_url:
        delete_profile_picture(current_user.image_url)
        current_user.image_url = None
        db.commit()
        db.refresh(current_user)
    
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role.value,
        city=current_user.city,
        region=current_user.region,
        image_url=current_user.image_url,
        created_at=current_user.created_at
    )


#Deletion Cascade:

def cleanup_user_data(user_id: int, db: Session):
    # we delete child records first and then parents
    
    # 1. Delete chat messages and sessions
    sessions = db.query(ChatSession).filter(ChatSession.client_id == user_id).all()
    for session in sessions:
        db.query(ChatMessage).filter(ChatMessage.session_id == session.id).delete()
        db.delete(session)
    
    # 2. Delete reviews (client's reviews)
    db.query(Review).filter(Review.client_id == user_id).delete()
    
    # 3. Delete recommendation logs
    db.query(RecommendationLog).filter(RecommendationLog.client_id == user_id).delete()
    
    # 4. Delete password reset tokens
    db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user_id).delete()
    
    # 5. Delete reservations (as client)
    db.query(Reservation).filter(Reservation.client_id == user_id).delete()
    
    # 6. If user is a lawyer, delete lawyer-specific data
    user = db.query(User).filter(User.id == user_id).first()
    if user and user.role.value == "lawyer":
        db.query(Subscription).filter(Subscription.lawyer_id == user_id).delete()
        db.query(BoostPayment).filter(BoostPayment.lawyer_id == user_id).delete()
        # Delete reservations as lawyer
        db.query(Reservation).filter(Reservation.lawyer_id == user_id).delete()
        # Delete reviews about this lawyer (or we can keep them as anonymous)
        # db.query(Review).filter(Review.lawyer_id == user_id).delete()
        
        # Delete lawyer profile (cascade handled by FK)
        db.query(Lawyer).filter(Lawyer.user_id == user_id).delete()
    
    # 7. If user is a client, delete client profile
    elif user and user.role.value == "client":
        db.query(Client).filter(Client.user_id == user_id).delete()
    
    # 8. Delete payment transactions
    db.query(PaymentTransaction).filter(PaymentTransaction.payer_id == user_id).delete()
    
    # 9. Finally, delete the user
    user_to_delete = db.query(User).filter(User.id == user_id).first()
    if user_to_delete:
        db.delete(user_to_delete)
    
    db.commit()


@router.delete("/me")
def delete_account(current_user: User = Depends(get_current_user),db: Session = Depends(get_db)):
    user_id = current_user.id
    
    # Store user info for response (optional)
    user_email = current_user.email
    
    # Delete all user-related data
    cleanup_user_data(user_id, db)
    
    return {
        "message": f"Account {user_email} has been permanently deleted.",
        "deleted_user_id": user_id
    }
