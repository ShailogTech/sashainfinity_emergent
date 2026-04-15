# Sasha Infinity LMS - Authentication System Documentation

## Overview

This authentication system provides a complete, production-ready JWT-based authentication solution for the Sasha Infinity LMS platform. It includes user registration, login, password reset, profile management, and role-based access control.

## Features

- **JWT-based Authentication**: Secure token-based authentication with access and refresh tokens
- **Password Hashing**: Bcrypt-based password hashing for security
- **Password Reset Flow**: Complete forgot password and reset functionality
- **Email Verification**: Optional email verification system
- **Profile Management**: User profile update and management
- **Role-based Access Control**: Support for student, instructor, and admin roles
- **MongoDB Integration**: Async MongoDB integration with Motor
- **Database Indexes**: Optimized indexes for better query performance
- **Health Check Endpoints**: Monitoring and health check endpoints

## Architecture

### Components

1. **auth.py**: Core authentication module containing models, utilities, and dependencies
2. **auth_routes.py**: Authentication API endpoints
3. **password_reset_service.py**: Password reset token management service
4. **server.py**: Main FastAPI application with database initialization

### Database Collections

- `users`: User accounts
- `password_reset_tokens`: Password reset tokens
- `logout_events`: Logout event logs

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login with OAuth2 form | No |
| POST | `/api/auth/login-json` | Login with JSON payload | No |
| POST | `/api/auth/refresh-token` | Refresh access token | No |
| POST | `/api/auth/logout` | Logout current user | Yes |
| GET | `/api/auth/me` | Get current user info | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |
| POST | `/api/auth/change-password` | Change password | Yes |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Complete password reset | No |
| POST | `/api/auth/verify-email` | Verify email address | No |
| POST | `/api/auth/resend-verification` | Resend verification email | Yes |

### Health Check Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/` | Root endpoint with API info |
| GET | `/api/health` | Basic health check |
| GET | `/api/health/detailed` | Detailed health check with stats |

## Setup Instructions

### 1. Environment Configuration

Copy `.env.example` to `.env` and update the values:

```bash
cp backend/.env.example backend/.env
```

Required environment variables:

```env
# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017
DB_NAME=sashainfinity_db

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production-min-32-characters

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Application Configuration
ENVIRONMENT=development
FRONTEND_URL=http://localhost:3000
```

### 2. Generate Secure JWT Secret Key

For production, generate a secure JWT secret key:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 3. Start MongoDB

Make sure MongoDB is running:

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or local installation
mongod --dbpath /path/to/data
```

### 4. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 5. Start the Backend Server

```bash
cd backend
python -m uvicorn server:app --reload --port 8000
```

The API will be available at `http://localhost:8000/api`

### 6. Test the Authentication System

Run the test script:

```bash
cd backend
python test_auth.py
```

## Usage Examples

### User Registration

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "confirm_password": "SecurePass123!",
    "role": "student"
  }'
```

### User Login

```bash
curl -X POST http://localhost:8000/api/auth/login-json \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Current User

```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Profile

```bash
curl -X PUT http://localhost:8000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "profile": {
      "bio": "Software developer",
      "avatar": null
    }
  }'
```

### Forgot Password

```bash
curl -X POST http://localhost:8000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

## Frontend Integration

The frontend includes an `AuthContext` that provides authentication functionality:

```javascript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { login, logout, user, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    const result = await login('user@example.com', 'password');
    if (result.success) {
      console.log('Logged in:', result.user);
    }
  };

  return (
    <div>
      {isAuthenticated() ? (
        <p>Welcome, {user.name}</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Protected Routes

Use the `ProtectedRoute` component to protect routes:

```javascript
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={
        <ProtectedRoute roles={['instructor', 'admin']}>
          <Dashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
```

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt before storage
2. **JWT Tokens**: Secure JWT tokens with configurable expiration
3. **Token Refresh**: Automatic token refresh to maintain sessions
4. **Password Strength**: Minimum password length and validation
5. **Email Verification**: Optional email verification for new users
6. **Rate Limiting**: Ready for rate limiting implementation
7. **CORS Protection**: Configurable CORS settings

## Default Admin User

On first startup, a default admin user is created if it doesn't exist:

- Email: `admin@sashainfinity.com` (or `DEFAULT_ADMIN_EMAIL` env var)
- Password: `Admin@123456` (or `DEFAULT_ADMIN_PASSWORD` env var)

**IMPORTANT**: Change the default admin password immediately after first login!

## Database Indexes

The following indexes are automatically created on startup:

- `users.email`: Unique index on email
- `users.role`: Index on role for filtering
- `password_reset_tokens.token`: Unique index on reset tokens
- `password_reset_tokens.expires_at`: Index for token cleanup

## Troubleshooting

### Connection Issues

If you see MongoDB connection errors:

1. Verify MongoDB is running: `mongosh` or `mongo`
2. Check the MONGO_URL in `.env`
3. Ensure MongoDB is accessible from your network

### Authentication Failures

If login fails:

1. Check the user exists in the database
2. Verify the password is correct
3. Check the JWT_SECRET_KEY matches between requests
4. Review server logs for detailed error messages

### Token Issues

If tokens don't work:

1. Verify the token format: `Bearer YOUR_TOKEN`
2. Check the token hasn't expired (default: 30 minutes)
3. Use the refresh token endpoint to get a new access token

## Development

### Running Tests

```bash
cd backend
python test_auth.py
```

### Adding New Auth Features

1. Add models to `auth.py`
2. Add endpoints to `auth_routes.py`
3. Update the frontend `AuthContext` if needed
4. Add tests to `test_auth.py`

## Production Deployment

For production deployment:

1. Set `ENVIRONMENT=production` in `.env`
2. Use a strong, randomly generated `JWT_SECRET_KEY`
3. Configure proper `CORS_ORIGINS` (not `*`)
4. Set up email service for password resets
5. Enable HTTPS/WSS for secure connections
6. Configure rate limiting
7. Set up monitoring and logging

## License

This authentication system is part of the Sasha Infinity LMS project.
