from fastapi import FastAPI
from app.database import engine, Base

# Import all models before calling create_all so SQLAlchemy knows about them
import app.user.model
import app.lawyer.model
import app.chat.model
import app.reservation.model
import app.review.model
import app.recommendation.model
import app.payment.model

# Create the database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def index():
    return {"message": "nice"}