import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import bcrypt
from pydantic import BaseModel, EmailStr
from enum import Enum

class UserRole(str, Enum):
    admin = 'admin'
    instructor = 'instructor'
    student = 'student'

class UserLogin(BaseModel):
    email: EmailStr
    password: str

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

async def test_login():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['sashainfinity_db']

    # Test login
    email = 'demo@example.com'
    password = 'password123'

    user = await db.users.find_one({'email': email})
    if not user:
        print('User not found')
        return

    print(f'Found user: {user["name"]}')
    print(f'Email: {user["email"]}')
    print(f'Role: {user["role"]}')

    # Test password verification
    if verify_password(password, user['hashed_password']):
        print('Password verification: SUCCESS')

        # Update last login
        await db.users.update_one(
            {'email': user['email']},
            {'$set': {'last_login': datetime.now(timezone.utc).isoformat()}}
        )
        print('Last login updated')

        return {
            'id': str(user['_id']),
            'name': user['name'],
            'email': user['email'],
            'role': user['role']
        }
    else:
        print('Password verification: FAILED')
        return None

if __name__ == '__main__':
    result = asyncio.run(test_login())
    if result:
        print(f'Login successful: {result}')
