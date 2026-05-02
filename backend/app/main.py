from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.core.database import engine, Base
from fastapi.middleware.cors import CORSMiddleware

# apps
from app.core.config import settings
from app.auth import router as auth_router
from app.user import router as user_router
from app.chat import router as chat_router
from app.reservation import router as reservation_router
from app.recommendation import router as recommendation_router
from app.payment import router as payment_router
from app.review import router as review_router
from app.lawyer import router as lawyer_router


#models
import app.user.model
import app.lawyer.model
import app.chat.model
import app.reservation.model
import app.review.model
import app.recommendation.model
import app.payment.model


    
# Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LawyerLink API",
    description="Legal consultation platform with AI assistance",
)

# Serve uploads folder so frontend can access images via URL
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# configure cors(it set what domaines can call your backend):
app.add_middleware(
    CORSMiddleware,
    allow_origins = settings.ALLOWED_ORIGINS.split(","),
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)
# routers
app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(chat_router.router)
app.include_router(reservation_router.router)
app.include_router(recommendation_router.router)
app.include_router(payment_router.router)
app.include_router(review_router.router)
app.include_router(lawyer_router.router)

@app.get("/")
def index():
    return {"message": "nice"}
