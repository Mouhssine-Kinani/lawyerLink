from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.core.database import engine, Base

import app.user.model
import app.lawyer.model
import app.chat.model
import app.reservation.model
import app.review.model
import app.recommendation.model
import app.payment.model


# Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Serve uploads folder so frontend can access images via URL
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def index():
    return {"message": "nice"}










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