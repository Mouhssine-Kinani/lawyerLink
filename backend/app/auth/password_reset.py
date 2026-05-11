from sqlalchemy import BigInteger,String,DateTime,ForeignKey,Column
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from app.core.security import hash_password,verify_password
from datetime import datetime,timedelta
import secrets
import hashlib
import base64


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    id = Column(BigInteger,primary_key=True,nullable= False)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    token_hash = Column(String(255),nullable=False,unique=True,index=True)
    expires_at = Column(DateTime,nullable=False)
    used = Column(BigInteger,default=0)
    created_at = Column(DateTime,server_default=func.now())
    user = relationship("User") 

    @classmethod
    def generate_token(cls) -> tuple[str,str]:
        raw_token = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode("ascii") #generate token with random bytes
        raw_token = raw_token.rstrip("=") #remove = from the token
        hashed = hashlib.sha256(raw_token.encode()).hexdigest() #hash the token to store this one in dattabase
        return raw_token,hashed

    @classmethod
    def create_for_user(cls,user_id:int,db) -> tuple[str,'PasswordResetToken']:
        db.query(cls).filter(
            cls.user_id == user_id,
            cls.used == 0,
            cls.expires_at > datetime.utcnow()
        ).delete()
        raw_token,token_hash = cls.generate_token() #generate the raw and hashed versions of the token for the user and for the database
        #make the reset token that will be given to user
        reset_token = cls(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=datetime.utcnow() + timedelta(minutes=30), 
            used=0
        )
        db.add(reset_token) 
        db.commit()
        db.refresh(reset_token)#give an automatic id to the resettoken object
        return raw_token,reset_token

    @classmethod
    def verify_token(cls,raw_token:str,db) -> 'PasswordResetToken':
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest() #hash the raw token
        #compare the hashed raw token to a hashed token from the cls table
        token = db.query(cls).filter(
            token_hash == token_hash,
            cls.used == 0,
            cls.expires_at > datetime.utcnow()
        ).first()
        if not token:
            #check if token exist but is expired
            expired_token = db.query(cls).filter(
                    cls.token_hash == token_hash,
                    cls.used == 0,
                    cls.expires_at <= datetime.utcnow()
            ).first()
            if expired_token:
                raise ValueError("Reset link has expired. Please request a new one.")
            raise ValueError("Invalid reset token.")
        return token

    @classmethod
    def mark_used(cls,token:"PasswordResetToken",db):
        #Mark a token as used (after successful password reset)
        token.used = 1
        db.commit()