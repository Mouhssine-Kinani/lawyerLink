from dotenv import load_dotenv
import os

# load all variables from .env
load_dotenv()

class Settings():
    """Application settings loaded from environnement variables"""
    DATABASE_URL:str = os.getenv("DATABASE_URL")
    SECRET_KEY:str = os.getenv("SECRET_KEY")
    ALGORITHM:str = os.getenv("ALGORITHM","HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES:int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES",60))
    GEMINI_API_KEY:str = os.getenv("GEMINI_API_KEY","")
    MODEL:str = os.getenv("MODEL")
    ALLOWED_ORIGINS:str = os.getenv("ALLOWED_ORIGINS","http://localhost:5173")
    # upload
    UPLOAD_DIR:str = "uploads/profiles"
    MAX_FILE_SIZE_MB: int = 2
    MAX_IMAGE_DIMENSION: int = 400

settings = Settings()

if not settings.DATABASE_URL:
    raise ValueError("DATABASE_URL not set in .env files")
if not settings.SECRET_KEY:
    raise ValueError("SECRET_KEY not set in .env files")
if not settings.GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not set in .env files")

