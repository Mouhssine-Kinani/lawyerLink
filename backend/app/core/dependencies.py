from fastapi import HTTPException,Depends,status
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.user.model import User
from app.chat.model import ChatSession

security = HTTPBearer()

def get_current_user(credentials:HTTPAuthorizationCredentials = Depends(security),db:Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="invalid token: missing user_id")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail=str(e))
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="User not found")
    return user

def require_role(required_role:str):
    """create a dependency that checks if user has the required role to access an endpoint"""
    def role_checker(current_user:User = Depends(get_current_user)):
        if current_user.role.value != required_role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail=f"permission denied, Required role:{required_role}")
        return current_user
    return role_checker


def get_client_session(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_role("client"))):
    """Dependency that verifies the session belongs to the client"""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.client_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found or access denied")
    return session



