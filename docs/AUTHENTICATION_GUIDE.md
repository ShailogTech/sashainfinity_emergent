# Authentication System Guide

Complete JWT-based authentication system for the SashaInfinity LMS platform.

## Features

- **JWT-based Authentication**: Secure token-based authentication with automatic token refresh
- **User Registration**: Multi-role registration (student, instructor, admin)
- **Profile Management**: Update user information and change passwords
- **Protected Routes**: Role-based access control for frontend and backend
- **Token Refresh**: Automatic token refresh to maintain user sessions
- **Glassmorphic UI**: Beautiful, modern authentication interface

## Architecture

### Backend (FastAPI)

- **JWT Authentication**: Uses `python-jose` for JWT token generation and validation
- **Password Hashing**: Bcrypt password hashing via `passlib`
- **MongoDB Integration**: User data stored in MongoDB with Motor async driver
- **Role-based Access**: Middleware for protecting endpoints based on user roles

### Frontend (React)

- **AuthContext**: Centralized authentication state management
- **Protected Routes**: Route guards for protecting authenticated pages
- **Token Storage**: localStorage for JWT token persistence
- **Auto-refresh**: Automatic token refresh on 401 responses

## API Endpoints

### Authentication

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "student",
  "confirm_password": "securepassword123"
}
```

**Response (201):**
```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### POST `/api/auth/login`
Login with email and password.

**Request Body (FormData):**
```
username: john@example.com
password: securepassword123
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "is_active": true
  }
}
```

#### POST `/api/auth/refresh-token`
Refresh the access token.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "access_token": "new_token_here",
  "token_type": "bearer",
  "expires_in": 1800
}
```

#### GET `/api/auth/me`
Get current user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### POST `/api/auth/logout`
Logout user (client-side token removal).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Successfully logged out"
}
```

### Profile Management

#### PUT `/api/auth/profile`
Update user profile or password.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (Update Profile):**
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

**Request Body (Update Password):**
```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword123"
}
```

**Response (200):**
```json
{
  "id": "user_id",
  "name": "John Updated",
  "email": "john.updated@example.com",
  "role": "student",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

## Frontend Components

### AuthContext

Centralized authentication state management.

**Usage:**
```javascript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated()) {
    return <div>Please login</div>;
  }

  return <div>Welcome {user.name}</div>;
}
```

**Available Methods:**
- `login(email, password)`: Login user
- `register(userData)`: Register new user
- `logout()`: Logout user
- `refreshToken()`: Refresh access token
- `updateUser(data)`: Update user state
- `isAuthenticated()`: Check if user is authenticated
- `hasRole(roles)`: Check if user has specific role(s)

### ProtectedRoute

Route guard for protecting authenticated pages.

**Usage:**
```javascript
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>

// With role requirements
<ProtectedRoute requireRoles={['admin', 'instructor']}>
  <AdminPage />
</ProtectedRoute>
```

### Authentication Pages

#### LoginPage (`/login`)
- Email/password login
- Remember me functionality
- Forgot password link
- Social login buttons (UI only)
- Redirect to previous page after login

#### GetStartedPage (`/get-started`)
- User registration
- Role selection (student/instructor)
- Form validation
- Password confirmation
- Terms agreement

#### ProfilePage (`/profile`)
- View user information
- Update name and email
- Change password
- Role-based access control
- Glassmorphic UI design

## User Roles

### Student
- Default role for new users
- Access to course content
- Can view own profile
- Cannot access admin panel

### Instructor
- Can create and manage courses
- Access to instructor dashboard
- Can view student progress
- Can manage course content

### Admin
- Full system access
- User management
- Course management
- System configuration
- Analytics and reporting

## Security Features

### Password Requirements
- Minimum 6 characters
- Password confirmation required
- Bcrypt hashing (cost factor: 12)

### JWT Configuration
- Algorithm: HS256
- Token expiration: 30 minutes
- Automatic token refresh
- Secret key from environment variable

### API Security
- CORS configuration
- Token validation on protected endpoints
- Role-based access control
- Input validation with Pydantic

## Environment Variables

Required backend environment variables:

```env
# MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=sashainfinity_lms

# JWT
JWT_SECRET_KEY=your-secret-key-change-in-production

# CORS
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create `.env` file:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=sashainfinity_lms
JWT_SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:3000
```

Start backend server:
```bash
python -m uvicorn server:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend
yarn install
yarn start
```

### 3. Testing

Run integration tests:
```bash
cd backend
pytest tests/integration/test_auth_integration.py -v
```

## Usage Examples

### Register a New User

```javascript
const userData = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'securepassword123',
  role: 'student',
  confirm_password: 'securepassword123'
};

const result = await register(userData);
if (result.success) {
  console.log('User registered successfully');
}
```

### Login User

```javascript
const result = await login('john@example.com', 'securepassword123');
if (result.success) {
  console.log('Logged in as:', result.user.name);
}
```

### Update Profile

```javascript
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:8000/api/auth/profile', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'John Updated'
  })
});

const updatedUser = await response.json();
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `CORS_ORIGINS` includes your frontend URL
   - Check browser console for specific CORS errors

2. **Token Expired**
   - Tokens expire after 30 minutes
   - Implement automatic token refresh in frontend
   - Check system time synchronization

3. **MongoDB Connection**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify database name is correct

4. **Password Validation**
   - Ensure passwords match during registration
   - Check password minimum length (6 characters)
   - Verify current password when updating

## Testing

### Manual Testing

1. Start backend server
2. Start frontend server
3. Navigate to `http://localhost:3000/login`
4. Register a new user
5. Login with credentials
6. Access profile page
7. Update profile information
8. Change password
9. Logout and login with new password

### Automated Testing

Run the complete test suite:
```bash
cd backend
pytest tests/integration/test_auth_integration.py -v
```

## Future Enhancements

- Email verification
- Password reset via email
- Two-factor authentication
- OAuth integration (Google, LinkedIn)
- Session management
- Audit logging
- Rate limiting
- Account lockout after failed attempts

## Support

For issues or questions:
- Check the troubleshooting section
- Review API documentation at `/docs`
- Check logs in `logs/` directory
- Verify environment variables are set correctly