"""
Authentication Router - SashaInfinity LMS API
Handles user authentication, registration, and token management
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Any

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_password,
    get_password_hash,
    verify_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.models.user import User, UserProfile, InstructorProfile
from app.services.auth_service import AuthService
from app.utils.email import send_verification_email, send_password_reset_email
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
    PasswordResetRequest,
    PasswordChangeRequest,
    RefreshTokenRequest,
    VerifyEmailRequest
)

router = APIRouter()

@router.post("/login", response_model=TokenResponse)
@router.post("/login/", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
) -> Any:
    """
    User login endpoint (handles both /login and /login/)
    Returns access token and refresh token
    """
    # First check if user exists (to provide better error message for unverified users)
    existing_user = db.query(User).filter(User.user_email == request.email).first()

    # If user exists but not verified, show verification message instead of "email not found"
    if existing_user and not existing_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email address before logging in. Check your inbox for the verification email.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Authenticate user
    user, auth_error = AuthService.authenticate_user(db, request.email, request.password)
    if not user:
        # Provide specific error messages
        if auth_error == "email_not_found":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No account found with this email address",
                headers={"WWW-Authenticate": "Bearer"},
            )
        elif auth_error == "incorrect_password":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password. Please try again",
                headers={"WWW-Authenticate": "Bearer"},
            )
        elif auth_error == "instructor_not_approved":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your instructor account is pending approval. Please wait for admin approval to access the system.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed",
                headers={"WWW-Authenticate": "Bearer"},
            )

    # Double-check email is verified (in case authenticate_user didn't catch it)
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email address before logging in. Check your inbox for the verification email.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create tokens
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    # Get user profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()

    # Get instructor profile if user is instructor
    instructor_profile = None
    if user.role == "instructor":
        instructor_profile = db.query(InstructorProfile).filter(
            InstructorProfile.user_id == user.id
        ).first()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "id": user.id,
            "email": user.user_email,
            "login": user.user_login,
            "display_name": user.display_name,
            "role": user.role,
            "profile_completed": user.profile_completed
        },
        "profile": {
            "first_name": profile.first_name if profile else "",
            "last_name": profile.last_name if profile else "",
            "phone": profile.phone if profile else "",
            "avatar_url": profile.profile_photo if profile else "",
            "bio": profile.description if profile else ""
        } if profile else None,
        "instructorProfile": {
            "is_approved": instructor_profile.is_approved if instructor_profile else False,
            "bio": instructor_profile.instructor_bio if instructor_profile else "",
            "designation": instructor_profile.instructor_designation if instructor_profile else ""
        } if instructor_profile else None
    }

@router.post("/register-instructor", response_model=UserResponse)
@router.post("/register-instructor/", response_model=UserResponse)
async def register_instructor(
    request: RegisterRequest,
    db: Session = Depends(get_db)
) -> Any:
    """
    Instructor registration endpoint - creates instructor with pending approval
    """
    print(f"=== INSTRUCTOR REGISTRATION REQUEST ===")
    print(f"Email: {request.email}")
    print(f"Designation: {request.designation}")
    print(f"Bio length: {len(request.bio) if request.bio else 0}")

    # Check if user already exists
    existing_user = db.query(User).filter(User.user_email == request.email).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or username already exists"
        )

    # Create new user
    hashed_password = get_password_hash(request.password)

    # Generate username from email if not provided
    username = request.username
    if not username:
        username = request.email.split('@')[0]
        # Ensure username is unique
        counter = 1
        original_username = username
        while db.query(User).filter(User.user_login == username).first():
            username = f"{original_username}{counter}"
            counter += 1

    # ALWAYS create as instructor
    new_user = User(
        user_login=username,
        user_email=request.email,
        user_pass=hashed_password,
        user_nicename=username.lower().replace(' ', '-'),
        display_name=request.first_name + " " + request.last_name,
        user_status=1,  # 1 = active
        role="instructor",  # FORCE instructor role
        is_active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create user profile
    user_profile = UserProfile(
        user_id=new_user.id,
        first_name=request.first_name,
        last_name=request.last_name,
        phone=request.phone or "",
        description="",
        profile_photo="",
        designation=request.designation or ""
    )

    db.add(user_profile)
    db.commit()

    # Create instructor profile (REQUIRED - pending approval)
    instructor_profile = InstructorProfile(
        user_id=new_user.id,
        instructor_bio=request.bio or "",
        instructor_designation=request.designation or "",
        is_approved=False,  # Requires admin approval
        is_blocked=False,
        profile_completion=50 if (request.bio and request.designation) else 0
    )
    db.add(instructor_profile)
    db.commit()

    print(f"✓ Instructor created: {new_user.user_email}, Profile ID: {instructor_profile.id}, Approved: {instructor_profile.is_approved}")

    # Send verification email
    verification_token = create_access_token(
        data={"sub": str(new_user.id), "type": "email_verification"},
        expires_delta=timedelta(hours=24)
    )

    await send_verification_email(new_user.user_email, verification_token, new_user.display_name)

    return {
        "id": new_user.id,
        "email": new_user.user_email,
        "username": new_user.user_login,
        "display_name": new_user.display_name,
        "role": new_user.role,
        "status": "active",
        "message": "Registration successful! Please check your email to verify your account. Your instructor account is pending admin approval."
    }

@router.get("/check-email")
async def check_email(
    email: str,
    db: Session = Depends(get_db)
) -> Any:
    """
    Check if email is already registered
    """
    existing_user = db.query(User).filter(User.user_email == email).first()
    return {"exists": existing_user is not None}

@router.post("/register", response_model=UserResponse)
@router.post("/register/", response_model=UserResponse)
async def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
) -> Any:
    """
    User registration endpoint
    Creates new user account
    """
    # Debug logging
    print(f"=== REGISTRATION REQUEST ===")
    print(f"Email: {request.email}")
    print(f"User Type: {request.user_type}")
    print(f"Designation: {request.designation}")
    print(f"Bio length: {len(request.bio) if request.bio else 0}")

    # Check if user already exists
    existing_user = db.query(User).filter(User.user_email == request.email).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or username already exists"
        )

    # Create new user
    hashed_password = get_password_hash(request.password)

    # Determine role - default to student
    user_role = getattr(request, 'user_type', 'student')
    if user_role not in ['student', 'instructor']:
        user_role = 'student'

    # Generate username from email if not provided
    username = request.username
    if not username:
        username = request.email.split('@')[0]
        # Ensure username is unique
        counter = 1
        original_username = username
        while db.query(User).filter(User.user_login == username).first():
            username = f"{original_username}{counter}"
            counter += 1

    new_user = User(
        user_login=username,
        user_email=request.email,
        user_pass=hashed_password,
        user_nicename=username.lower().replace(' ', '-'),
        display_name=request.first_name + " " + request.last_name,
        user_status=1,  # 1 = active
        role=user_role,
        is_active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create user profile
    user_profile = UserProfile(
        user_id=new_user.id,
        first_name=request.first_name,
        last_name=request.last_name,
        phone=request.phone or "",
        description="",
        profile_photo="",
        designation=""
    )

    db.add(user_profile)
    db.commit()

    # If instructor, create instructor profile (pending approval)
    if user_role == 'instructor':
        instructor_profile = InstructorProfile(
            user_id=new_user.id,
            instructor_bio=request.bio or "",
            instructor_designation=request.designation or "",
            is_approved=False,  # Requires admin approval
            is_blocked=False,
            profile_completion=50 if (request.bio and request.designation) else 0
        )
        db.add(instructor_profile)
        db.commit()

        # Update user profile with designation if provided
        if request.designation:
            user_profile.designation = request.designation
            db.commit()

    # Send verification email
    verification_token = create_access_token(
        data={"sub": str(new_user.id), "type": "email_verification"},
        expires_delta=timedelta(hours=24)
    )

    await send_verification_email(new_user.user_email, verification_token, new_user.display_name)

    # Different messages for instructors vs students
    if user_role == 'instructor':
        message = "Registration successful! Your instructor account is pending admin approval. You will be notified once approved."
    else:
        message = "Registration successful. Please check your email to verify your account."

    return {
        "id": new_user.id,
        "email": new_user.user_email,
        "username": new_user.user_login,
        "display_name": new_user.display_name,
        "role": new_user.role,
        "status": "active" if new_user.user_status == 1 else "pending",
        "message": message
    }

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db)
) -> Any:
    """
    Refresh access token using refresh token
    """
    try:
        payload = verify_token(request.refresh_token)
        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )

        # Create new access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )

        return {
            "access_token": access_token,
            "refresh_token": request.refresh_token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": {
                "id": user.id,
                "email": user.user_email,
                "login": user.user_login,
                "display_name": user.display_name,
                "role": user.role
            }
        }

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

@router.post("/verify-email")
async def verify_email(
    request: VerifyEmailRequest,
    db: Session = Depends(get_db)
) -> Any:
    """
    Verify user email address
    """
    try:
        # Get token from request body
        token = request.token
        print(f"🔍 Verifying token: {token[:50]}...")  # Debug log

        if not token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token is required"
            )

        payload = verify_token(token)
        print(f"✓ Token decoded successfully: {payload}")  # Debug log

        user_id = payload.get("sub")
        token_type = payload.get("type")

        if user_id is None or token_type != "email_verification":
            print(f"❌ Invalid token type or user_id: type={token_type}, user_id={user_id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification token"
            )

        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            print(f"❌ User not found: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Check if already verified
        if user.is_verified:
            print(f"ℹ️ User {user.user_email} already verified")
            return {"message": "Email has already been verified. You can proceed to login."}

        # Mark email as verified
        user.is_verified = True
        user.user_status = 1  # Set to active (1 = active)
        db.commit()

        print(f"✅ User {user.user_email} verified successfully")
        return {"message": "Email verified successfully. Your account is now active."}

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Verification error: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )

@router.post("/forgot-password")
async def forgot_password(
    request: PasswordResetRequest,
    db: Session = Depends(get_db)
) -> Any:
    """
    Send password reset email
    """
    user = db.query(User).filter(User.user_email == request.email).first()

    if not user:
        # Don't reveal if email exists for security
        return {"message": "If the email exists, a password reset link has been sent."}

    # Create password reset token
    reset_token = create_access_token(
        data={"sub": str(user.id), "type": "password_reset"},
        expires_delta=timedelta(hours=1)
    )

    await send_password_reset_email(user.user_email, reset_token)

    return {"message": "If the email exists, a password reset link has been sent."}

@router.post("/reset-password")
async def reset_password(
    token: str,
    new_password: str,
    db: Session = Depends(get_db)
) -> Any:
    """
    Reset user password using reset token
    """
    try:
        payload = verify_token(token)
        user_id = payload.get("sub")
        token_type = payload.get("type")

        if user_id is None or token_type != "password_reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid reset token"
            )

        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Update password
        user.user_pass = get_password_hash(new_password)
        db.commit()

        return {"message": "Password reset successfully"}

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

@router.post("/change-password")
async def change_password(
    request: PasswordChangeRequest,
    current_user: User = Depends(AuthService.get_current_user)
) -> Any:
    """
    Change user password (requires authentication)
    """
    # Verify current password
    if not verify_password(request.current_password, current_user.user_pass):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    # Update password
    current_user.user_pass = get_password_hash(request.new_password)
    db = next(get_db())
    db.commit()

    return {"message": "Password changed successfully"}

@router.post("/logout")
async def logout(
    current_user: User = Depends(AuthService.get_current_user)
) -> Any:
    """
    Logout user (client should remove tokens)
    """
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get current user information with profile
    """
    # Get user profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

    # Get instructor profile if user is instructor
    instructor_profile = None
    if current_user.role == "instructor":
        instructor_profile = db.query(InstructorProfile).filter(
            InstructorProfile.user_id == current_user.id
        ).first()

    return {
        "id": current_user.id,
        "email": current_user.user_email,
        "username": current_user.user_login,
        "display_name": current_user.display_name,
        "role": current_user.role,
        "status": str(current_user.user_status),
        "profile_completed": current_user.profile_completed,
        "profile": {
            "first_name": profile.first_name if profile else "",
            "last_name": profile.last_name if profile else "",
            "phone": profile.phone if profile else "",
            "avatar_url": profile.profile_photo if profile else "",
            "bio": profile.description if profile else ""
        } if profile else None,
        "instructorProfile": {
            "is_approved": instructor_profile.is_approved if instructor_profile else False,
            "bio": instructor_profile.instructor_bio if instructor_profile else "",
            "designation": instructor_profile.instructor_designation if instructor_profile else ""
        } if instructor_profile else None
    }

import os
import httpx

@router.post("/google")
async def google_login(
    request: dict,
    db: Session = Depends(get_db)
):
    """Login/Register with Google OAuth token"""
    token = request.get("token")
    if not token:
        raise HTTPException(status_code=400, detail="Token required")

    # Verify Google token
    import httpx as httpx_client
    try:
        async with httpx_client.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
            )
            google_data = response.json()
            if response.status_code != 200 or "error" in google_data:
                raise HTTPException(status_code=401, detail="Invalid Google token")
            # Verify audience matches our client ID
            client_id = os.getenv("GOOGLE_CLIENT_ID", "")
            if client_id and google_data.get("aud") != client_id:
                raise HTTPException(status_code=401, detail="Token audience mismatch")
    except httpx_client.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Google verification failed: {str(e)}")

    email = google_data.get("email")
    name = google_data.get("name", "")
    google_id = google_data.get("sub")
    picture = google_data.get("picture", "")

    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by Google")

    # Check if user exists
    user = db.query(User).filter(User.user_email == email).first()

    if not user:
        # Create new user
        import secrets
        username = email.split("@")[0] + "_" + secrets.token_hex(4)
        user = User(
            user_email=email,
            user_login=username,
            user_nicename=username,
            display_name=name,
            user_pass=secrets.token_hex(32),
            role="student",
            is_active=True,
            is_verified=True,

        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Generate JWT token
    from app.core.security import create_access_token
    access_token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "user_email": user.user_email,
            "display_name": user.display_name,
            "role": user.role,
            "is_active": user.is_active,
            "is_verified": user.is_verified
        }
    }

@router.post("/linkedin")
async def linkedin_login(
    request: dict,
    db: Session = Depends(get_db)
):
    """Exchange LinkedIn auth code for user profile and login"""
    import httpx as httpx_client
    import os

    code = request.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Code required")

    client_id = os.getenv("LINKEDIN_CLIENT_ID", "")
    client_secret = os.getenv("LINKEDIN_CLIENT_SECRET", "")
    redirect_uri = "https://lms.sashainfinity.com/auth/linkedin/callback"

    try:
        async with httpx_client.AsyncClient(timeout=10.0) as client:
            # Exchange code for access token
            token_res = await client.post(
                "https://www.linkedin.com/oauth/v2/accessToken",
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": redirect_uri,
                    "client_id": client_id,
                    "client_secret": client_secret,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            if token_res.status_code != 200:
                raise HTTPException(status_code=401, detail="Failed to get LinkedIn token")
            token_data = token_res.json()
            li_access_token = token_data.get("access_token")

            # Get user profile using OpenID Connect userinfo
            profile_res = await client.get(
                "https://api.linkedin.com/v2/userinfo",
                headers={"Authorization": f"Bearer {li_access_token}"}
            )
            if profile_res.status_code != 200:
                raise HTTPException(status_code=401, detail="Failed to get LinkedIn profile")
            profile = profile_res.json()

    except httpx_client.RequestError as e:
        raise HTTPException(status_code=500, detail=f"LinkedIn request failed: {str(e)}")

    email = profile.get("email")
    name = profile.get("name", "")
    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by LinkedIn")

    # Find or create user
    user = db.query(User).filter(User.user_email == email).first()
    if not user:
        import secrets
        username = email.split("@")[0] + "_" + secrets.token_hex(4)
        user = User(
            user_email=email,
            user_login=username,
            user_nicename=username,
            display_name=name,
            user_pass=secrets.token_hex(32),
            role="student",
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    from app.core.security import create_access_token
    access_token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "user_email": user.user_email,
            "display_name": user.display_name,
            "role": user.role,
            "is_active": user.is_active,
            "is_verified": user.is_verified
        }
    }
