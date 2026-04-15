import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt

async def test_login():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['sashainfinity_db']

    print('Testing login flow...')

    # Find user
    user = await db.users.find_one({'email': 'demo@example.com'})
    if not user:
        print('ERROR: User not found')
        return

    print(f'Found user: {user["name"]}')

    # Verify password
    is_valid = bcrypt.checkpw('password123'.encode('utf-8'), user['hashed_password'].encode('utf-8'))
    if not is_valid:
        print('ERROR: Invalid password')
        return

    print('Password valid')

    # Update last login
    await db.users.update_one(
        {'email': user['email']},
        {'$set': {'last_login': datetime.now(timezone.utc).isoformat()}}
    )

    # Create JWT token
    SECRET_KEY = 'your-secret-key-change-in-production'
    ALGORITHM = 'HS256'

    payload = {
        'sub': user['email'],
        'role': user['role']
    }

    expire = datetime.utcnow() + timedelta(minutes=30)
    payload['exp'] = expire

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    user_data = {
        'id': str(user['_id']),
        'name': user['name'],
        'email': user['email'],
        'role': user['role'],
        'is_active': user.get('is_active', True)
    }

    response = {
        'access_token': token,
        'token_type': 'bearer',
        'expires_in': 30 * 60,
        'user': user_data
    }

    print('Login successful!')
    print(f'Token: {token[:50]}...')
    return response

if __name__ == '__main__':
    result = asyncio.run(test_login())
