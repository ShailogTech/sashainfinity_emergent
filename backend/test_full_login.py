import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
from enum import Enum
import bcrypt
import jwt
from pydantic import BaseModel, EmailStr

class UserRole(str, Enum):
    admin = 'admin'
    instructor = 'instructor'
    student = 'student'

class UserLogin(BaseModel):
    email: EmailStr
    password: str

SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def test_complete_login():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['sashainfinity_db']

    # Test login
    login_data = UserLogin(
        email='demo@example.com',
        password='password123'
    )

    # Find user
    user = await db.users.find_one({'email': login_data.email})
    if not user:
        print('User not found')
        return

    print('Step 1: Found user')

    # Verify password
    if not verify_password(login_data.password, user['hashed_password']):
        print('Password verification failed')
        return

    print('Step 2: Password verified')

    # Update last login
    await db.users.update_one(
        {'email': user['email']},
        {'$set': {'last_login': datetime.now(timezone.utc).isoformat()}}
    )

    print('Step 3: Updated last login')

    # Create access token
    try:
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={'sub': user['email'], 'role': user['role']},
            expires_delta=access_token_expires
        )

        print(f'Step 4: Created access token (length: {len(access_token)})')

        # Prepare user data
        user_data = {
            'id': str(user['_id']),
            'name': user['name'],
            'email': user['email'],
            'role': user['role'],
            'is_active': user.get('is_active', True)
        }

        print('Step 5: Prepared user data')

        result = {
            'access_token': access_token,
            'token_type': 'bearer',
            'expires_in': 30 * 60,
            'user': user_data
        }

        print('Step 6: Created response')
        print('SUCCESS: Login completed successfully!')
        print(f'Token: {access_token[:50]}...')
        print(f'User: {user_data}')

        return result

    except Exception as e:
        print(f'ERROR creating token: {e}')
        import traceback
        traceback.print_exc()
        return None

if __name__ == '__main__':
    result = asyncio.run(test_complete_login())
