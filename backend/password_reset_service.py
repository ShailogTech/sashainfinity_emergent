"""
Password Reset Service for Sasha Infinity LMS.
Handles secure password reset token generation and validation.
"""
import secrets
import string
from datetime import datetime, timezone, timedelta
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class PasswordResetService:
    """Service for managing password reset operations."""

    def __init__(self, db):
        self.db = db

    async def create_reset_token(self, email: str) -> str:
        """
        Create a secure password reset token.

        Args:
            email: User's email address

        Returns:
            Reset token
        """
        # Generate a secure random token
        alphabet = string.ascii_letters + string.digits
        token = ''.join(secrets.choice(alphabet) for _ in range(64))

        # Store token in database
        await self.db.password_reset_tokens.insert_one({
            "email": email,
            "token": token,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
            "used": False
        })

        return token

    async def validate_reset_token(self, token: str) -> Optional[str]:
        """
        Validate a password reset token and return the associated email.

        Args:
            token: Reset token to validate

        Returns:
            Email address if valid, None otherwise
        """
        reset_record = await self.db.password_reset_tokens.find_one({
            "token": token,
            "used": False
        })

        if not reset_record:
            return None

        # Check if token is expired
        expires_at = datetime.fromisoformat(reset_record["expires_at"])
        if datetime.now(timezone.utc) > expires_at:
            return None

        return reset_record["email"]

    async def mark_token_used(self, token: str) -> bool:
        """
        Mark a reset token as used.

        Args:
            token: Reset token to mark as used

        Returns:
            True if successful, False otherwise
        """
        result = await self.db.password_reset_tokens.update_one(
            {"token": token},
            {"$set": {"used": True, "used_at": datetime.now(timezone.utc).isoformat()}}
        )
        return result.modified_count > 0

    async def cleanup_expired_tokens(self) -> int:
        """
        Remove expired tokens from database.
        Should be run periodically (e.g., daily).

        Returns:
            Number of tokens removed
        """
        result = await self.db.password_reset_tokens.delete_many({
            "expires_at": {"$lt": datetime.now(timezone.utc).isoformat()}
        })
        return result.deleted_count

    async def invalidate_user_tokens(self, email: str) -> int:
        """
        Invalidate all unused tokens for a user.

        Args:
            email: User's email address

        Returns:
            Number of tokens invalidated
        """
        result = await self.db.password_reset_tokens.update_many(
            {"email": email, "used": False},
            {"$set": {"used": True, "invalidated_at": datetime.now(timezone.utc).isoformat()}}
        )
        return result.modified_count
