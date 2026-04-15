#!/usr/bin/env python3
"""
Simple script to test the authentication system manually.
Run this after starting the backend server to verify everything works.
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def print_response(title, response):
    """Pretty print API response"""
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")

def test_auth_flow():
    """Test complete authentication flow"""
    print("\n🔐 Testing SashaInfinity Authentication System")
    print("=" * 60)

    # Test data
    test_user = {
        "name": "Test User",
        "email": "testuser@example.com",
        "password": "testpass123",
        "role": "student",
        "confirm_password": "testpass123"
    }

    # 1. Test Registration
    print("\n1️⃣  Testing Registration...")
    response = requests.post(f"{BASE_URL}/auth/register", json=test_user)
    print_response("Registration Response", response)

    if response.status_code == 201:
        print("✅ Registration successful!")
        user_data = response.json()
        user_id = user_data["id"]
    else:
        print("❌ Registration failed!")
        return

    # 2. Test Login
    print("\n2️⃣  Testing Login...")
    login_data = {
        "username": test_user["email"],
        "password": test_user["password"]
    }
    response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    print_response("Login Response", response)

    if response.status_code == 200:
        print("✅ Login successful!")
        token_data = response.json()
        access_token = token_data["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}
    else:
        print("❌ Login failed!")
        return

    # 3. Test Get Current User
    print("\n3️⃣  Testing Get Current User...")
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print_response("Get Current User Response", response)

    if response.status_code == 200:
        print("✅ Get current user successful!")
    else:
        print("❌ Get current user failed!")

    # 4. Test Token Refresh
    print("\n4️⃣  Testing Token Refresh...")
    response = requests.post(f"{BASE_URL}/auth/refresh-token", headers=headers)
    print_response("Token Refresh Response", response)

    if response.status_code == 200:
        print("✅ Token refresh successful!")
        new_token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {new_token}"}
    else:
        print("❌ Token refresh failed!")

    # 5. Test Profile Update
    print("\n5️⃣  Testing Profile Update...")
    update_data = {"name": "Updated Test User"}
    response = requests.put(f"{BASE_URL}/auth/profile", json=update_data, headers=headers)
    print_response("Profile Update Response", response)

    if response.status_code == 200:
        print("✅ Profile update successful!")
    else:
        print("❌ Profile update failed!")

    # 6. Test Password Update
    print("\n6️⃣  Testing Password Update...")
    password_update_data = {
        "current_password": test_user["password"],
        "new_password": "newtestpass123"
    }
    response = requests.put(f"{BASE_URL}/auth/profile", json=password_update_data, headers=headers)
    print_response("Password Update Response", response)

    if response.status_code == 200:
        print("✅ Password update successful!")
    else:
        print("❌ Password update failed!")

    # 7. Test Login with New Password
    print("\n7️⃣  Testing Login with New Password...")
    login_data = {
        "username": test_user["email"],
        "password": "newtestpass123"
    }
    response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    print_response("Login with New Password Response", response)

    if response.status_code == 200:
        print("✅ Login with new password successful!")
    else:
        print("❌ Login with new password failed!")

    # 8. Test Logout
    print("\n8️⃣  Testing Logout...")
    response = requests.post(f"{BASE_URL}/auth/logout", headers=headers)
    print_response("Logout Response", response)

    if response.status_code == 200:
        print("✅ Logout successful!")
    else:
        print("❌ Logout failed!")

    # 9. Test Error Handling - Duplicate Registration
    print("\n9️⃣  Testing Error Handling - Duplicate Registration...")
    response = requests.post(f"{BASE_URL}/auth/register", json=test_user)
    print_response("Duplicate Registration Response", response)

    if response.status_code == 400:
        print("✅ Duplicate registration properly prevented!")
    else:
        print("❌ Duplicate registration error handling failed!")

    # 10. Test Error Handling - Invalid Login
    print("\n🔟 Testing Error Handling - Invalid Login...")
    login_data = {
        "username": test_user["email"],
        "password": "wrongpassword"
    }
    response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    print_response("Invalid Login Response", response)

    if response.status_code == 401:
        print("✅ Invalid login properly rejected!")
    else:
        print("❌ Invalid login error handling failed!")

    print("\n" + "=" * 60)
    print("🎉 Authentication System Test Complete!")
    print("=" * 60)

    # Cleanup
    print("\n🧹 Cleaning up test user...")
    # Note: You would need to implement a cleanup endpoint or do this manually
    print("✅ Test complete! Please manually clean up the test user from MongoDB.")

if __name__ == "__main__":
    try:
        test_auth_flow()
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to backend server!")
        print("Please make sure the backend server is running on http://localhost:8000")
        print("Run: cd backend && python -m uvicorn server:app --reload --port 8000")
    except Exception as e:
        print(f"\n❌ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()