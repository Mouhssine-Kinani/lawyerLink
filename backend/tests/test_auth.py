"""
Auth API Tests

Postman JSON format for testing:
=================================

1. REGISTER CLIENT:
   POST /auth/register
   Body (JSON):
   {
       "email": "client@example.com",
       "password": "password123",
       "role": "client",
       "first_name": "John",
       "last_name": "Doe",
       "phone": "+1234567890"
   }

2. REGISTER LAWYER:
   POST /auth/register
   Body (JSON):
   {
       "email": "lawyer@example.com",
       "password": "password123",
       "role": "lawyer",
       "first_name": "Jane",
       "last_name": "Smith",
       "phone": "+0987654321"
   }

3. LOGIN:
   POST /auth/login
   Body (JSON):
   {
       "email": "client@example.com",
       "password": "password123"
   }

   Response will contain access_token - use it in Authorization header:
   Authorization: Bearer <access_token>
"""

import pytest


def test_register_client(client):
    """Test registering a new client"""
    response = client.post("/auth/register", json={
        "email": "client@example.com",
        "password": "password123",
        "role": "client",
        "first_name": "John",
        "last_name": "Doe",
        "phone": "+1234567890"
    })
    assert response.status_code == 201
    assert response.json()["message"] == "User created successfully"


def test_register_lawyer(client):
    """Test registering a new lawyer"""
    response = client.post("/auth/register", json={
        "email": "lawyer@example.com",
        "password": "password123",
        "role": "lawyer",
        "first_name": "Jane",
        "last_name": "Smith",
        "phone": "+0987654321"
    })
    assert response.status_code == 201
    assert response.json()["message"] == "User created successfully"


def test_register_duplicate_email(client):
    """Test registering with duplicate email fails"""
    client.post("/auth/register", json={
        "email": "duplicate@example.com",
        "password": "password123",
        "role": "client",
        "first_name": "John",
        "last_name": "Doe"
    })
    response = client.post("/auth/register", json={
        "email": "duplicate@example.com",
        "password": "password123",
        "role": "client",
        "first_name": "Jane",
        "last_name": "Doe"
    })
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_register_invalid_role(client):
    """Test registering with invalid role fails"""
    response = client.post("/auth/register", json={
        "email": "test@example.com",
        "password": "password123",
        "role": "admin",
        "first_name": "Test",
        "last_name": "User"
    })
    assert response.status_code == 400


def test_login_success(client):
    """Test login with valid credentials"""
    client.post("/auth/register", json={
        "email": "login@example.com",
        "password": "password123",
        "role": "client",
        "first_name": "John",
        "last_name": "Doe"
    })
    
    response = client.post("/auth/login", json={
        "email": "login@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_login_invalid_email(client):
    """Test login with non-existent email"""
    response = client.post("/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "password123"
    })
    assert response.status_code == 401


def test_login_invalid_password(client):
    """Test login with wrong password"""
    client.post("/auth/register", json={
        "email": "wrongpass@example.com",
        "password": "correctpassword",
        "role": "client",
        "first_name": "John",
        "last_name": "Doe"
    })
    
    response = client.post("/auth/login", json={
        "email": "wrongpass@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401