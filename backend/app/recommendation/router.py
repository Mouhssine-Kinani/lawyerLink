from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.recommendation.model import RecommendationLog
from app.recommendation.schema import RecommendationLogResponse, RecommendationWithLawyerResponse, LawyerBrief
from app.chat.model import ChatSession

from app.core.dependencies import require_role, get_current_user
from app.user.model import User
from app.lawyer.model import Lawyer


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


@router.get("/session/{session_id}/details", response_model=List[RecommendationWithLawyerResponse])
def get_recommendations_with_lawyers(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("client"))
):
    """Fetch recommendations for a session with full lawyer details.
    Verifies the session belongs to the current client."""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.client_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    recommendations = db.query(RecommendationLog).filter(
        RecommendationLog.session_id == session_id
    ).order_by(RecommendationLog.rank.asc()).all()

    result = []
    for rec in recommendations:
        lawyer = db.query(Lawyer).filter(Lawyer.user_id == rec.lawyer_id).first()
        lawyer_user = db.query(User).filter(User.id == rec.lawyer_id).first()
        lawyer_brief = None
        if lawyer:
            lawyer_brief = LawyerBrief(
                id=lawyer.user_id,
                first_name=lawyer.first_name,
                last_name=lawyer.last_name,
                firm=lawyer.firm,
                specialties=lawyer.specialties,
                city=lawyer.city,
                region=lawyer.region,
                hourly_rate=lawyer.hourly_rate,
                rating_avg=lawyer.rating_avg,
                rating_count=lawyer.rating_count,
                image_url=lawyer_user.image_url if lawyer_user else None,
            )

        result.append(RecommendationWithLawyerResponse(
            id=rec.id,
            session_id=rec.session_id,
            client_id=rec.client_id,
            lawyer_id=rec.lawyer_id,
            score=rec.score,
            rank=rec.rank,
            created_at=rec.created_at,
            lawyer=lawyer_brief,
        ))

    return result


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