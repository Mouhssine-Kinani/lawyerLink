"""
Chat API Tests

Postman JSON format for testing:
=================================

1. CREATE CHAT SESSION:
   POST /chat/session
   Headers:
   Authorization: Bearer <client_token>

   No body needed

2. SEND MESSAGE IN SESSION:
   POST /chat/session/{session_id}/message
   Headers:
   Authorization: Bearer <client_token>
   Body (JSON):
   {
       "content": "I need help with a contract"
   }

3. GET CHAT HISTORY:
   GET /chat/session/{session_id}/history
   Headers:
   Authorization: Bearer <client_token>

4. GET SPECIALTY:
   GET /chat/session/{session_id}/specialty
   Headers:
   Authorization: Bearer <client_token>

5. DELETE SESSION:
   DELETE /chat/session/{session_id}
   Headers:
   Authorization: Bearer <client_token>
"""

import pytest


def get_client_token(client, email):
    """Helper to get client auth token"""
    client.post("/auth/register", json={
        "email": email,
        "password": "password123",
        "role": "client",
        "first_name": "Test",
        "last_name": "User"
    })
    response = client.post("/auth/login", json={
        "email": email,
        "password": "password123"
    })
    return response.json()["access_token"]


@pytest.mark.skip(reason="AI service not available in tests")
def test_create_chat_session(client):
    """Test creating a new chat session"""
    token = get_client_token(client, "chatuser@example.com")
    
    response = client.post("/chat/session", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["client_id"] is not None


@pytest.mark.skip(reason="AI service not available in tests")
def test_send_message(client):
    """Test sending a message"""
    token = get_client_token(client, "msguser@example.com")
    
    # Create session first
    session_response = client.post("/chat/session", headers={
        "Authorization": f"Bearer {token}"
    })
    session_id = session_response.json()["id"]
    
    # Send message
    response = client.post(f"/chat/session/{session_id}/message", 
        json={"content": "I need legal help"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == session_id


@pytest.mark.skip(reason="AI service not available in tests")
def test_get_history(client):
    """Test getting chat history"""
    token = get_client_token(client, "historyuser@example.com")
    
    # Create session and get ID
    session_response = client.post("/chat/session", headers={
        "Authorization": f"Bearer {token}"
    })
    session_id = session_response.json()["id"]
    
    response = client.get(f"/chat/session/{session_id}/history", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.skip(reason="AI service not available in tests")
def test_delete_session(client):
    """Test deleting a chat session"""
    token = get_client_token(client, "deleteuser@example.com")
    
    # Create session
    session_response = client.post("/chat/session", headers={
        "Authorization": f"Bearer {token}"
    })
    session_id = session_response.json()["id"]
    
    response = client.delete(f"/chat/session/{session_id}", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200


@pytest.mark.skip(reason="AI service not available in tests")
def test_session_not_found(client):
    """Test accessing non-existent session"""
    response = client.get("/chat/session/99999/history")
    assert response.status_code == 404