from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.upload import save_profile_picture, delete_profile_picture
from app.user.model import User
from app.user.schema import UserResponse

router = APIRouter(prefix="/users", tags=["Users"])


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