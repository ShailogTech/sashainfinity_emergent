"""
Authentication routes for Sasha Infinity LMS.
Handles user registration, login, logout, password reset, and profile management.
"""
import os
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import EmailStr
import logging

from auth import (
    # Models
    UserRole, Token, TokenData, UserAuth, UserRegister, UserLogin,
    UserResponse, PasswordResetRequest, PasswordResetConfirm,
    PasswordChange, UserProfileUpdate,
    # Utils
    verify_password, get_password_hash, create_access_token,
    create_refresh_token, create_password_reset_token, verify_token,
    # Dependencies
    get_current_user, get_current_active_user, require_role,
)
from password_reset_service import PasswordResetService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["authentication"])


# =============================================================================
# Helper Functions
# =============================================================================

async def send_verification_email(email: str, token: str):
    """Send verification email to user."""
    # In production, integrate with email service (SendGrid, AWS SES, etc.)
    verification_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/verify-email?token={token}"
    logger.info(f"Verification email would be sent to {email}: {verification_url}")
    # TODO: Implement actual email sending


async def send_password_reset_email(email: str, token: str):
    """Send password reset email to user."""
    # In production, integrate with email service
    reset_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token={token}"
    logger.info(f"Password reset email would be sent to {email}: {reset_url}")
    # TODO: Implement actual email sending


# =============================================================================
# Database Dependency (will be injected from main app)
# =============================================================================

_db = None

def set_database(database):
    """Set the database instance for auth routes."""
    global _db
    _db = database


def get_db():
    """Get the database instance."""
    return _db


# =============================================================================
# Authentication Endpoints
# =============================================================================

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user: UserRegister,
    background_tasks: BackgroundTasks
):
    """
    Register a new user.

    - **name**: User's full name
    - **email**: User's email address (must be unique)
    - **password**: User's password (min 8 characters)
    - **role**: User role (student, instructor, admin) - defaults to student
    - **confirm_password**: Must match password
    """
    if _db is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database not initialized"
        )

    try:
        # Check if user already exists
        existing_user = await _db.users.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Hash the password
        hashed_password = get_password_hash(user.password)

        # Create user document
        now = datetime.now(timezone.utc)
        user_doc = {
            "name": user.name,
            "email": user.email,
            "hashed_password": hashed_password,
            "role": user.role.value if isinstance(user.role, UserRole) else user.role,
            "is_active": True,
            "is_verified": False,  # Email verification required
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
            "last_login": None,
            "profile": {
                "bio": None,
                "avatar": None,
                "preferences": {}
            }
        }

        # Insert into database
        result = await _db.users.insert_one(user_doc)

        # Create verification token
        verification_token = create_password_reset_token(user.email)

        # Send verification email in background
        background_tasks.add_task(send_verification_email, user.email, verification_token)

        # Return user response
        return UserResponse(
            id=str(result.inserted_id),
            name=user.name,
            email=user.email,
            role=user.role,
            is_active=True,
            is_verified=False,
            created_at=now
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration"
        )


@router.post("/login", response_model=Token)
async def login_user(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login user with OAuth2 form data.

    - **username**: Email address
    - **password**: User password
    """
    if _db is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database not initialized"
        )

    try:
        # Find user by email (username in OAuth2 form)
        user = await _db.users.find_one({"email": form_data.username})

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Verify password
        if not verify_password(form_data.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Update last login
        await _db.users.update_one(
            {"email": user["email"]},
            {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
        )

        # Create tokens
        access_token = create_access_token(
            data={"sub": user["email"], "role": user["role"]}
        )
        refresh_token = create_refresh_token(
            data={"sub": user["email"]}
        )

        # Prepare user data for response
        user_data = {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "is_active": user.get("is_active", True),
            "is_verified": user.get("is_verified", False)
        }

        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=30 * 60,  # 30 minutes in seconds
            user=user_data
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login"
        )


@router.post("/login-json", response_model=Token)
async def login_user_json(login_data: UserLogin):
    """
    Login user with JSON payload (easier for frontend integration).

    - **email**: User's email address
    - **password**: User's password
    """
    if _db is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database not initialized"
        )

    try:
        # Find user by email
        user = await _db.users.find_one({"email": login_data.email})

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Verify password
        if not verify_password(login_data.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Update last login
        await _db.users.update_one(
            {"email": user["email"]},
            {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
        )

        # Create tokens
        access_token = create_access_token(
            data={"sub": user["email"], "role": user["role"]}
        )
        refresh_token = create_refresh_token(
            data={"sub": user["email"]}
        )

        # Prepare user data for response
        user_data = {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "is_active": user.get("is_active", True),
            "is_verified": user.get("is_verified", False)
        }

        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=30 * 60,
            user=user_data
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login"
        )


@router.post("/refresh-token")
async def refresh_token(refresh_token: str):
    """
    Refresh access token using refresh token.

    - **refresh_token**: Valid refresh token from login
    """
    try:
        # Verify refresh token
        token_data = verify_token(refresh_token, "refresh")

        # Check if user still exists and is active
        user = await _db.users.find_one({"email": token_data.email})
        if not user or not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        # Create new access token
        access_token = create_access_token(
            data={"sub": user["email"], "role": user["role"]}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 30 * 60
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


@router.post("/logout")
async def logout_user(current_user: UserAuth = Depends(get_current_active_user)):
    """
    Logout user.

    Note: In JWT-based authentication, logout is handled client-side
    by removing the token. This endpoint can be used for:
    - Token blacklisting (if implemented)
    - Logging the logout event
    - Invalidating refresh tokens
    """
    try:
        # Log logout event
        await _db.logout_events.insert_one({
            "user_id": current_user.id,
            "email": current_user.email,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        return {"message": "Successfully logged out"}
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        # Don't fail logout if logging fails
        return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserAuth = Depends(get_current_active_user)):
    """
    Get current authenticated user information.

    Returns the user's profile including name, email, role, and verification status.
    """
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at,
        profile=current_user.profile
    )


@router.put("/profile", response_model=UserResponse)
async def update_user_profile(
    profile_update: UserProfileUpdate,
    current_user: UserAuth = Depends(get_current_active_user)
):
    """
    Update user profile (name and custom profile data).

    - **name**: New name (optional)
    - **profile**: Custom profile data (optional)
    """
    try:
        update_data = {}
        update_doc = {}

        # Update name if provided
        if profile_update.name:
            update_data["name"] = profile_update.name
            update_doc["name"] = profile_update.name

        # Update profile if provided
        if profile_update.profile:
            update_data["profile"] = profile_update.profile
            update_doc["profile"] = profile_update.profile

        # Update timestamp
        update_doc["updated_at"] = datetime.now(timezone.utc).isoformat()

        if update_doc:
            await _db.users.update_one(
                {"_id": current_user.id},
                {"$set": update_doc}
            )

            # Fetch updated user
            updated_user = await _db.users.find_one({"_id": current_user.id})
            return UserResponse(
                id=str(updated_user["_id"]),
                name=updated_user["name"],
                email=updated_user["email"],
                role=updated_user["role"],
                is_active=updated_user.get("is_active", True),
                is_verified=updated_user.get("is_verified", False),
                created_at=datetime.fromisoformat(updated_user["created_at"]),
                profile=updated_user.get("profile")
            )

        return UserResponse(
            id=current_user.id,
            name=current_user.name,
            email=current_user.email,
            role=current_user.role,
            is_active=current_user.is_active,
            is_verified=current_user.is_verified,
            created_at=current_user.created_at,
            profile=current_user.profile
        )

    except Exception as e:
        logger.error(f"Profile update error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during profile update"
        )


@router.post("/change-password")
async def change_password(
    password_change: PasswordChange,
    current_user: UserAuth = Depends(get_current_active_user)
):
    """
    Change user password.

    - **current_password**: Current password for verification
    - **new_password**: New password (min 8 characters)
    - **confirm_password**: Must match new_password
    """
    try:
        # Verify current password
        if not verify_password(password_change.current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Current password is incorrect"
            )

        # Hash new password
        new_hashed_password = get_password_hash(password_change.new_password)

        # Update password in database
        await _db.users.update_one(
            {"_id": current_user.id},
            {
                "$set": {
                    "hashed_password": new_hashed_password,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                    "password_changed_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )

        return {"message": "Password changed successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password change error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during password change"
        )


@router.post("/forgot-password")
async def forgot_password(
    request: PasswordResetRequest,
    background_tasks: BackgroundTasks
):
    """
    Initiate password reset by sending reset email.

    - **email**: User's email address
    """
    try:
        # Check if user exists
        user = await _db.users.find_one({"email": request.email})

        # Always return success to prevent email enumeration
        if not user:
            logger.warning(f"Password reset requested for non-existent email: {request.email}")
            return {"message": "If the email exists, a reset link has been sent"}

        # Create password reset token
        reset_token = create_password_reset_token(request.email)

        # Store reset token in database
        await _db.password_reset_tokens.insert_one({
            "email": request.email,
            "token": reset_token,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
            "used": False
        })

        # Send reset email in background
        background_tasks.add_task(send_password_reset_email, request.email, reset_token)

        return {"message": "If the email exists, a reset link has been sent"}

    except Exception as e:
        logger.error(f"Forgot password error: {str(e)}")
        # Don't expose error to user
        return {"message": "If the email exists, a reset link has been sent"}


@router.post("/reset-password")
async def reset_password(reset_data: PasswordResetConfirm):
    """
    Complete password reset using reset token.

    - **token**: Password reset token from email
    - **new_password**: New password (min 8 characters)
    - **confirm_password**: Must match new_password
    """
    try:
        # Verify token
        from auth import TokenType
        token_data = verify_token(reset_data.token, TokenType.reset)

        # Check if token exists in database and is not used
        reset_record = await _db.password_reset_tokens.find_one({
            "token": reset_data.token,
            "used": False
        })

        if not reset_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )

        # Check if token is expired
        expires_at = datetime.fromisoformat(reset_record["expires_at"])
        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reset token has expired"
            )

        # Find user
        user = await _db.users.find_one({"email": token_data.email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Hash new password
        new_hashed_password = get_password_hash(reset_data.new_password)

        # Update password
        await _db.users.update_one(
            {"email": token_data.email},
            {
                "$set": {
                    "hashed_password": new_hashed_password,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                    "password_changed_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )

        # Mark token as used
        await _db.password_reset_tokens.update_one(
            {"token": reset_data.token},
            {"$set": {"used": True}}
        )

        return {"message": "Password reset successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password reset error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during password reset"
        )


@router.post("/verify-email")
async def verify_email(token: str):
    """
    Verify user email using verification token.

    - **token**: Email verification token
    """
    try:
        from auth import TokenType
        # Verify token (reuse password reset token type for verification)
        token_data = verify_token(token, TokenType.reset)

        # Find and update user
        user = await _db.users.find_one({"email": token_data.email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Mark user as verified
        await _db.users.update_one(
            {"email": token_data.email},
            {"$set": {"is_verified": True}}
        )

        return {"message": "Email verified successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Email verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during email verification"
        )


@router.post("/resend-verification")
async def resend_verification(
    request: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    current_user: UserAuth = Depends(get_current_active_user)
):
    """
    Resend email verification link.
    """
    try:
        # Create new verification token
        verification_token = create_password_reset_token(current_user.email)

        # Send verification email in background
        background_tasks.add_task(send_verification_email, current_user.email, verification_token)

        return {"message": "Verification email sent"}

    except Exception as e:
        logger.error(f"Resend verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while sending verification email"
        )
