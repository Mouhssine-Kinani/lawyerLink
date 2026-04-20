#backend/app/chat/router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session


from app.core.database import get_db
from app.chat.model import ChatSession, ChatMessage
from app.chat.schema import MessageCreate, ChatResponse, SessionResponse
from app.chat import service
from app.recommendation import router as recommendation_router


from app.core.dependencies import get_current_user, require_role, get_client_session
from app.user.model import User

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/session", response_model=SessionResponse)
def create_session(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("client"))
):
    session = ChatSession(client_id=current_user.id)

    db.add(session)
    db.commit()
    db.refresh(session)

    return session

@router.post("/session/{session_id}/message", response_model=ChatResponse)
def send_message(
    session_id: int,
    body: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("client"))
):
    # 1. Verify session belongs to client
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.client_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # 2. Save client message
    client_msg = ChatMessage(
        session_id=session_id,
        sender="client",
        content=body.content
    )
    db.add(client_msg)
    db.commit()

    # 3. Get AI response
    try:
        result = service.get_ai_response(session_id, body.content, db)
    except Exception as e:
        status_code = getattr(e, "code", None) or getattr(e, "status_code", 500)
        if status_code == 429:
            raise HTTPException(status_code=429, detail="AI quota exceeded. Please try again in a few moments.")
        raise HTTPException(status_code=502, detail=f"AI Service Error: {str(e)}")

    # 4. Save AI message
    ai_msg = ChatMessage(
        session_id=session_id,
        sender="ai",
        content=result["message"]
    )
    db.add(ai_msg)
    db.commit()

    # 5. Save recommendations if AI returned lawyers
    if result["lawyers"]:
        try:
            recommendation_router.save_recommendations(session_id, result["lawyers"], db)
        except Exception as e:
            import logging
            logging.warning(f"Failed to save recommendations for session {session_id}: {e}")

    return ChatResponse(
        session_id=session_id,
        user_message=body.content,
        ai_response=result["message"],
        lawyers=result["lawyers"]
    )

@router.get("/session/{session_id}/history")
def get_history(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_role("client"))):
    """
    Returns all messages in a session.
    Used to reload the chat when the client refreshes the page.
    """
    # Verify session belongs to client
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.client_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at.asc()).all()

    return messages


@router.get("/session/{session_id}/specialty")
def get_specialty(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_role("client"))):
    """
    Extracts what type of lawyer the client needs.
    Call this when the client finishes chatting
    to trigger the recommendation system.
    """
    # Verify session belongs to client
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.client_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    specialty = service.extract_legal_specialty(session_id, db)
    return {"specialty": specialty}


@router.delete("/session/{session_id}")
def delete_session(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_role("client"))):
    """
    Deletes a session and all its messages.
    Optional — useful for cleanup.
    """
    # Verify session belongs to client
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.client_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
    db.delete(session)
    db.commit()

    return {"message": "Session deleted successfully"}


@router.post("/admin/check-subscriptions")
def check_expired_subscriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """
    Admin endpoint to check and update expired subscriptions.
    Updates status from 'active' to 'expired' for subscriptions past their end_date.
    """
    result = service.check_and_update_expired_subscriptions(db)
    return result