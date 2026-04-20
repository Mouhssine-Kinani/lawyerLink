from sqlalchemy import Column,BigInteger,String,DateTime
from sqlalchemy.sql import func
from app.core.database import Base
from datetime import datetime,timedelta
from jose import jwt
from app.core.config import settings

class TokenBlacklist(Base):
    __tablename__ = "token_blacklist"

    id = Column(BigInteger,primary_key=True,index=True)
    jti = Column(String(255),primary_key=True,nullable=False,index=True)
    expires_at = Column(DateTime,nullable= False)
    created_at = Column(DateTime,server_default=func.now())

    #function to get the jti from tokens(jti is a special id that each token have)
    @classmethod
    def extract_jti(cls,token:str) -> str:
        # we extract the jti from the token wtihout verifying the expiry
        try:
            payload = jwt.decode(
                token,settings.SECRET_KEY,algorithms=[settings.ALGORITHM],options={"verify_exp":False} #we disable the expiry verification here
            )
            return payload.get("jti") 
        except Exception:
            return None
    
    #verify if token is in the blacklist table or not,this will be used in a lot of functions like get_user
    @classmethod
    def is_Blacklisted(cls,token:str,db) -> bool:
        jti = cls.extract_jti(token)
        if not jti:
            return False
        return db.query(cls).filter(cls.jti == jti).first() is not None
    
    #invalidate tokens by putting them in the blacklist class 
    @classmethod
    def black_list(cls,token:str,db) -> bool:
        try:
            # use decode to get expiry date too
            payload = jwt.decode(token,settings.SECRET_KEY,algorithms=[settings.ALGORITHM])
            jti = payload.get("jti")
            exp = payload.get("exp")
            if not jti:
                return False
            # verify if already blacklisted
            if cls.is_Blacklisted(token,db):
                return True
            blacklisted = cls(
                jti = jti,
                expires_at = datetime.fromtimestamp(exp) if exp else datetime.utcnow() + timedelta(days=1))#if no exp we make an expiry that end the day after
            db.add(blacklisted)
            db.commit()
        except Exception:
            return False
        
    #cleanup the blacklist table
    @classmethod
    def cleanup_expired(cls,db):
        deleted  = db.query(cls).filter(cls.expires_at <= datetime.utcnow()).delete() #filter by the tokens that already expired
        db.commit()
        return deleted