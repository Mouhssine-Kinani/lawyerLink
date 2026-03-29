from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.user.model import User
from app.user.schema import UserResponse

router = APIRouter(prefix="/users",tags=["Users"])

@router.get("/me",response_model=UserResponse)
def get_current_user_profile(current_user:User = Depends(get_current_user),db:Session = Depends(get_db)):
    if current_user.role.value == "client" and current_user.client_profile:
        return UserResponse(
            id=current_user.id,
            email=current_user.email,
            role=current_user.role.value,
            image_url=current_user.image_url,
            created_at=str(current_user.created_at)
        )
    # elif current_user.role.value == "lawyer" and current_user.lawyer_profile:
    #     return UserResponse(
    #         id=current_user.id,
    #         email=current_user.email,
    #         role=current_user.role.value,
    #         image_url=current_user.image_url,
    #         created_at=str(current_user.created_at)
    #     )
    else:
        return UserResponse(
            id=current_user.id,
            email=current_user.email,
            role=current_user.role.value,
            image_url=current_user.image_url,
            created_at=str(current_user.created_at)
        )