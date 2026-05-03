from fastapi import APIRouter, Depends, UploadFile, File, HTTPException,BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.upload import save_profile_picture, delete_profile_picture
from app.user.model import User
from app.user.schema import UserResponse, UserFullResponse, ClientResponse, LawyerResponse

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
@router.get("/me", response_model=UserFullResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.refresh(current_user, ['client_profile', 'lawyer_profile'])
    
    client_data = None
    lawyer_data = None
    
    if current_user.role.value == "client" and current_user.client_profile:
        client_data = ClientResponse(
            first_name=current_user.client_profile.first_name,
            last_name=current_user.client_profile.last_name,
            phone=current_user.client_profile.phone,
            user_id=current_user.client_profile.user_id
        )
    elif current_user.role.value == "lawyer" and current_user.lawyer_profile:
        lawyer_data = LawyerResponse(
            first_name=current_user.lawyer_profile.first_name,
            last_name=current_user.lawyer_profile.last_name,
            firm=current_user.lawyer_profile.firm,
            license_number=current_user.lawyer_profile.license_number,
            specialties=current_user.lawyer_profile.specialties,
            languages=current_user.lawyer_profile.languages,
            hourly_rate=float(current_user.lawyer_profile.hourly_rate) if current_user.lawyer_profile.hourly_rate else None,
            rating_avg=float(current_user.lawyer_profile.rating_avg) if current_user.lawyer_profile.rating_avg else None,
            rating_count=current_user.lawyer_profile.rating_count,
            city=current_user.lawyer_profile.city,
            region=current_user.lawyer_profile.region,
            is_active=current_user.lawyer_profile.is_active,
            user_id=current_user.lawyer_profile.user_id
        )
    
    return UserFullResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role.value,
        city=current_user.city,
        region=current_user.region,
        image_url=current_user.image_url,
        created_at=current_user.created_at,
        client_profile=client_data,
        lawyer_profile=lawyer_data
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
