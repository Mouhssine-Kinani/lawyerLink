"""
User API Tests

Postman JSON format for testing:
=================================

1. GET CURRENT USER (/users/me):
   GET /users/me
   Headers:
   Authorization: Bearer <access_token>

   No body needed - uses token from Authorization header
"""

import pytest


def get_auth_token(client, email, password):
    """Helper to get auth token"""
    client.post("/auth/register", json={
        "email": email,
        "password": password,
        "role": "client",
        "first_name": "Test",
        "last_name": "User"
    })
    response = client.post("/auth/login", json={
        "email": email,
        "password": password
    })
    return response.json()["access_token"]


def test_get_current_user(client):
    """Test getting current user profile"""
    token = get_auth_token(client, "user@example.com", "password123")
    
    response = client.get("/users/me", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "user@example.com"
    assert data["role"] == "client"
    assert "id" in data


def test_get_current_user_unauthorized(client):
    """Test getting user profile without token"""
    response = client.get("/users/me")
    assert response.status_code == 401