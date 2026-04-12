"""
User Management Router - SashaInfinity LMS API
Handles user profiles, instructor applications, and user data management
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import json

from app.core.database import get_db
from app.models.user import User, UserProfile, InstructorProfile
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.services.auth_service import AuthService
from app.services.user_service import UserService
from app.schemas.user import (
    UserProfileUpdate,
    UserProfileResponse,
    InstructorApplicationRequest,
    InstructorProfileResponse,
    UserStatsResponse
)

router = APIRouter()

@router.get("/profile", response_model=UserProfileResponse)
async def get_user_profile(
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's profile information
    """
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    if not profile:
        # Create default profile if not exists
        profile = UserProfile(
            user_id=current_user.id,
            first_name="",
            last_name="",
            phone="",
            description="",
            profile_photo=""
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return UserService.format_user_profile_response(current_user, profile)

@router.put("/profile", response_model=UserProfileResponse)
async def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile
    """
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    # Update profile fields
    update_data = profile_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "social_links" and value:
            profile.social_links = value
        elif hasattr(profile, field):
            setattr(profile, field, value)

    # Update user display name if first/last name provided
    if profile_data.first_name and profile_data.last_name:
        current_user.display_name = f"{profile_data.first_name} {profile_data.last_name}"

    # Mark profile as completed if mandatory fields are filled
    # Mandatory fields: first_name, last_name, phone
    if (profile.first_name and profile.last_name and profile.phone):
        current_user.profile_completed = True
        print(f"✅ Profile completed for user: {current_user.user_email}")

    db.commit()
    db.refresh(profile)

    return UserService.format_user_profile_response(current_user, profile)

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Upload user avatar image
    """
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )

    # Save file and get URL (implementation depends on storage solution)
    avatar_url = await UserService.save_avatar(file, current_user.id)

    # Update user profile
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    profile.profile_photo = avatar_url
    db.commit()
    db.refresh(profile)

    return {"avatar_url": avatar_url}

@router.get("/stats", response_model=UserStatsResponse)
async def get_user_stats(
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get user statistics (enrolled courses, completed courses, etc.)
    """
    if current_user.role == "student":
        enrollments = db.query(Enrollment).filter(
            Enrollment.user_id == current_user.id
        ).all()

        enrolled_courses = len(enrollments)
        completed_courses = len([e for e in enrollments if e.completion_date])
        in_progress_courses = enrolled_courses - completed_courses

        return {
            "role": current_user.role,
            "enrolled_courses": enrolled_courses,
            "completed_courses": completed_courses,
            "in_progress_courses": in_progress_courses,
            "certificates_earned": completed_courses
        }

    elif current_user.role == "instructor":
        courses = db.query(Course).filter(
            Course.post_author == current_user.id
        ).all()

        total_students = sum([c.total_enrollments or 0 for c in courses])
        # Support both uppercase and lowercase status values
        published_courses = len([c for c in courses if c.post_status in ["publish", "PUBLISH", "published", "PUBLISHED"]])

        return {
            "role": current_user.role,
            "total_courses": len(courses),
            "published_courses": published_courses,
            "draft_courses": len(courses) - published_courses,
            "total_students": total_students,
            "total_revenue": sum([c.course_price * (c.total_enrollments or 0) for c in courses])
        }

    else:  # admin
        total_users = db.query(User).count()
        total_courses = db.query(Course).count()
        total_enrollments = db.query(Enrollment).count()

        return {
            "role": current_user.role,
            "total_users": total_users,
            "total_courses": total_courses,
            "total_enrollments": total_enrollments,
            "active_users": db.query(User).filter(User.user_status == "active").count()
        }

# Instructor Application Endpoints

@router.post("/apply-instructor")
async def apply_for_instructor(
    application: InstructorApplicationRequest,
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Apply to become an instructor
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only students can apply to become instructors"
        )

    # Check if already applied
    existing_profile = db.query(InstructorProfile).filter(
        InstructorProfile.user_id == current_user.id
    ).first()

    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Instructor application already submitted"
        )

    # Create instructor profile
    instructor_profile = InstructorProfile(
        user_id=current_user.id,
        bio=application.bio,
        expertise=json.dumps(application.expertise),
        experience=application.experience,
        education=json.dumps(application.education),
        certifications=json.dumps(application.certifications),
        social_links=application.social_links or {},
        status="pending"
    )

    db.add(instructor_profile)
    db.commit()

    return {"message": "Instructor application submitted successfully. We will review your application and get back to you."}

@router.get("/instructor-profile", response_model=InstructorProfileResponse)
async def get_instructor_profile(
    current_user: User = Depends(AuthService.require_instructor),
    db: Session = Depends(get_db)
):
    """
    Get instructor profile information
    """
    instructor_profile = db.query(InstructorProfile).filter(
        InstructorProfile.user_id == current_user.id
    ).first()

    if not instructor_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instructor profile not found"
        )

    return UserService.format_instructor_profile_response(current_user, instructor_profile)

@router.get("/my-courses")
async def get_my_courses(
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get courses based on user role (enrolled courses for students, created courses for instructors)
    """
    if current_user.role == "student":
        enrollments = db.query(Enrollment).options(
            joinedload(Enrollment.course)
        ).filter(Enrollment.user_id == current_user.id).all()

        return [
            {
                "id": enrollment.course.id,
                "title": enrollment.course.post_title,
                "thumbnail": enrollment.course.course_thumbnail,
                "progress": enrollment.course_progress_percentage or 0,
                "enrolled_at": enrollment.enrollment_date,
                "last_accessed": enrollment.updated_at,
                "completion_date": enrollment.completion_date,
                "status": enrollment.enrollment_status
            }
            for enrollment in enrollments
        ]

    elif current_user.role in ["instructor", "admin"]:
        courses = db.query(Course).filter(
            Course.post_author == current_user.id
        ).all()

        return [
            {
                "id": course.id,
                "title": course.post_title,
                "thumbnail": course.course_thumbnail,
                "status": course.post_status,
                "students": course.total_enrollments or 0,
                "lessons": len(course.lessons),
                "created_at": course.created_at,
                "updated_at": course.updated_at
            }
            for course in courses
        ]

    return []


@router.get("/instructors/top")
async def get_top_instructors(
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """
    Get top instructors based on course count and ratings (public endpoint)
    """
    from sqlalchemy import func
    from app.models.instructor_review import InstructorReview

    # Get instructors with their course counts and average ratings
    instructors_query = db.query(
        User.id,
        User.display_name,
        User.user_email,
        UserProfile.profile_photo,
        UserProfile.description,
        UserProfile.designation,
        InstructorProfile.instructor_bio,
        InstructorProfile.instructor_designation,
        func.count(Course.id).label('course_count'),
        func.coalesce(func.avg(InstructorReview.rating), 0).label('avg_rating')
    ).join(
        UserProfile, User.id == UserProfile.user_id, isouter=True
    ).join(
        InstructorProfile, User.id == InstructorProfile.user_id, isouter=True
    ).join(
        Course, User.id == Course.post_author, isouter=True
    ).join(
        InstructorReview, User.id == InstructorReview.instructor_id, isouter=True
    ).filter(
        User.role == "instructor",
        User.user_status == 0  # active status
    ).group_by(
        User.id,
        User.display_name,
        User.user_email,
        UserProfile.profile_photo,
        UserProfile.description,
        UserProfile.designation,
        InstructorProfile.instructor_bio,
        InstructorProfile.instructor_designation
    ).order_by(
        func.count(Course.id).desc(),
        func.avg(InstructorReview.rating).desc()
    ).limit(limit).all()

    return [
        {
            "id": instructor.id,
            "name": instructor.display_name,
            "email": instructor.user_email,
            "profile_photo": instructor.profile_photo or "https://ui-avatars.com/api/?name=" + instructor.display_name.replace(" ", "+"),
            "description": instructor.description or instructor.instructor_bio or "Experienced instructor",
            "expertise": instructor.instructor_designation or instructor.designation or "Instructor",
            "course_count": instructor.course_count,
            "rating": round(float(instructor.avg_rating), 1) if instructor.avg_rating else 0.0
        }
        for instructor in instructors_query
    ]
@router.get("/instructors/{instructor_id}")
async def get_instructor_by_id(
    instructor_id: int,
    db: Session = Depends(get_db)
):
    """Get public instructor profile with real stats"""
    from app.models.course import Course
    user = db.query(User).filter(User.id == instructor_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Instructor not found")
    
    profile = db.query(InstructorProfile).filter(
        InstructorProfile.user_id == instructor_id
    ).first()
    
    # Real stats from DB
    courses = db.query(Course).filter(Course.post_author == instructor_id).all()
    total_courses = len(courses)
    total_students = sum([c.total_enrollments or 0 for c in courses])
    
    return {
        "id": user.id,
        "display_name": user.display_name,
        "user_email": user.user_email,
        "profile": {
            "profile_photo": None,
            "bio": profile.instructor_bio if profile else "",
            "expertise": "[]",
            "experience": profile.instructor_designation if profile else "",
            "rating": float(profile.instructor_rating or 0) if profile else 0.0,
            "social_links": {}
        },
        "total_courses": total_courses,
        "total_students": total_students,
        "total_reviews": 0,
        "average_rating": profile.rating if profile else 0.0
    }
