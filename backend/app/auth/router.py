from fastapi import APIRouter,Depends,HTTPException,status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password,verify_password,create_access_token
from app.core.dependencies import security
from app.core.blacklist import TokenBlacklist
from app.auth.schema import RegisterRequest,LoginRequest,TokenResponse
from app.user.model import User,Client,Role
from app.lawyer.model import Lawyer
from app.auth.password_reset import PasswordResetToken
from app.user.model import User
from app.auth.schema import ForgotPasswordRequest, ResetPasswordRequest, ResetPasswordVerifyResponse


router = APIRouter(prefix="/auth",tags=["Authentication"])

@router.post("/register",status_code=status.HTTP_201_CREATED)
def register(request:RegisterRequest,db:Session = Depends(get_db)):
    # 1.check if email exists:
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Email already registered")
    # 2.hash password:
    hashed_password = hash_password(request.password)
    # 3 create User:
    user = User(
        email=request.email,
        password_hash=hashed_password,
        role=Role(request.role)
    )
    db.add(user)
    db.flush()
    # 4.create role specific record(client):
    if request.role == "client":
        client = Client(
            user_id=user.id,
            first_name=request.first_name,
            last_name=request.last_name,
            phone=request.phone
        )
        db.add(client)
    elif request.role == "lawyer":
        lawyer = Lawyer(
            user_id=user.id,
            first_name=request.first_name,
            last_name=request.last_name
        )
        db.add(lawyer)
    else:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"invalid role:{request.role} must be a 'client' or 'lawyer'"
        )
    # commit everything:
    db.commit()
    return {"message":"User created successsfuly"}

@router.post("/login",response_model=TokenResponse)
def login(request:LoginRequest,db:Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="invalid credentials")
    if not verify_password(request.password,user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="invalid credentials")
    #create token:
    token_data = {
        "sub":str(user.id),
        "role":user.role.value
    }
    access_token = create_access_token(token_data)
    #return token: 
    return TokenResponse(access_token=access_token)

@router.post("/logout")
def logout(credentials: HTTPAuthorizationCredentials = Depends(security),db: Session = Depends(get_db)):
    token = credentials.credentials
    if TokenBlacklist.black_list(token,db):
        return {"message":"successfuly logged out"}
    else:
        return {"message":"Successfuly logged out"}
    
@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    #in developement we will be receiving the reset token directly but in production we will be sending a url
    user = db.query(User).filter(User.email == request.email).first()
    
    # For security, always return success even if email doesn't exist
    # (prevents email enumeration attacks)
    if not user:
        return {
            "message": "If an account with that email exists, you will receive a password reset link.",
            "reset_token": None  # No token in production
        }
    
    # Create reset token
    raw_token, token_obj = PasswordResetToken.create_for_user(user.id, db)
    
    # we can remove this and send an actual email un production
    reset_url = f"http://localhost:5173/reset-password?token={raw_token}"
    
    return {
        "message": "Password reset link has been sent to your email.",
        "reset_token": raw_token,  # REMOVE in production!
        "reset_url": reset_url      # REMOVE in production!
    }

@router.get("/reset-password/verify", response_model=ResetPasswordVerifyResponse)
def verify_reset_token(token: str,db: Session = Depends(get_db)):
    # verify if token is valid
    try:
        reset_token = PasswordResetToken.verify_token(token, db)
        user = db.query(User).filter(User.id == reset_token.user_id).first()
        return ResetPasswordVerifyResponse(
            valid=True,
            email=user.email if user else None
        )
    except ValueError as e:
        return ResetPasswordVerifyResponse(valid=False, email=None)


@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    #reset password with a valid token
    try:
        # Verify token
        reset_token = PasswordResetToken.verify_token(request.token, db)
        
        # Get user
        user = db.query(User).filter(User.id == reset_token.user_id).first()
        if not user:
            raise ValueError("User not found")
        
        # Update password
        user.password_hash = hash_password(request.new_password)
        
        # Mark token as used
        PasswordResetToken.mark_used(reset_token, db)
        
        db.commit()
        
        return {"message": "Password has been reset successfully. You can now login with your new password."}
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )