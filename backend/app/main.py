from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.core.database import engine, Base
from fastapi.middleware.cors import CORSMiddleware


from app.core.config import settings
from app.auth import router as auth_router


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


@app.get("/")
def index():
    return {"message": "nice"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}







# from fastapi import FastAPI
# from app.core.database import engine, Base

# # Import all models before calling create_all so SQLAlchemy knows about them
# import app.user.model
# import app.lawyer.model
# import app.chat.model
# import app.reservation.model
# import app.review.model
# import app.recommendation.model
# import app.payment.model


# # In a setup script or temporary route
# # Base.metadata.drop_all(bind=engine)

# # Create the database tables
# Base.metadata.create_all(bind=engine)

# app = FastAPI()

# @app.get("/")
# def index():
#     return {"message": "nice"}