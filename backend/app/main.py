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
from app.admin import router as admin_router
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

# Migration: add missing columns that won't be auto-added by create_all on existing tables
from sqlalchemy import inspect, text as sql_text
try:
    inspector = inspect(engine)
    sub_cols = [c["name"] for c in inspector.get_columns("subscriptions")]
    if "plan_type" not in sub_cols:
        with engine.connect() as conn:
            conn.execute(sql_text("ALTER TABLE subscriptions ADD COLUMN plan_type VARCHAR(20) DEFAULT 'pro' NOT NULL"))
            conn.commit()
except Exception:
    pass  # migration is best-effort

try:
    inspector = inspect(engine)
    review_cols = [c["name"] for c in inspector.get_columns("reviews")]
    if "is_anonymous" not in review_cols:
        with engine.connect() as conn:
            conn.execute(sql_text("ALTER TABLE reviews ADD COLUMN is_anonymous TINYINT(1) DEFAULT 0 NOT NULL"))
            conn.commit()
except Exception:
    pass  # migration is best-effort

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
app.include_router(admin_router.router)
app.include_router(lawyer_router.router)

@app.get("/")
def index():
    return {"message": "nice"}
