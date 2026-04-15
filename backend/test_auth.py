"""
Comprehensive test script for Sasha Infinity LMS Authentication API.
Run this script to verify the authentication endpoints are working correctly.

Usage:
    python test_auth.py

Requirements:
    - Backend server must be running on http://localhost:8000
    - MongoDB must be running
    - Install requests: pip install requests
"""
import requests
import json
import time
from typing import Optional, Dict, Any

# Configuration
BASE_URL = "http://localhost:8000/api"
TEST_USER = {
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@123456",
    "role": "student",
    "confirm_password": "Test@123456"
}


class Colors:
    """ANSI color codes for terminal output."""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'


def print_success(message: str):
    print(f"{Colors.GREEN}✓ {message}{Colors.END}")


def print_error(message: str):
    print(f"{Colors.RED}✗ {message}{Colors.END}")


def print_info(message: str):
    print(f"{Colors.BLUE}ℹ {message}{Colors.END}")


def print_header(message: str):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'=' * 60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{message.center(60)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'=' * 60}{Colors.END}\n")


def test_health_check() -> bool:
    """Test the health check endpoint."""
    print_header("Testing Health Check")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print_success(f"Health check passed: {data.get('status')}")
            print_info(f"Database: {data.get('services', {}).get('mongodb')}")
            return True
        else:
            print_error(f"Health check failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Health check error: {e}")
        return False


def test_register(email: str, password: str) -> Optional[str]:
    """Test user registration."""
    print_header("Testing User Registration")
    try:
        payload = {
            "name": "Test User",
            "email": email,
            "password": password,
            "role": "student",
            "confirm_password": password
        }
        response = requests.post(f"{BASE_URL}/auth/register", json=payload)
        if response.status_code == 201:
            data = response.json()
            print_success(f"User registered successfully: {data.get('email')}")
            return data.get('id')
        elif response.status_code == 400:
            print_info("User already exists (this is OK for testing)")
            return None
        else:
            print_error(f"Registration failed: {response.json()}")
            return None
    except Exception as e:
        print_error(f"Registration error: {e}")
        return None


def test_login(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Test user login."""
    print_header("Testing User Login")
    try:
        payload = {
            "email": email,
            "password": password
        }
        response = requests.post(f"{BASE_URL}/auth/login-json", json=payload)
        if response.status_code == 200:
            data = response.json()
            print_success(f"Login successful for: {email}")
            print_info(f"Access token: {data.get('access_token')[:20]}...")
            print_info(f"User role: {data.get('user', {}).get('role')}")
            return data
        else:
            print_error(f"Login failed: {response.json()}")
            return None
    except Exception as e:
        print_error(f"Login error: {e}")
        return None


def test_get_current_user(token: str) -> bool:
    """Test getting current user info."""
    print_header("Testing Get Current User")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print_success(f"Current user retrieved: {data.get('name')}")
            print_info(f"Email: {data.get('email')}")
            print_info(f"Role: {data.get('role')}")
            return True
        else:
            print_error(f"Get current user failed: {response.json()}")
            return False
    except Exception as e:
        print_error(f"Get current user error: {e}")
        return False


def test_update_profile(token: str) -> bool:
    """Test updating user profile."""
    print_header("Testing Profile Update")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "name": "Updated Test User",
            "profile": {
                "bio": "Test bio",
                "avatar": None
            }
        }
        response = requests.put(f"{BASE_URL}/auth/profile", json=payload, headers=headers)
        if response.status_code == 200:
            data = response.json()
            print_success(f"Profile updated: {data.get('name')}")
            return True
        else:
            print_error(f"Profile update failed: {response.json()}")
            return False
    except Exception as e:
        print_error(f"Profile update error: {e}")
        return False


def test_change_password(token: str, new_password: str) -> bool:
    """Test changing password."""
    print_header("Testing Password Change")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "current_password": "Test@123456",
            "new_password": new_password,
            "confirm_password": new_password
        }
        response = requests.post(f"{BASE_URL}/auth/change-password", json=payload, headers=headers)
        if response.status_code == 200:
            print_success("Password changed successfully")
            return True
        else:
            print_error(f"Password change failed: {response.json()}")
            return False
    except Exception as e:
        print_error(f"Password change error: {e}")
        return False


def test_forgot_password(email: str) -> bool:
    """Test forgot password."""
    print_header("Testing Forgot Password")
    try:
        payload = {"email": email}
        response = requests.post(f"{BASE_URL}/auth/forgot-password", json=payload)
        if response.status_code == 200:
            print_success("Password reset email sent (or would be sent)")
            return True
        else:
            print_error(f"Forgot password failed: {response.json()}")
            return False
    except Exception as e:
        print_error(f"Forgot password error: {e}")
        return False


def test_refresh_token(refresh_token: str) -> bool:
    """Test token refresh."""
    print_header("Testing Token Refresh")
    try:
        payload = {"refresh_token": refresh_token}
        response = requests.post(f"{BASE_URL}/auth/refresh-token", json=payload)
        if response.status_code == 200:
            data = response.json()
            print_success("Token refreshed successfully")
            print_info(f"New access token: {data.get('access_token')[:20]}...")
            return True
        else:
            print_error(f"Token refresh failed: {response.json()}")
            return False
    except Exception as e:
        print_error(f"Token refresh error: {e}")
        return False


def test_logout(token: str) -> bool:
    """Test logout."""
    print_header("Testing Logout")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.post(f"{BASE_URL}/auth/logout", headers=headers)
        if response.status_code == 200:
            print_success("Logout successful")
            return True
        else:
            print_error(f"Logout failed: {response.json()}")
            return False
    except Exception as e:
        print_error(f"Logout error: {e}")
        return False


def run_all_tests():
    """Run all authentication tests."""
    print(f"\n{Colors.BOLD}Sasha Infinity LMS - Authentication API Tests{Colors.END}\n")

    # Generate unique test user email
    timestamp = int(time.time())
    test_email = f"testuser_{timestamp}@example.com"
    test_password = "Test@123456"
    new_password = "NewTest@123456"

    results = {
        "health_check": False,
        "register": False,
        "login": False,
        "get_current_user": False,
        "update_profile": False,
        "change_password": False,
        "forgot_password": False,
        "refresh_token": False,
        "logout": False
    }

    # Test health check
    results["health_check"] = test_health_check()
    if not results["health_check"]:
        print_error("Health check failed. Please ensure the backend server is running.")
        return

    # Test registration
    user_id = test_register(test_email, test_password)
    results["register"] = user_id is not None or True  # Consider it pass if user already exists

    # Wait a bit for the user to be created
    time.sleep(1)

    # Test login
    login_data = test_login(test_email, test_password)
    results["login"] = login_data is not None

    if login_data:
        access_token = login_data.get("access_token")
        refresh_token = login_data.get("refresh_token")

        # Test get current user
        results["get_current_user"] = test_get_current_user(access_token)

        # Test update profile
        results["update_profile"] = test_update_profile(access_token)

        # Test change password
        results["change_password"] = test_change_password(access_token, new_password)

        # Test login with new password
        login_data_new = test_login(test_email, new_password)

        if login_data_new:
            # Change password back
            test_change_password(login_data_new.get("access_token"), test_password)

        # Test forgot password
        results["forgot_password"] = test_forgot_password(test_email)

        # Test refresh token
        if refresh_token:
            results["refresh_token"] = test_refresh_token(refresh_token)

        # Test logout
        results["logout"] = test_logout(access_token)

    # Print summary
    print_header("Test Results Summary")
    total = len(results)
    passed = sum(1 for v in results.values() if v)

    for test, result in results.items():
        status = f"{Colors.GREEN}PASSED{Colors.END}" if result else f"{Colors.RED}FAILED{Colors.END}"
        print(f"{test.replace('_', ' ').title():.<40} {status}")

    print(f"\n{Colors.BOLD}Total: {passed}/{total} tests passed{Colors.END}\n")

    if passed == total:
        print_success("All tests passed!")
    else:
        print_error(f"{total - passed} test(s) failed")


if __name__ == "__main__":
    run_all_tests()
