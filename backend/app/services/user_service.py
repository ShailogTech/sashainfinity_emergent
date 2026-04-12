"""
User Service - Business logic for user management
"""

import os
import uuid
from fastapi import UploadFile
from sqlalchemy.orm import Session
from typing import Dict, Any
import json

from app.models.user import User, UserProfile, InstructorProfile

class UserService:
    """User service class"""

    @staticmethod
    def format_user_profile_response(user: User, profile: UserProfile) -> Dict[str, Any]:
        """
        Format user profile data for API response
        """
        return {
            "id": user.id,
            "username": user.user_login,
            "email": user.user_email,
            "display_name": user.display_name,
            "role": user.role,
            "status": "active" if user.user_status == 0 else "inactive",
            "profile_completed": user.profile_completed,
            "first_name": profile.first_name or "",
            "last_name": profile.last_name or "",
            "phone": profile.phone or "",
            "description": profile.description or "",
            "designation": profile.designation or "",
            "address": profile.address or "",
            "city": profile.city or "",
            "state": profile.state or "",
            "country": profile.country or "",
            "postal_code": profile.postal_code or "",
            "profile_photo": profile.profile_photo or "",
            "cover_photo": profile.cover_photo or "",
            "facebook": profile.facebook or "",
            "twitter": profile.twitter or "",
            "linkedin": profile.linkedin or "",
            "website": profile.website or "",
            "joined_date": user.user_registered
        }

    @staticmethod
    def format_instructor_profile_response(user: User, instructor_profile: InstructorProfile) -> Dict[str, Any]:
        """
        Format instructor profile data for API response
        """
        # Parse JSON fields safely
        try:
            expertise = json.loads(instructor_profile.expertise) if instructor_profile.expertise else []
        except:
            expertise = []

        try:
            education = json.loads(instructor_profile.education) if instructor_profile.education else []
        except:
            education = []

        try:
            certifications = json.loads(instructor_profile.certifications) if instructor_profile.certifications else []
        except:
            certifications = []

        return {
            "id": instructor_profile.id,
            "user_id": user.id,
            "bio": instructor_profile.bio or "",
            "expertise": expertise,
            "experience": instructor_profile.experience or "",
            "education": education,
            "certifications": certifications,
            "social_links": instructor_profile.social_links or {},
            "status": instructor_profile.status,
            "rating": instructor_profile.rating,
            "total_students": instructor_profile.total_students or 0,
            "total_courses": instructor_profile.total_courses or 0,
            "created_at": instructor_profile.created_at
        }

    @staticmethod
    async def save_avatar(file: UploadFile, user_id: int) -> str:
        """
        Save user avatar and return URL
        """
        # Create uploads directory if it doesn't exist
        upload_dir = "uploads/avatars"
        os.makedirs(upload_dir, exist_ok=True)

        # Generate unique filename
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        filename = f"{user_id}_{uuid.uuid4().hex}.{file_extension}"
        file_path = os.path.join(upload_dir, filename)

        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        # Return URL path
        return f"/uploads/avatars/{filename}"

    @staticmethod
    def update_instructor_stats(db: Session, instructor_id: int):
        """
        Update instructor statistics (total courses, students, etc.)
        """
        from models.course import Course

        instructor_profile = db.query(InstructorProfile).filter(
            InstructorProfile.user_id == instructor_id
        ).first()

        if instructor_profile:
            courses = db.query(Course).filter(
                Course.post_author == instructor_id
            ).all()

            instructor_profile.total_courses = len(courses)
            instructor_profile.total_students = sum([c.total_enrollments or 0 for c in courses])

            db.commit()

    @staticmethod
    def calculate_instructor_rating(db: Session, instructor_id: int) -> float:
        """
        Calculate instructor's average rating based on course ratings
        """
        from models.course import Course

        courses = db.query(Course).filter(
            Course.instructor_id == instructor_id,
            Course.course_status == "published"
        ).all()

        if not courses:
            return 0.0

        total_rating = sum([c.course_rating or 0 for c in courses])
        return total_rating / len(courses)

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> User:
        """
        Get user by email address
        """
        return db.query(User).filter(User.user_email == email).first()

    @staticmethod
    def get_user_by_username(db: Session, username: str) -> User:
        """
        Get user by username
        """
        return db.query(User).filter(User.user_login == username).first()

    @staticmethod
    def deactivate_user(db: Session, user_id: int) -> bool:
        """
        Deactivate a user account
        """
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.user_status = "inactive"
            db.commit()
            return True
        return False

    @staticmethod
    def promote_to_instructor(db: Session, user_id: int) -> bool:
        """
        Promote a user to instructor role
        """
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.role == "student":
            user.role = "instructor"

            # Update instructor profile status if exists
            instructor_profile = db.query(InstructorProfile).filter(
                InstructorProfile.user_id == user_id
            ).first()

            if instructor_profile:
                instructor_profile.status = "approved"

            db.commit()
            return True
        return False