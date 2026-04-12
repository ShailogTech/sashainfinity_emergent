"""
Authentication Schemas - Pydantic models for auth endpoints
"""

from pydantic import BaseModel, EmailStr, validator
from typing import Optional
import re

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    username: Optional[str] = None  # Optional - will be auto-generated from email if not provided
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    user_type: Optional[str] = "student"  # student or instructor

    # Instructor-specific fields (optional)
    designation: Optional[str] = None
    bio: Optional[str] = None
    experience: Optional[str] = None

    # Frontend validation fields (not used in backend)
    confirm_password: Optional[str] = None
    agree_to_terms: Optional[bool] = None

    @validator('username', pre=True)
    def validate_username(cls, v):
        # Allow empty string or None - backend will auto-generate
        if not v or v == "":
            return None
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters')
        if not re.match(r'^[a-zA-Z0-9_.-]+$', v):
            raise ValueError('Username can only contain letters, numbers, underscores, periods, and hyphens')
        return v

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        return v

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
    user: dict

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    display_name: str
    role: str
    status: str
    message: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        return v

class VerifyEmailRequest(BaseModel):
    token: str