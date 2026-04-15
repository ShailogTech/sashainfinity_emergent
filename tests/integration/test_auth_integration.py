"""
Integration tests for the authentication system.
Tests the complete flow from user registration to login to profile management.
"""
import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from server import app, db
import os
from datetime import datetime, timezone


class TestAuthIntegration:
    """Test authentication system integration"""

    @pytest.fixture
    async def client(self):
        """Create test client"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            yield ac

    @pytest.fixture
    async def clean_db(self):
        """Clean up test data before and after tests"""
        # Clean up before test
        await db.users.delete_many({"email": {"$regex": r"^test.*@example\.com$"}})
        yield
        # Clean up after test
        await db.users.delete_many({"email": {"$regex": r"^test.*@example\.com$"}})

    @pytest.mark.asyncio
    async def test_complete_auth_flow(self, client, clean_db):
        """Test complete authentication flow: register -> login -> profile -> logout"""

        # 1. Register a new user
        register_data = {
            "name": "Test User",
            "email": "test@example.com",
            "password": "testpassword123",
            "role": "student",
            "confirm_password": "testpassword123"
        }

        response = await client.post("/api/auth/register", json=register_data)
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["name"] == "Test User"
        assert data["role"] == "student"
        user_id = data["id"]

        # 2. Login with the registered user
        login_data = {
            "username": "test@example.com",
            "password": "testpassword123"
        }

        response = await client.post("/api/auth/login", data=login_data)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "test@example.com"
        token = data["access_token"]

        # 3. Get current user info
        response = await client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["name"] == "Test User"

        # 4. Update user profile
        update_data = {
            "name": "Updated Test User"
        }

        response = await client.put(
            "/api/auth/profile",
            json=update_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Test User"
        assert data["email"] == "test@example.com"

        # 5. Verify profile update persisted
        response = await client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Test User"

        # 6. Update password
        password_update_data = {
            "current_password": "testpassword123",
            "new_password": "newpassword456"
        }

        response = await client.put(
            "/api/auth/profile",
            json=password_update_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200

        # 7. Login with new password
        login_data = {
            "username": "test@example.com",
            "password": "newpassword456"
        }

        response = await client.post("/api/auth/login", data=login_data)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data

        # 8. Verify old password doesn't work
        login_data = {
            "username": "test@example.com",
            "password": "testpassword123"
        }

        response = await client.post("/api/auth/login", data=login_data)
        assert response.status_code == 401

        # 9. Test token refresh
        response = await client.post(
            "/api/auth/refresh-token",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        new_token = data["access_token"]

        # 10. Verify new token works
        response = await client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {new_token}"}
        )
        assert response.status_code == 200

        # 11. Test logout
        response = await client.post(
            "/api/auth/logout",
            headers={"Authorization": f"Bearer {new_token}"}
        )
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_duplicate_registration(self, client, clean_db):
        """Test that duplicate email registration is prevented"""
        register_data = {
            "name": "Test User",
            "email": "test2@example.com",
            "password": "testpassword123",
            "role": "student",
            "confirm_password": "testpassword123"
        }

        # Register first user
        response = await client.post("/api/auth/register", json=register_data)
        assert response.status_code == 201

        # Try to register with same email
        response = await client.post("/api/auth/register", json=register_data)
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_invalid_login(self, client, clean_db):
        """Test login with invalid credentials"""
        # Register a user first
        register_data = {
            "name": "Test User",
            "email": "test3@example.com",
            "password": "testpassword123",
            "role": "student",
            "confirm_password": "testpassword123"
        }
        await client.post("/api/auth/register", json=register_data)

        # Try to login with wrong password
        login_data = {
            "username": "test3@example.com",
            "password": "wrongpassword"
        }
        response = await client.post("/api/auth/login", data=login_data)
        assert response.status_code == 401

        # Try to login with non-existent user
        login_data = {
            "username": "nonexistent@example.com",
            "password": "testpassword123"
        }
        response = await client.post("/api/auth/login", data=login_data)
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_password_mismatch_registration(self, client):
        """Test registration with mismatched passwords"""
        register_data = {
            "name": "Test User",
            "email": "test4@example.com",
            "password": "testpassword123",
            "role": "student",
            "confirm_password": "differentpassword"
        }
        response = await client.post("/api/auth/register", json=register_data)
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_protected_admin_endpoint(self, client, clean_db):
        """Test that admin endpoints are properly protected"""
        # Register and login as student
        register_data = {
            "name": "Test Student",
            "email": "teststudent@example.com",
            "password": "testpassword123",
            "role": "student",
            "confirm_password": "testpassword123"
        }
        await client.post("/api/auth/register", json=register_data)

        login_data = {
            "username": "teststudent@example.com",
            "password": "testpassword123"
        }
        response = await client.post("/api/auth/login", data=login_data)
        token = response.json()["access_token"]

        # Try to access admin endpoint as student
        response = await client.get(
            "/api/admin/dashboard",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403  # Forbidden

        # Register and login as admin
        register_data = {
            "name": "Test Admin",
            "email": "testadmin@example.com",
            "password": "testpassword123",
            "role": "admin",
            "confirm_password": "testpassword123"
        }
        await client.post("/api/auth/register", json=register_data)

        login_data = {
            "username": "testadmin@example.com",
            "password": "testpassword123"
        }
        response = await client.post("/api/auth/login", data=login_data)
        admin_token = response.json()["access_token"]

        # Access admin endpoint as admin
        response = await client.get(
            "/api/admin/dashboard",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_invalid_token(self, client):
        """Test access with invalid token"""
        response = await client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_missing_token(self, client):
        """Test access without token"""
        response = await client.get("/api/auth/me")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_password_update_with_wrong_current_password(self, client, clean_db):
        """Test password update with incorrect current password"""
        # Register a user
        register_data = {
            "name": "Test User",
            "email": "test5@example.com",
            "password": "testpassword123",
            "role": "student",
            "confirm_password": "testpassword123"
        }
        await client.post("/api/auth/register", json=register_data)

        # Login
        login_data = {
            "username": "test5@example.com",
            "password": "testpassword123"
        }
        response = await client.post("/api/auth/login", data=login_data)
        token = response.json()["access_token"]

        # Try to update password with wrong current password
        password_update_data = {
            "current_password": "wrongpassword",
            "new_password": "newpassword456"
        }
        response = await client.put(
            "/api/auth/profile",
            json=password_update_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 401


if __name__ == "__main__":
    pytest.main([__file__, "-v"])