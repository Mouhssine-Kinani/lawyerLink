from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.chat.model import ChatSession, ChatMessage
from app.chat.schema import MessageCreate, ChatResponse, SessionResponse
from app.chat import service

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/session", response_model=SessionResponse)
def create_session(db: Session = Depends(get_db)):
    """
    Client starts a new chat session.
    Call this once when the client opens the chat page.
    """
    session = ChatSession(client_id=1)  # 🔴 replace with real client_id from JWT later
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.post("/session/{session_id}/message", response_model=ChatResponse)
def send_message(
    session_id: int,
    body: MessageCreate,
    db: Session = Depends(get_db)
):
    """
    Client sends a message → saved to DB → AI replies → saved to DB.
    """
    # 1. Check session exists
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # 2. Save client message ✅ Fix 3
    client_msg = ChatMessage(
        session_id=session_id,
        sender="client",
        content=body.content
    )
    db.add(client_msg)
    db.commit()

    # 3. Get AI response
    ai_text = service.get_ai_response(session_id, body.content, db)

    # 4. Save AI message ✅ Fix 3
    ai_msg = ChatMessage(
        session_id=session_id,
        sender="ai",
        content=ai_text
    )
    db.add(ai_msg)
    db.commit()

    return ChatResponse(
        session_id=session_id,
        user_message=body.content,
        ai_response=ai_text
    )


@router.get("/session/{session_id}/history")
def get_history(session_id: int, db: Session = Depends(get_db)):
    """
    Returns all messages in a session.
    Used to reload the chat when the client refreshes the page.
    """
    # Check session exists
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at.asc()).all()

    return messages


@router.get("/session/{session_id}/specialty")
def get_specialty(session_id: int, db: Session = Depends(get_db)):
    """
    Extracts what type of lawyer the client needs.
    Call this when the client finishes chatting
    to trigger the recommendation system.
    """
    # Check session exists
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    specialty = service.extract_legal_specialty(session_id, db)
    return {"specialty": specialty}


@router.delete("/session/{session_id}")
def delete_session(session_id: int, db: Session = Depends(get_db)):
    """
    Deletes a session and all its messages.
    Optional — useful for cleanup.
    """
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
    db.delete(session)
    db.commit()

    return {"message": "Session deleted successfully"}