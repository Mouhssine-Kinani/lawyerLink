from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.recommendation.model import RecommendationLog
from app.recommendation.schema import RecommendationLogResponse
from app.chat.model import ChatSession

from app.core.dependencies import require_role
from app.user.model import User


router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


def save_recommendations(
    session_id: int,
    lawyers: list[dict],
    db: Session
) -> list[RecommendationLog]:
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        return []

    saved = []
    for rank, lawyer_data in enumerate(lawyers, start=1):
        recommendation = RecommendationLog(
            client_id=session.client_id,
            session_id=session_id,
            lawyer_id=lawyer_data["id"],
            rank=rank
        )
        db.add(recommendation)
        saved.append(recommendation)

    db.commit()
    return saved


@router.get("/session/{session_id}", response_model=List[RecommendationLogResponse])
def get_recommendations_by_session(
    session_id: int,
    db: Session = Depends(get_db)
):
    """Fetch all recommendations for a given session."""
    recommendations = db.query(RecommendationLog).filter(
        RecommendationLog.session_id == session_id
    ).order_by(RecommendationLog.rank.asc()).all()
    return recommendations


@router.get("/client", response_model=List[RecommendationLogResponse])
def get_client_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("client"))
):
    """Fetch all recommendations for the current client."""
    recommendations = db.query(RecommendationLog).filter(
        RecommendationLog.client_id == current_user.id
    ).order_by(RecommendationLog.created_at.desc()).all()
    return recommendations