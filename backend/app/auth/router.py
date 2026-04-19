from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password,verify_password,create_access_token
from app.auth.schema import RegisterRequest,LoginRequest,TokenResponse
from app.user.model import User,Client,Role
from app.lawyer.model import Lawyer

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



