"""
Course Management Router - SashaInfinity LMS API
Handles course CRUD operations, enrollment, and progress tracking
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
import json
import logging

# Get logger for this module
logger = logging.getLogger(__name__)

from app.core.database import get_db
from app.models.user import User
from app.models.course import Course, Lesson
from app.models.quiz import Quiz
from app.models.enrollment import Enrollment, LessonProgress
from app.services.auth_service import AuthService
from app.services.course_service import CourseService
from app.routers.video import extract_video_id
from app.schemas.course import (
    CourseCreate,
    CourseUpdate,
    CourseResponse,
    CourseListResponse,
    PaginatedCoursesResponse,
    LessonCreate,
    LessonUpdate,
    LessonResponse,
    EnrollmentResponse,
    CourseProgressResponse
)

router = APIRouter()

# Course Management Endpoints

@router.get("/", response_model=PaginatedCoursesResponse)
async def get_courses(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    level: Optional[str] = None,
    price_type: Optional[str] = None,
    search: Optional[str] = None,
    status: Optional[str] = "publish",
    instructor_id: Optional[int] = None,
    sort: Optional[str] = "latest",
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(AuthService.get_optional_current_user)
):
    """
    Get list of courses with filtering and pagination
    """
    query = db.query(Course).options(
        joinedload(Course.instructor),
        joinedload(Course.categories),
        joinedload(Course.lessons),
        joinedload(Course.quizzes)
    )

    # Apply filters
    if status:
        query = query.filter(Course.post_status == status)

    if instructor_id:
        query = query.filter(Course.post_author == instructor_id)
    if category:
        category_normalized = category.replace('-', ' ')
        query = query.filter(Course.course_category.ilike(f'%{category_normalized}%'))

    if level:
        query = query.filter(Course.course_level == level)

    if price_type:
        if price_type == "free":
            query = query.filter(
                (Course.course_price_type == "free") | (Course.course_price == 0)
            )
        elif price_type == "paid":
            query = query.filter(
                (Course.course_price_type == "paid") & (Course.course_price > 0)
            )

    if search:
        query = query.filter(
            Course.post_title.contains(search) |
            Course.post_content.contains(search)
        )

    # Apply sorting
    if sort == "price-low":
        query = query.order_by(Course.course_price.asc())
    elif sort == "price-high":
        query = query.order_by(Course.course_price.desc())
    elif sort == "oldest":
        query = query.order_by(Course.post_date.asc())
    else:
        query = query.order_by(Course.post_date.desc())
    # Get total count for pagination
    total = query.count()

    # Calculate pagination
    skip = (page - 1) * page_size
    total_pages = (total + page_size - 1) // page_size  # Ceiling division

    # Apply pagination
    courses = query.offset(skip).limit(page_size).all()

    # Check enrollment status for authenticated users
    enrolled_course_ids = set()
    if current_user:
        enrollments = db.query(Enrollment).filter(
            Enrollment.user_id == current_user.id,
            Enrollment.course_id.in_([c.id for c in courses])
        ).all()
        enrolled_course_ids = {e.course_id for e in enrollments if e.enrollment_status not in ['cancelled', 'suspended']}

    courses_data = [
        {
            "id": course.id,
        "slug": course.post_name or str(course.id),
            "title": course.post_title,
            "description": course.post_content[:200] + "..." if len(course.post_content) > 200 else course.post_content,
            "slug": course.post_name or str(course.id),
            "featured_image": (course.course_thumbnail or "").replace("lms.sashainfinity.com", "sashainfinity.com"),
            "price": course.course_price,
            "sale_price": float(course.course_sale_price) if course.course_sale_price and course.course_sale_price > 0 else None,
            "level": course.course_level,
            "category": course.course_category,
            "course_type": course.course_category or "",
            "instructor": {
                "id": course.instructor.id,
                "name": course.instructor.display_name,
                "avatar": course.instructor.profile.profile_photo if course.instructor.profile else ""
            },
            "stats": {
                "lessons": len(course.lessons),
                "quizzes": len(course.quizzes),
                "duration": sum([int(lesson.lesson_video_duration or 0) for lesson in course.lessons]),
                "students": course.total_enrollments or 0
            },
            "rating": course.average_rating or 0,
            "is_enrolled": course.id in enrolled_course_ids,
            "created_at": course.created_at,
            "updated_at": course.updated_at
        }
        for course in courses
    ]

    return {
        "courses": courses_data,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }


@router.get("/my-courses")
async def get_my_courses(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get courses created by the current instructor with pagination
    """
    # Query courses where the current user is the author
    query = db.query(Course).filter(
        Course.post_author == current_user.id
    ).order_by(Course.created_at.desc())

    # Get total count
    total = query.count()

    # Calculate pagination
    skip = (page - 1) * page_size
    total_pages = (total + page_size - 1) // page_size

    # Get paginated results
    courses = query.offset(skip).limit(page_size).all()

    return {
        "courses": [
            {
                "id": course.id,
        "slug": course.post_name or str(course.id),
                "post_title": course.post_title,
                "post_excerpt": course.post_excerpt,
                "course_thumbnail": course.course_thumbnail,
                "course_price": float(course.course_price) if course.course_price else 0,
                "course_sale_price": float(course.course_sale_price) if course.course_sale_price else None,
                "course_level": course.course_level,
                "course_duration": course.course_duration,
                "course_category": course.course_category,
                "post_status": course.post_status,
                "total_enrollments": course.total_enrollments or 0,
                "average_rating": float(course.average_rating) if course.average_rating else 0,
                "created_at": course.created_at.isoformat() if course.created_at else None,
                "updated_at": course.updated_at.isoformat() if course.updated_at else None
            }
            for course in courses
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(AuthService.get_optional_current_user)
):
    """
    Get detailed course information
    """
    try:
        cid = int(course_id)
        course = db.query(Course).options(
            joinedload(Course.instructor),
            joinedload(Course.quizzes),
            joinedload(Course.enrollments)
        ).filter(Course.id == cid).first()
    except ValueError:
        course = db.query(Course).options(
            joinedload(Course.instructor),
            joinedload(Course.quizzes),
            joinedload(Course.enrollments)
        ).filter(Course.post_name == course_id).first()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Check access permissions for non-published courses
    # SashaInfinity LMS uses "publish" status for published courses
    # Support both uppercase and lowercase status values
    published_statuses = ["publish", "published", "PUBLISH", "PUBLISHED"]
    if course.post_status not in published_statuses:
        # Only allow access if user is admin or the course instructor
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This course is not yet published"
            )

        is_admin = current_user.role == "admin"
        is_instructor = current_user.id == course.post_author

        if not (is_admin or is_instructor):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This course is not yet published"
            )

    # Manually load lessons with correct foreign key
    lessons = db.query(Lesson).filter(Lesson.post_parent == course.id).order_by(Lesson.menu_order).all()
    print(f"DEBUG: Found {len(lessons)} lessons for course {course_id}")
    for lesson in lessons:
        print(f"  - Lesson: {lesson.post_title}")
    course.lessons = lessons

    # Check if user is enrolled
    is_enrolled = False
    enrollment = None
    if current_user:
        enrollment = db.query(Enrollment).filter(
            Enrollment.course_id == course.id,
            Enrollment.user_id == current_user.id
        ).first()
        is_enrolled = enrollment is not None and enrollment.enrollment_status not in ['cancelled', 'suspended']

    return CourseService.format_course_response(course, is_enrolled, enrollment, db)

@router.post("/", response_model=CourseResponse)
async def create_course(
    course_data: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Create a new course (instructor only)
    """
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"🎓 Creating course: {course_data.title} by user {current_user.id}")

    try:
        # Create course with proper field names
        new_course = Course(
            post_title=course_data.title,
            post_content=course_data.content or course_data.description,
            post_excerpt=course_data.excerpt or course_data.description or "",
            post_status="publish" if current_user.role == "admin" else "draft",
            post_author=course_data.instructor_id if (current_user.role == 'admin' and course_data.instructor_id) else current_user.id,
            post_name=course_data.title.lower().replace(' ', '-'),
            course_thumbnail=course_data.thumbnail or "",
            course_intro_video=course_data.intro_video or "",
            course_price=course_data.price,
            course_sale_price=course_data.sale_price if course_data.sale_price is not None else 0,
            course_level=course_data.level,
            course_category=course_data.category or "",
            course_language=course_data.language or "English",
            course_duration=str(course_data.duration) if course_data.duration else "0",
            course_requirements=json.dumps(course_data.requirements) if course_data.requirements else "[]",
            course_benefits=json.dumps(course_data.benefits) if course_data.benefits else "[]"
        )

        db.add(new_course)
        db.commit()
        db.refresh(new_course)

        logger.info(f"✅ Course created successfully: ID={new_course.id}, Status={new_course.post_status}")
        return CourseService.format_course_response(new_course, False, None)
    except Exception as e:
        logger.error(f"❌ Failed to create course: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create course: {str(e)}"
        )

# Handle requests without trailing slash by delegating to the main function
@router.post("", response_model=CourseResponse)
async def create_course_no_slash(
    course_data: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Create a new course (instructor only) - handles requests without trailing slash
    """
    logger.info(f"🎓 Creating course (no slash): {course_data.title} by user {current_user.id}")
    return await create_course(course_data, db, current_user)

@router.put("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: int,
    course_data: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Update course (instructor/admin only)
    """
    import logging
    logger = logging.getLogger(__name__)

    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Check permissions
    if current_user.role != "admin" and course.post_author != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this course"
        )

    logger.info(f"📝 Updating course {course_id}: {course_data.title}")

    try:
        # Update course fields
        update_data = course_data.dict(exclude_unset=True)

        # Field mapping from schema to database model
        field_mapping = {
            "title": "post_title",
            "description": "post_excerpt",
            "content": "post_content",
            "excerpt": "post_excerpt",
            "thumbnail": "course_thumbnail",
            "intro_video": "course_intro_video",
            "price": "course_price",
            "sale_price": "course_sale_price",
            "level": "course_level",
            "category": "course_category",
            "duration": "course_duration",
            "language": "course_language",
            "status": "post_status",
            "sections_meta": "course_sections_meta",
            "course_type": "course_type"
        }

        for field, value in update_data.items():
            if field in ["requirements", "benefits", "faq"] and value is not None:
                setattr(course, f"course_{field}", json.dumps(value))
                logger.info(f"  Updated {field}: {type(value)}")
            elif field in field_mapping:
                setattr(course, field_mapping[field], value)
                logger.info(f"  Updated {field} -> {field_mapping[field]}: {value}")
            elif hasattr(course, f"course_{field}"):
                setattr(course, f"course_{field}", value)
                logger.info(f"  Updated course_{field}: {value}")

        db.commit()
        db.refresh(course)

        logger.info(f"✅ Course {course_id} updated successfully. Status: {course.post_status}")
        return CourseService.format_course_response(course, False, None)
    except Exception as e:
        logger.error(f"❌ Failed to update course {course_id}: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update course: {str(e)}"
        )

@router.delete("/{course_id}")
async def delete_course(
    course_id: int,
    force: str = Query(None, alias="force"),
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    try:
        # Convert force parameter to boolean - handle both string and boolean cases
        force_delete = False
        if force is not None:
            if isinstance(force, str):
                force_delete = force.lower() in ['true', '1', 'yes', 'on']
            elif isinstance(force, bool):
                force_delete = force
            else:
                force_delete = bool(force)

        """
        Delete course (instructor/admin only)

        Args:
            course_id: ID of the course to delete
            force: If True (admin only), delete course even with enrollments and notify students

        Returns:
            Success message with deletion details
        """
        from app.models.enrollment import Enrollment
        from app.services.email_service import EmailService

        # Debug logging
        import logging
        logger = logging.getLogger(__name__)

        logger.info(f"🗑️ DELETE course called: course_id={course_id}, force_raw={force}, force_delete={force_delete}, user_role={current_user.role}, user_id={current_user.id}")
        logger.info(f"🔍 Force parameter details: raw='{force}', parsed={force_delete}, type={type(force)}, exists={force is not None}")

        course = db.query(Course).filter(Course.id == course_id).first()

        if not course:
            logger.warning(f"Course not found: {course_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )

        # Check permissions
        if current_user.role != "admin" and course.post_author != current_user.id:
            logger.warning(f"Unauthorized access attempt: user_id={current_user.id}, course_author={course.post_author}, role={current_user.role}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this course"
            )

        # Check if there are any enrollments
        enrollments = db.query(Enrollment).filter(
            Enrollment.course_id == course_id
        ).all()

        enrollment_count = len(enrollments)
        logger.info(f"Course deletion check: enrollments={enrollment_count}, force_delete={force_delete}, user_role={current_user.role}")

        if enrollment_count > 0:
            # Only admins can force delete
            if not force_delete and current_user.role != 'admin':
                logger.warning(f"Cannot delete course with {enrollment_count} enrollments without force parameter")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot delete course with {enrollment_count} active enrollment(s). Please unenroll all students first or archive the course instead."
                )

            if current_user.role != "admin":
                logger.warning(f"Non-admin user attempting force delete: user_id={current_user.id}, role={current_user.role}")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only administrators can force delete courses with active enrollments"
                )

            # Admin force delete - notify all enrolled students
            notifications = []
            for enrollment in enrollments:
                student = db.query(User).filter(User.id == enrollment.user_id).first()
                if student:
                    notifications.append({
                        'student_email': student.user_email,
                        'student_name': student.display_name,
                        'course_title': course.post_title,
                        'course_id': course.id,
                        'deleted_by': current_user.display_name or 'Administrator'
                    })

            # Send bulk email notifications
            email_results = EmailService.send_bulk_course_deletion_notifications(notifications)

            # Delete all enrollments
            for enrollment in enrollments:
                db.delete(enrollment)

        # Delete the course (cascade will handle lessons, quizzes, assignments)
        db.delete(course)
        db.commit()

        logger.info(f"Course deleted successfully: course_id={course_id}, enrollments_deleted={enrollment_count}, force_delete={force_delete}")

        response_message = {
            "message": "Course deleted successfully",
            "course_id": course_id,
            "enrollments_deleted": enrollment_count,
            "force_deleted": enrollment_count > 0,
            "notifications_sent": len(notifications) if enrollment_count > 0 else 0
        }

        return response_message

    except HTTPException:
        raise
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Unexpected error in course deletion: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete course: {str(e)}"
        )

@router.patch("/{course_id}/publish")
async def publish_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Submit course for publication
    - Instructors: Sets status to 'pending' (awaiting admin approval)
    - Admins: Sets status to 'published' (goes live immediately)
    """
    import logging
    logger = logging.getLogger(__name__)

    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Check permissions
    if current_user.role != "admin" and course.post_author != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to publish this course"
        )

    logger.info(f"🚀 Publishing course {course_id}: {course.post_title} by user {current_user.id} (role: {current_user.role})")

    try:
        # Set status based on role
        if current_user.role == "admin":
            course.post_status = "published"
            message = "Course published successfully"
            logger.info(f"  ✅ Admin published course directly")
        else:
            # Instructors submit for approval
            course.post_status = "pending"
            message = "Course submitted for admin approval"
            logger.info(f"  📝 Instructor submitted course for approval")

        db.commit()
        db.refresh(course)

        logger.info(f"✅ Course {course_id} status updated to: {course.post_status}")
        return {
            "message": message,
            "course_id": course.id,
            "status": course.post_status
        }
    except Exception as e:
        logger.error(f"❌ Failed to publish course {course_id}: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to publish course: {str(e)}"
        )

# Handle requests without trailing slash by delegating to the main function
@router.patch("/{course_id}/publish")
async def publish_course_no_slash(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Submit course for publication - handles requests without trailing slash
    """
    return await publish_course(course_id, db, current_user)

@router.patch("/{course_id}/unpublish")
async def unpublish_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Unpublish a course (instructor/admin only)
    """
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Check permissions
    if current_user.role != "admin" and course.post_author != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to unpublish this course"
        )

    course.post_status = "draft"
    db.commit()
    db.refresh(course)

    return {
        "message": "Course unpublished successfully",
        "course_id": course.id,
        "status": course.post_status
    }

@router.patch("/{course_id}/approve")
async def approve_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Approve a pending course (admin only)
    Changes status from 'pending' to 'published'
    """
    # Check if user is admin
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can approve courses"
        )

    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    if course.post_status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Course status is '{course.post_status}', not 'pending'. Only pending courses can be approved."
        )

    course.post_status = "published"
    db.commit()
    db.refresh(course)

    return {
        "message": "Course approved and published successfully",
        "course_id": course.id,
        "status": course.post_status
    }

@router.patch("/{course_id}/reject")
async def reject_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Reject a pending course (admin only)
    Changes status from 'pending' to 'draft'
    """
    # Check if user is admin
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can reject courses"
        )

    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    if course.post_status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Course status is '{course.post_status}', not 'pending'. Only pending courses can be rejected."
        )

    course.post_status = "draft"
    db.commit()
    db.refresh(course)

    return {
        "message": "Course rejected and sent back to draft",
        "course_id": course.id,
        "status": course.post_status
    }

@router.get("/pending", response_model=List[CourseListResponse])
async def get_pending_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get all pending courses awaiting admin approval (admin only)
    """
    # Check if user is admin
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view pending courses"
        )

    courses = db.query(Course).options(
        joinedload(Course.instructor),
        joinedload(Course.lessons),
        joinedload(Course.quizzes)
    ).filter(Course.post_status == "pending").all()

    return [
        {
            "id": course.id,
        "slug": course.post_name or str(course.id),
            "title": course.post_title,
            "description": course.post_content[:200] + "..." if len(course.post_content) > 200 else course.post_content,
            "slug": course.post_name or str(course.id),
            "featured_image": (course.course_thumbnail or "").replace("lms.sashainfinity.com", "sashainfinity.com"),
            "price": course.course_price,
            "level": course.course_level,
            "category": course.course_category,
            "course_type": course.course_category or "",
            "instructor": {
                "id": course.instructor.id,
                "name": course.instructor.display_name,
                "avatar": course.instructor.profile.profile_photo if course.instructor.profile else ""
            },
            "stats": {
                "lessons": len(course.lessons),
                "quizzes": len(course.quizzes),
                "duration": sum([int(lesson.lesson_video_duration or 0) for lesson in course.lessons]),
                "students": course.total_enrollments or 0
            },
            "rating": course.average_rating or 0,
            "created_at": course.created_at,
            "updated_at": course.updated_at
        }
        for course in courses
    ]

# Lesson Management

@router.get("/{course_id}/lessons", response_model=List[LessonResponse])
async def get_course_lessons(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(AuthService.get_current_user)
):
    """
    Get all lessons for a course
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Check if user has access to course
    if course.post_status != "published":
        if not current_user or (current_user.role != "admin" and course.post_author != current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Course not available"
            )

    lessons = db.query(Lesson).filter(
        Lesson.course_id == course_id
    ).order_by(Lesson.lesson_order).all()

    return [CourseService.format_lesson_response(lesson) for lesson in lessons]

@router.post("/{course_id}/lessons", response_model=LessonResponse)
async def create_lesson(
    course_id: int,
    lesson_data: LessonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.require_instructor)
):
    """
    Create a new lesson for a course with validation
    """
    # Validate course ID
    if course_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid course ID"
        )

    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Check permissions
    if current_user.role != "admin" and course.post_author != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add lessons to this course"
        )

    # Validate lesson data
    if not lesson_data.title or not lesson_data.title.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lesson title is required"
        )

    if len(lesson_data.title) > 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lesson title too long (max 500 characters)"
        )

    # Extract video URL if YouTube URL is provided
    extracted_video_url = lesson_data.video_url
    video_duration = lesson_data.video_duration or 0

    if lesson_data.youtube_url:
        # Validate and extract video ID
        video_id = extract_video_id(lesson_data.youtube_url)
        if video_id:
            try:
                # Import here to avoid circular imports
                import httpx
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.get(
                        f"http://localhost:8000/api/v1/extract/video",
                        params={"url": lesson_data.youtube_url, "quality": "720"}
                    )
                    if response.status_code == 200:
                        video_data = response.json()
                        if video_data.get("success") and video_data.get("data"):
                            extracted_video_url = video_data["data"]["url"]
                            video_duration = video_data["data"]["duration"] or 0
            except Exception as e:
                logger.warning(f"Failed to extract video URL: {e}")
                # Continue with the original URL if extraction fails

    # Get next lesson order
    max_order = db.query(Lesson).filter(
        Lesson.post_parent == course_id
    ).count()

    try:
        new_lesson = Lesson(
            post_title=lesson_data.title.strip(),
            post_content=lesson_data.content or "",
            post_author=current_user.id,
            post_parent=course_id,
            post_name=lesson_data.title.lower().replace(' ', '-')[:200],
            lesson_video_url=extracted_video_url or "",
            lesson_youtube_url=lesson_data.youtube_url or "",
            lesson_video_duration=str(video_duration),
            lesson_preview=lesson_data.is_preview,
            menu_order=max_order + 1,
            post_type="lesson",
            post_status="publish"
        )

        db.add(new_lesson)
        db.commit()
        db.refresh(new_lesson)

        return CourseService.format_lesson_response(new_lesson)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create lesson: {str(e)}"
        )

@router.patch("/{course_id}/lessons/{lesson_id}", response_model=LessonResponse)
async def update_lesson(
    course_id: int,
    lesson_id: int,
    lesson_data: LessonUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Update a lesson for a course
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    if current_user.role != "admin" and course.post_author != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id,
        Lesson.post_parent == course_id
    ).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    # Update fields that were provided
    if lesson_data.title is not None:
        lesson.post_title = lesson_data.title
    if lesson_data.content is not None:
        lesson.post_content = lesson_data.content
    if lesson_data.video_url is not None:
        lesson.lesson_video_url = lesson_data.video_url
    if lesson_data.youtube_url is not None:
        lesson.lesson_youtube_url = lesson_data.youtube_url
    if lesson_data.video_duration is not None:
        lesson.lesson_video_duration = str(lesson_data.video_duration)
    if lesson_data.is_preview is not None:
        lesson.lesson_preview = lesson_data.is_preview
    if lesson_data.menu_order is not None:
        lesson.menu_order = lesson_data.menu_order
    if lesson_data.attachment_url is not None:
        lesson.lesson_attachment_url = lesson_data.attachment_url
    if lesson_data.order is not None:
        lesson.menu_order = lesson_data.order

    try:
        db.commit()
        db.refresh(lesson)
        return CourseService.format_lesson_response(lesson)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update lesson: {str(e)}"
        )

@router.post("/{course_id}/lessons/{lesson_id}/complete")
async def mark_lesson_complete(
    course_id: int,
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_active_user)
):
    """
    Mark a lesson as complete and update course progress
    """
    print(f"DEBUG: mark_lesson_complete called with course_id={course_id} (type: {type(course_id)}), lesson_id={lesson_id} (type: {type(lesson_id)}), user_id={current_user.id}")

    # Check if user is enrolled
    enrollment = db.query(Enrollment).filter(
        Enrollment.course_id == course_id,
        Enrollment.user_id == current_user.id
    ).first()

    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not enrolled in this course"
        )

    # Check if lesson exists and belongs to this course
    print(f"DEBUG: Looking for lesson_id={lesson_id}, course_id={course_id}")
    lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id,
        Lesson.post_parent == course_id
    ).first()

    print(f"DEBUG: Lesson found: {lesson}")
    if lesson:
        print(f"DEBUG: Lesson details - id={lesson.id}, title={lesson.post_title}, parent={lesson.post_parent}")

    if not lesson:
        print(f"DEBUG: Lesson NOT FOUND - raising 404")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found in this course"
        )

    # Check if lesson progress already exists
    lesson_progress = db.query(LessonProgress).filter(
        LessonProgress.enrollment_id == enrollment.id,
        LessonProgress.lesson_id == lesson_id
    ).first()

    print(f"[DEBUG] Lesson progress exists: {lesson_progress is not None}")
    print(f"[DEBUG] Current completed_lessons BEFORE: {enrollment.completed_lessons}")

    if lesson_progress:
        # Update existing progress
        if lesson_progress.progress_status != "completed":
            print(f"[DEBUG] Updating existing lesson progress to completed")
            lesson_progress.progress_status = "completed"
            lesson_progress.completion_date = datetime.utcnow()
            enrollment.completed_lessons = (enrollment.completed_lessons or 0) + 1
        else:
            print(f"[DEBUG] Lesson was already marked as completed - not incrementing")
    else:
        # Create new lesson progress
        print(f"[DEBUG] Creating new lesson progress")
        new_progress = LessonProgress(
            user_id=current_user.id,
            course_id=course_id,
            lesson_id=lesson_id,
            enrollment_id=enrollment.id,
            progress_status="completed",
            completion_date=datetime.utcnow()
        )
        db.add(new_progress)
        enrollment.completed_lessons = (enrollment.completed_lessons or 0) + 1

    print(f"[DEBUG] Current completed_lessons AFTER: {enrollment.completed_lessons}")

    # Get course and update enrollment progress
    course = db.query(Course).filter(Course.id == course_id).first()

    # Get actual total lessons from database (not from relationship which might be cached)
    total_lessons = db.query(Lesson).filter(Lesson.post_parent == course_id).count()
    enrollment.total_lessons = total_lessons

    print(f"[Certificate Check] Completed: {enrollment.completed_lessons}/{total_lessons} lessons")

    # Recalculate overall course progress (lessons, quizzes, assignments)
    from app.services.course_service import CourseService
    progress_data = CourseService.calculate_course_progress(db, enrollment)

    is_course_completed = progress_data.get('overall_progress', 0) >= 100

    print(f"[Progress] Overall: {progress_data.get('overall_progress')}% - Lessons: {progress_data.get('completed_lessons')}/{progress_data.get('total_lessons')}, Quizzes: {progress_data.get('completed_quizzes')}/{progress_data.get('total_quizzes')}, Assignments: {progress_data.get('completed_assignments')}/{progress_data.get('total_assignments')}")

    # If course is completed and no certificate exists, generate one
    if is_course_completed and enrollment.completion_date:
        print(f"[Certificate] Course {course_id} completed by user {current_user.id}!")

        # Check if certificate already exists
        from app.models.certificate import IssuedCertificate
        existing_cert = db.query(IssuedCertificate).filter(
            IssuedCertificate.user_id == current_user.id,
            IssuedCertificate.course_id == course_id
        ).first()

        if not existing_cert:
            try:
                from app.services.certificate_service import CertificateService
                from app.services.email_service import EmailService
                from app.core.config import get_settings

                # Generate certificate using the same approach as certificates router
                course = db.query(Course).filter(Course.id == course_id).first()
                certificate_hash = CertificateService.generate_verification_code()

                # Generate secure, unrecognizable certificate ID
                secure_certificate_id = CertificateService.generate_secure_certificate_id(
                    user_id=current_user.id,
                    course_id=course_id,
                    issue_date=enrollment.completion_date
                )

                # Create certificate record first to get ID
                new_certificate = IssuedCertificate(
                    certificate_id=1,  # Default template ID
                    course_id=course_id,
                    user_id=current_user.id,
                    certificate_hash=certificate_hash,
                    secure_certificate_id=secure_certificate_id,
                    certificate_title=f"Certificate of Completion - {course.post_title}",
                    certificate_content="",
                    completion_date=enrollment.completion_date,
                    course_completion_percentage=100,
                    certificate_download_url=""  # Will be updated after generation
                )

                db.add(new_certificate)
                db.commit()
                db.refresh(new_certificate)

                # Generate certificate with proper certificate_data dictionary
                settings = get_settings()
                certificate_data = {
                    "student_name": current_user.display_name,
                    "course_title": course.post_title,
                    "instructor_name": course.instructor.display_name,
                    "completion_date": enrollment.completion_date,
                    "course_duration": course.course_duration,
                    "certificate_id": str(new_certificate.id),
                    "certificate_hash": certificate_hash,
                    "base_url": settings.FRONTEND_URL
                }

                certificate_url = await CertificateService.generate_certificate(certificate_data)

                # Update certificate with generated URL
                new_certificate.certificate_download_url = certificate_url
                db.commit()
                db.refresh(new_certificate)

                # Update enrollment with certificate information
                enrollment.certificate_id = str(new_certificate.id)
                enrollment.certificate_url = certificate_url
                db.commit()

                # Send email notification
                completion_date = enrollment.completion_date.strftime('%B %d, %Y') if enrollment.completion_date else datetime.utcnow().strftime('%B %d, %Y')

                EmailService.send_certificate_issued_notification(
                    student_email=current_user.user_email,
                    student_name=current_user.display_name,
                    course_title=course.post_title,
                    course_id=course_id,
                    certificate_url=certificate_url,
                    completion_date=completion_date
                )

                print(f"[Certificate] Certificate generated and email sent to {current_user.user_email}")

            except Exception as e:
                print(f"[Certificate] Error generating certificate: {e}")
                import traceback
                traceback.print_exc()
    else:
        print(f"[Certificate] Course NOT completed yet - Progress: {progress_data.get('overall_progress')}%")

    db.commit()

    # Return progress info and certificate status
    response = {
        "message": "Lesson marked as complete",
        "completed_lessons": enrollment.completed_lessons,
        "total_lessons": total_lessons,
        "progress_percentage": enrollment.course_progress_percentage,
        "course_completed": is_course_completed
    }

    # If course is completed, include certificate info
    if is_course_completed:
        response["certificate_available"] = True
        response["course_id"] = course_id

    return response

@router.patch("/{course_id}/lessons/{lesson_id}", response_model=LessonResponse)
async def update_lesson(
    course_id: int,
    lesson_id: int,
    lesson_data: LessonUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Update a lesson with validation
    """
    # Validate IDs
    if course_id <= 0 or lesson_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid course or lesson ID"
        )

    # Get the lesson
    lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id,
        Lesson.post_parent == course_id
    ).first()

    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )

    # Get the course to check permissions
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Check permissions
    if current_user.role != "admin" and course.post_author != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this lesson"
        )

    # Validate and update lesson fields
    if lesson_data.title is not None:
        if not lesson_data.title.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lesson title cannot be empty"
            )
        if len(lesson_data.title) > 500:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lesson title too long (max 500 characters)"
            )
        lesson.post_title = lesson_data.title.strip()
        lesson.post_name = lesson_data.title.lower().replace(' ', '-')[:200]

    if lesson_data.content is not None:
        lesson.post_content = lesson_data.content

    if lesson_data.video_url is not None:
        # Validate video URL format if provided
        if lesson_data.video_url and not lesson_data.video_url.startswith(('/uploads/', 'http://', 'https://')):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid video URL format"
            )
        lesson.lesson_video_url = lesson_data.video_url

    if lesson_data.youtube_url is not None:
        # Validate YouTube URL format if provided
        # Accept any valid URL for youtube_url field
        lesson.lesson_youtube_url = lesson_data.youtube_url or ""

    if lesson_data.video_duration is not None:
        if lesson_data.video_duration < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Video duration cannot be negative"
            )
        lesson.lesson_video_duration = str(lesson_data.video_duration)

    if lesson_data.is_preview is not None:
        lesson.lesson_preview = lesson_data.is_preview
    if lesson_data.menu_order is not None:
        lesson.menu_order = lesson_data.menu_order
    if lesson_data.attachment_url is not None:
        lesson.lesson_attachment_url = lesson_data.attachment_url

    if lesson_data.order is not None:
        if lesson_data.order < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lesson order cannot be negative"
            )
        lesson.menu_order = lesson_data.order

    lesson.post_modified = datetime.now()
    lesson.post_modified_gmt = datetime.now()

    try:
        db.commit()
        db.refresh(lesson)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update lesson: {str(e)}"
        )

    return CourseService.format_lesson_response(lesson)

@router.delete("/{course_id}/lessons/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lesson(
    course_id: int,
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Delete a lesson from a course
    """
    # Get the lesson
    lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id,
        Lesson.post_parent == course_id
    ).first()

    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )

    # Get the course to check permissions
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Check permissions
    if current_user.role != "admin" and course.post_author != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this lesson"
        )

    # Store the video URL for cleanup
    video_url = lesson.lesson_video_url

    # Delete the lesson
    db.delete(lesson)
    db.commit()

    # TODO: Delete the video file from storage if it exists
    # This could be done via a background task or separate service
    # if video_url:
    #     await delete_file_from_storage(video_url)

    return None

# Enrollment Management

@router.post("/{course_id}/enroll", response_model=EnrollmentResponse)
async def enroll_in_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_active_user)
):
    """
    Enroll student in a course
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # SashaInfinity LMS uses "publish" status for published courses
    published_statuses = ["publish", "published", "PUBLISH", "PUBLISHED"]
    if course.post_status not in published_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Course is not available for enrollment"
        )

    # Check if already enrolled
    existing_enrollment = db.query(Enrollment).filter(
        Enrollment.course_id == course_id,
        Enrollment.user_id == current_user.id
    ).first()

    if existing_enrollment:
        # If already enrolled, just return the existing enrollment
        return {
            "id": existing_enrollment.id,
            "course_id": course_id,
            "student_id": current_user.id,
            "status": existing_enrollment.enrollment_status,
            "enrolled_at": existing_enrollment.enrollment_date,
            "progress": existing_enrollment.course_progress_percentage or 0
        }

    # For paid courses, require payment
    if course.course_price > 0:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "message": "Payment required for this course",
                "course_price": course.course_price,
                "requires_payment": True
            }
        )

    # For free courses, create enrollment directly
    # Get total lessons count for this course
    total_lessons_count = db.query(Lesson).filter(Lesson.post_parent == course_id).count()

    new_enrollment = Enrollment(
        course_id=course_id,
        user_id=current_user.id,
        enrollment_status="enrolled",
        total_lessons=total_lessons_count,
        completed_lessons=0
    )

    db.add(new_enrollment)

    # Update course enrollment count
    course.total_enrollments = (course.total_enrollments or 0) + 1

    db.commit()
    db.refresh(new_enrollment)

    return {
        "id": new_enrollment.id,
        "course_id": course_id,
        "student_id": current_user.id,
        "status": new_enrollment.enrollment_status,
        "enrolled_at": new_enrollment.enrollment_date,
        "progress": 0,
        "is_free": True
    }

@router.post("/{course_id}/purchase")
async def purchase_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_active_user)
):
    """
    Purchase a paid course (MOCK PAYMENT - auto-enrolls user)
    In production, this would integrate with payment gateway
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Prevent instructors from purchasing their own courses
    if current_user.role == "instructor":
        # Check if this instructor owns the course
        instructor_courses = db.query(Course).filter(
            Course.id == course_id,
            Course.user_id == current_user.id
        ).first()

        if instructor_courses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Instructors cannot purchase their own courses"
            )

    # SashaInfinity LMS uses "publish" status for published courses
    published_statuses = ["publish", "published", "PUBLISH", "PUBLISHED"]
    if course.post_status not in published_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Course is not available for enrollment"
        )

    # Check if already enrolled
    existing_enrollment = db.query(Enrollment).filter(
        Enrollment.course_id == course_id,
        Enrollment.user_id == current_user.id
    ).first()

    if existing_enrollment:
        return {
            "id": existing_enrollment.id,
            "course_id": course_id,
            "student_id": current_user.id,
            "status": existing_enrollment.enrollment_status,
            "enrolled_at": existing_enrollment.enrollment_date,
            "progress": existing_enrollment.course_progress_percentage or 0,
            "message": "Already enrolled in this course"
        }

    # MOCK PAYMENT: Auto-approve purchase
    # In production, this would create a payment intent and wait for confirmation
    # Get total lessons count for this course
    total_lessons_count = db.query(Lesson).filter(Lesson.post_parent == course_id).count()

    new_enrollment = Enrollment(
        course_id=course_id,
        user_id=current_user.id,
        enrollment_status="enrolled",
        total_lessons=total_lessons_count,
        completed_lessons=0
    )

    db.add(new_enrollment)

    # Update course enrollment count
    course.total_enrollments = (course.total_enrollments or 0) + 1

    db.commit()
    db.refresh(new_enrollment)

    return {
        "id": new_enrollment.id,
        "course_id": course_id,
        "student_id": current_user.id,
        "status": new_enrollment.enrollment_status,
        "enrolled_at": new_enrollment.enrollment_date,
        "progress": 0,
        "payment_status": "completed",
        "is_mock": True,
        "message": f"Successfully enrolled in course. Mock payment of ₹{course.course_price} processed."
    }

@router.get("/{course_id}/progress", response_model=CourseProgressResponse)
async def get_course_progress(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_active_user)
):
    """
    Get user's progress in a course
    """
    enrollment = db.query(Enrollment).filter(
        Enrollment.course_id == course_id,
        Enrollment.user_id == current_user.id
    ).first()

    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not enrolled in this course"
        )

    return CourseService.calculate_course_progress(db, enrollment)

@router.get("/og/{slug}")
async def get_course_og(slug: str, db: Session = Depends(get_db)):
    from fastapi.responses import HTMLResponse
    try:
        course = db.query(Course).filter(Course.id == int(slug)).first()
    except Exception:
        course = db.query(Course).filter(Course.post_name == slug).first()
    if not course:
        return HTMLResponse("<html><head><title>Not Found</title></head><body></body></html>")
    title = (course.post_title or "SashaInfinity").replace('"', "&quot;")
    desc = (course.post_content or "")[:200].replace('"', "&quot;")
    image = (course.course_thumbnail or "").replace("lms.sashainfinity.com", "sashainfinity.com")
    url = "https://sashainfinity.com/courses/" + (course.post_name or str(course.id))
    html = (
        "<!DOCTYPE html><html><head>"
        "<title>" + title + " | SashaInfinity</title>"
        '<meta property="og:title" content="' + title + '" />'
        '<meta property="og:description" content="' + desc + '" />'
        '<meta property="og:image" content="' + image + '" />'
        '<meta property="og:url" content="' + url + '" />'
        '<meta property="og:type" content="website" />'
        '<meta name="twitter:card" content="summary_large_image" />'
        '<meta name="twitter:image" content="' + image + '" />'
        '<meta http-equiv="refresh" content="0;url=' + url + '" />'
        "</head><body><a href="" + url + "">" + title + "</a></body></html>"
    )
    return HTMLResponse(html)
