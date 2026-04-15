"""
Authentication module for Sasha Infinity LMS.
Handles JWT token generation, password hashing, and user authentication.
"""
import os
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from enum import Enum
import bcrypt
import jwt
from jose import JWTError, jwt as jose_jwt
from passlib.context import CryptContext
from fastapi import HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
import logging

logger = logging.getLogger(__name__)

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-jwt-key-change-this-in-production-min-32-chars")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


# =============================================================================
# Models
# =============================================================================

class UserRole(str, Enum):
    admin = "admin"
    instructor = "instructor"
    student = "student"


class TokenType(str, Enum):
    access = "access"
    refresh = "refresh"
    reset = "reset"
    verification = "verification"


class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: int
    user: dict


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    token_type: Optional[str] = TokenType.access


class UserAuth(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    name: str
    email: EmailStr
    hashed_password: str
    role: UserRole = UserRole.student
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    profile: Optional[dict] = None


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.student
    confirm_password: str

    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if 'password' in info.data and v != info.data['password']:
            raise ValueError('passwords do not match')
        return v

    @field_validator('password')
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('password must be at least 8 characters long')
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    profile: Optional[dict] = None


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str
    confirm_password: str

    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if 'new_password' in info.data and v != info.data['new_password']:
            raise ValueError('passwords do not match')
        return v


class PasswordChange(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if 'new_password' in info.data and v != info.data['new_password']:
            raise ValueError('passwords do not match')
        return v


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    profile: Optional[dict] = None


# =============================================================================
# Utility Functions
# =============================================================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    try:
        # Ensure plain password is bytes and truncate to 72 bytes
        plain_bytes = plain_password.encode('utf-8')[:72]
        # Ensure hashed password is bytes
        hashed_bytes = hashed_password.encode('utf-8') if isinstance(hashed_password, str) else hashed_password
        return bcrypt.checkpw(plain_bytes, hashed_bytes)
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False


def get_password_hash(password: str) -> str:
    """Hash a password."""
    # Truncate password to 72 bytes max for bcrypt
    password_bytes = password.encode('utf-8')[:72]
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed.decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire, "token_type": TokenType.access})
    encoded_jwt = jose_jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "token_type": TokenType.refresh})
    encoded_jwt = jose_jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_password_reset_token(email: str) -> str:
    """Create a JWT password reset token (valid for 1 hour)."""
    expire = datetime.utcnow() + timedelta(hours=1)
    to_encode = {
        "sub": email,
        "exp": expire,
        "token_type": TokenType.reset
    }
    encoded_jwt = jose_jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str, token_type: Optional[TokenType] = TokenType.access) -> TokenData:
    """Verify a JWT token and return the token data."""
    credentials_exception = HTTPException(
        status_code=HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jose_jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        t_type: str = payload.get("token_type")

        if email is None:
            raise credentials_exception

        # Verify token type if specified
        if token_type and t_type != token_type:
            raise HTTPException(
                status_code=HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token type. Expected {token_type}, got {t_type}"
            )

        return TokenData(email=email, role=role, token_type=t_type)
    except JWTError as e:
        logger.error(f"JWT error: {e}")
        raise credentials_exception


# =============================================================================
# Dependency Functions
# =============================================================================

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db = None  # Will be injected from main app
) -> UserAuth:
    """Get the current authenticated user from JWT token."""
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection not available"
        )

    credentials_exception = HTTPException(
        status_code=HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token_data = verify_token(token, TokenType.access)
    except HTTPException:
        raise credentials_exception

    user = await db.users.find_one({"email": token_data.email})

    if user is None:
        raise credentials_exception

    # Convert MongoDB document to UserAuth model
    user['id'] = str(user.pop('_id', user.get('id')))

    # Convert datetime strings back to datetime objects
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    if isinstance(user.get('updated_at'), str):
        user['updated_at'] = datetime.fromisoformat(user['updated_at'])
    if isinstance(user.get('last_login'), str):
        user['last_login'] = datetime.fromisoformat(user['last_login'])

    return UserAuth(**user)


async def get_current_active_user(current_user: UserAuth = Depends(get_current_user)) -> UserAuth:
    """Get the current active user."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def require_role(required_roles: List[UserRole]):
    """Dependency to check if user has required role."""
    async def role_checker(current_user: UserAuth = Depends(get_current_active_user)) -> UserAuth:
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {[r.value for r in required_roles]}"
            )
        return current_user
    return role_checker


def require_verified_user(current_user: UserAuth = Depends(get_current_active_user)) -> UserAuth:
    """Dependency to check if user has verified email."""
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required"
        )
    return current_user
