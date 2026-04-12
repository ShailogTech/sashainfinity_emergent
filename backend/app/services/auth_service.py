"""
Authentication Service - Business logic for user authentication
"""

from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from typing import Optional

from app.core.database import get_db
from app.core.security import verify_password, verify_token
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
optional_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

class AuthService:
    """Authentication service class"""

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> tuple[Optional[User], Optional[str]]:
        """
        Authenticate user with email and password
        Returns (user, error_message) tuple
        - If successful: (User, None)
        - If email not found: (None, "email_not_found")
        - If password wrong: (None, "incorrect_password")
        - If instructor not approved: (None, "instructor_not_approved")
        """
        from app.models.user import InstructorProfile

        user = db.query(User).filter(User.user_email == email).first()
        if not user:
            return None, "email_not_found"
        if not verify_password(password, user.user_pass):
            return None, "incorrect_password"

        # Check if instructor is approved
        if user.role == "instructor":
            instructor_profile = db.query(InstructorProfile).filter(
                InstructorProfile.user_id == user.id
            ).first()

            # If no instructor profile exists, or if not approved, block login
            if not instructor_profile:
                return None, "instructor_not_approved"

            if not instructor_profile.is_approved:
                return None, "instructor_not_approved"

        return user, None

    @staticmethod
    def get_current_user(
        token: str = Depends(oauth2_scheme),
        db: Session = Depends(get_db)
    ) -> User:
        """
        Get current authenticated user from JWT token
        """
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

        try:
            payload = verify_token(token)
            user_id: str = payload.get("sub")
            if user_id is None:
                raise credentials_exception
        except JWTError:
            raise credentials_exception

        user = db.query(User).filter(User.id == int(user_id)).first()
        if user is None:
            raise credentials_exception

        return user

    @staticmethod
    def get_optional_current_user(
        token: Optional[str] = Depends(optional_oauth2_scheme),
        db: Session = Depends(get_db)
    ) -> Optional[User]:
        """
        Get current user if authenticated, None otherwise (for optional auth)
        """
        if not token:
            return None

        try:
            payload = verify_token(token)
            user_id: str = payload.get("sub")
            if user_id is None:
                return None

            user = db.query(User).filter(User.id == int(user_id)).first()
            return user
        except JWTError:
            return None

    @staticmethod
    def get_current_active_user(
        current_user: User = Depends(get_current_user)
    ) -> User:
        """
        Get current active user (status must be active)
        """
        if not current_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        return current_user

    @staticmethod
    def require_role(allowed_roles: list):
        """
        Decorator to require specific roles
        """
        def role_checker(current_user: User = Depends(get_current_active_user)):
            if current_user.role not in allowed_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions"
                )
            return current_user
        return role_checker

    @staticmethod
    def require_instructor(current_user: User = Depends(get_current_active_user)) -> User:
        """
        Require instructor role
        """
        if current_user.role not in ["instructor", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Instructor access required"
            )
        return current_user

    @staticmethod
    def require_admin(current_user: User = Depends(get_current_active_user)) -> User:
        """
        Require admin role
        """
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        return current_user