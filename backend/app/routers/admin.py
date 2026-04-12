"""
Admin Router - SashaInfinity LMS API
Handles admin operations, user management, and system analytics
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging

from app.core.database import get_db
from app.models.user import User, UserProfile, InstructorProfile
from app.models.course import Course, Lesson, CourseCategory, CourseTag, CourseCategoryRelation, CourseTagRelation
from app.models.enrollment import Enrollment, LessonProgress
from app.models.quiz import Quiz, QuizQuestion, QuizQuestionAnswer, QuizAttempt
from app.models.assignment import Assignment, AssignmentSubmission
from app.models.payment import Payment, Order, PaymentStatus, OrderItem
from app.models.certificate import Certificate, IssuedCertificate
from app.services.auth_service import AuthService
from app.services.user_service import UserService
from app.schemas.admin import (
    AdminStatsResponse,
    UserManagementResponse,
    CourseManagementResponse,
    RevenueStatsResponse,
    SystemHealthResponse
)

router = APIRouter()

# Initialize logger for this module
logger = logging.getLogger(__name__)

@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats(
    current_user: User = Depends(AuthService.require_admin),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive admin statistics
    """
    # User statistics
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.user_status == 1).count()  # 1 = active
    students = db.query(User).filter(User.role == "student").count()
    instructors = db.query(User).filter(User.role == "instructor").count()

    # Course statistics
    total_courses = db.query(Course).count()
    # Support both uppercase and lowercase status values
    published_courses = db.query(Course).filter(Course.post_status.in_(["publish", "PUBLISH", "published", "PUBLISHED"])).count()
    draft_courses = db.query(Course).filter(Course.post_status.in_(["draft", "DRAFT"])).count()

    # Enrollment statistics
    total_enrollments = db.query(Enrollment).count()
    completed_enrollments = db.query(Enrollment).filter(
        Enrollment.completion_date.isnot(None)
    ).count()

    # Revenue statistics
    total_revenue = db.query(func.sum(Payment.amount)).filter(
        Payment.payment_status == PaymentStatus.COMPLETED
    ).scalar() or 0

    # Monthly growth
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    new_users_30d = db.query(User).filter(
        User.user_registered >= thirty_days_ago
    ).count()
    new_enrollments_30d = db.query(Enrollment).filter(
        Enrollment.enrollment_date >= thirty_days_ago
    ).count()

    return {
        "user_stats": {
            "total_users": total_users,
            "active_users": active_users,
            "students": students,
            "instructors": instructors,
            "new_users_30d": new_users_30d
        },
        "course_stats": {
            "total_courses": total_courses,
            "published_courses": published_courses,
            "draft_courses": draft_courses,
            "avg_rating": db.query(func.avg(Course.average_rating)).scalar() or 0  # Changed from course_rating to average_rating
        },
        "enrollment_stats": {
            "total_enrollments": total_enrollments,
            "completed_enrollments": completed_enrollments,
            "completion_rate": (completed_enrollments / total_enrollments * 100) if total_enrollments > 0 else 0,
            "new_enrollments_30d": new_enrollments_30d
        },
        "revenue_stats": {
            "total_revenue": total_revenue,
            "avg_course_price": db.query(func.avg(Course.course_price)).scalar() or 0,
            "revenue_30d": db.query(func.sum(Payment.amount)).filter(
                Payment.payment_status == PaymentStatus.COMPLETED,
                Payment.created_at >= thirty_days_ago
            ).scalar() or 0
        }
    }

@router.get("/users", response_model=List[UserManagementResponse])
async def get_users_for_management(
    current_user: User = Depends(AuthService.require_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    role: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get users for admin management with filtering
    """
    query = db.query(User).options(joinedload(User.profile))

    # Apply filters
    if role:
        query = query.filter(User.role == role)

    if status:
        # Convert status string to integer (active=1, inactive=0, suspended=2)
        status_map = {"active": 1, "inactive": 0, "suspended": 2}
        if status in status_map:
            query = query.filter(User.user_status == status_map[status])

    if search:
        query = query.filter(
            User.user_login.contains(search) |
            User.user_email.contains(search) |
            User.display_name.contains(search)
        )

    users = query.offset(skip).limit(limit).all()

    # Map user_status integer to status string
    def get_status_string(status_int):
        status_map = {0: "inactive", 1: "active", 2: "suspended"}
        return status_map.get(status_int, "inactive")

    return [
        {
            "id": user.id,
            "username": user.user_login,
            "email": user.user_email,
            "display_name": user.display_name,
            "role": user.role,
            "status": get_status_string(user.user_status),
            "joined_date": user.user_registered,
            "last_login": user.last_login,
            "total_courses": len(user.enrollments) if user.role == "student" else len(user.courses),
            "profile_complete": bool(user.profile and user.profile.first_name and user.profile.last_name)
        }
        for user in users
    ]

@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: int,
    status: str,
    current_user: User = Depends(AuthService.require_admin),
    db: Session = Depends(get_db)
):
    """
    Update user status (activate/deactivate)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if status not in ["active", "inactive", "suspended"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status"
        )

    # Convert status string to integer
    status_map = {"active": 1, "inactive": 0, "suspended": 2}
    user.user_status = status_map[status]
    db.commit()

    return {"message": f"User status updated to {status}"}

@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    role: str,
    current_user: User = Depends(AuthService.require_admin),
    db: Session = Depends(get_db)
):
    """
    Update user role
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if role not in ["student", "instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role"
        )

    user.role = role

    # If promoting to instructor, approve their application if exists
    if role == "instructor":
        instructor_profile = db.query(InstructorProfile).filter(
            InstructorProfile.user_id == user_id
        ).first()
        if instructor_profile:
            instructor_profile.status = "approved"

    db.commit()

    return {"message": f"User role updated to {role}"}

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(AuthService.require_admin),
    db: Session = Depends(get_db)
):
    """
    Delete a user and all their related data (instructor termination)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Prevent deleting yourself
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )

    # If instructor, delete all their courses and related content
    if user.role == "instructor":
        # Get all courses by this instructor
        courses = db.query(Course).filter(Course.post_author == user_id).all()
        course_ids = [c.id for c in courses]

        if course_ids:
            # Delete certificates
            db.query(IssuedCertificate).filter(
                IssuedCertificate.course_id.in_(course_ids)
            ).delete(synchronize_session=False)

            # Delete quiz attempts
            db.query(QuizAttempt).filter(
                QuizAttempt.course_id.in_(course_ids)
            ).delete(synchronize_session=False)

            # Delete quiz question answers
            quizzes = db.query(Quiz).filter(Quiz.post_parent.in_(course_ids)).all()
            quiz_ids = [q.id for q in quizzes]
            if quiz_ids:
                questions = db.query(QuizQuestion).filter(
                    QuizQuestion.quiz_id.in_(quiz_ids)
                ).all()
                question_ids = [q.question_id for q in questions]
                if question_ids:
                    db.query(QuizQuestionAnswer).filter(
                        QuizQuestionAnswer.belongs_question_id.in_(question_ids)
                    ).delete(synchronize_session=False)
                    db.query(QuizQuestion).filter(
                        QuizQuestion.quiz_id.in_(quiz_ids)
                    ).delete(synchronize_session=False)
                db.query(Quiz).filter(Quiz.post_parent.in_(course_ids)).delete(synchronize_session=False)

            # Delete assignments and submissions
            assignments = db.query(Assignment).filter(
                Assignment.course_id.in_(course_ids)
            ).all()
            assignment_ids = [a.id for a in assignments]
            if assignment_ids:
                db.query(AssignmentSubmission).filter(
                    AssignmentSubmission.assignment_id.in_(assignment_ids)
                ).delete(synchronize_session=False)
                db.query(Assignment).filter(
                    Assignment.course_id.in_(course_ids)
                ).delete(synchronize_session=False)

            # Delete lesson progress
            db.query(LessonProgress).filter(
                LessonProgress.course_id.in_(course_ids)
            ).delete(synchronize_session=False)

            # Delete enrollments
            enrollments = db.query(Enrollment).filter(
                Enrollment.course_id.in_(course_ids)
            ).all()
            enrollment_ids = [e.id for e in enrollments]

            # Delete payments and order items related to these courses
            if course_ids:
                db.query(OrderItem).filter(
                    OrderItem.course_id.in_(course_ids)
                ).delete(synchronize_session=False)

            # Delete enrollments
            db.query(Enrollment).filter(
                Enrollment.course_id.in_(course_ids)
            ).delete(synchronize_session=False)

            # Delete lessons
            db.query(Lesson).filter(
                Lesson.post_parent.in_(course_ids)
            ).delete(synchronize_session=False)

            # Delete courses
            db.query(Course).filter(
                Course.post_author == user_id
            ).delete(synchronize_session=False)

    # Delete user's enrollments if student
    db.query(Enrollment).filter(Enrollment.user_id == user_id).delete(synchronize_session=False)

    # Delete instructor profile if exists
    db.query(InstructorProfile).filter(InstructorProfile.user_id == user_id).delete(synchronize_session=False)

    # Delete user profile
    db.query(UserProfile).filter(UserProfile.user_id == user_id).delete(synchronize_session=False)

    # Delete user
    db.delete(user)
    db.commit()

    return {"message": f"User {user.display_name} and all associated data have been deleted successfully"}

@router.get("/courses", response_model=List[CourseManagementResponse])
async def get_courses_for_management(
    current_user: User = Depends(AuthService.require_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    status: Optional[str] = None,
    instructor_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Get courses for admin management
    """
    query = db.query(Course).options(joinedload(Course.instructor))

    if status:
        query = query.filter(Course.post_status == status)

    if instructor_id:
        query = query.filter(Course.post_author == instructor_id)

    courses = query.offset(skip).limit(limit).all()

    return [
        {
            "id": course.id,
            "title": course.post_title,
            "instructor_name": course.instructor.display_name if course.instructor else "Unknown",
            "status": course.post_status,
            "price": float(course.course_price) if course.course_price else 0.0,
            "enrolled_students": course.total_enrollments or 0,
            "rating": float(course.average_rating) if course.average_rating else 0.0,
            "created_at": course.created_at,
            "updated_at": course.updated_at
        }
        for course in courses
    ]

@router.put("/courses/{course_id}/status")
async def update_course_status(
    course_id: int,
    course_status: str,
    current_user: User = Depends(AuthService.require_admin),
    db: Session = Depends(get_db)
):
    """
    Update course status (publish/draft/pending/private)
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Accept course status conventions: publish, draft, pending, private, archive
    if course_status not in ["draft", "publish", "pending", "private", "archive"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid course status. Must be: draft, publish, pending, private, or archive"
        )

    course.post_status = course_status
    db.commit()

    return {"message": f"Course status updated to {course_status}"}

@router.get("/instructor-applications")
async def get_instructor_applications(
    current_user: User = Depends(AuthService.require_admin),
    status: Optional[str] = Query("pending"),
    db: Session = Depends(get_db)
):
    """
    Get instructor applications (pending = not approved and not blocked)
    """
    query = db.query(InstructorProfile).options(
        joinedload(InstructorProfile.user)
    )

    if status == "pending":
        query = query.filter(
            InstructorProfile.is_approved == False,
            InstructorProfile.is_blocked == False
        )
    elif status == "approved":
        query = query.filter(InstructorProfile.is_approved == True)
    elif status == "rejected":
        query = query.filter(InstructorProfile.is_blocked == True)

    applications = query.all()

    return [
        {
            "id": app.id,
            "user_id": app.user_id,
            "username": app.user.user_login,
            "email": app.user.user_email,
            "display_name": app.user.display_name,
            "bio": app.instructor_bio or "",
            "designation": app.instructor_designation or "",
            "is_approved": app.is_approved,
            "is_blocked": app.is_blocked,
            "applied_at": app.created_at
        }
        for app in applications
    ]

@router.put("/instructor-applications/{application_id}")
async def process_instructor_application(
    application_id: int,
    action: str = Query(..., description="approve or reject"),
    current_user: User = Depends(AuthService.require_admin),
    db: Session = Depends(get_db)
):
    """
    Approve or reject instructor application
    """
    application = db.query(InstructorProfile).filter(
        InstructorProfile.id == application_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    if action not in ["approve", "reject"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid action. Must be 'approve' or 'reject'"
        )

    if action == "approve":
        application.is_approved = True
        application.is_blocked = False
        print(f"✓ Approved instructor application ID {application_id} for user ID {application.user_id}")
    else:
        application.is_approved = False
        application.is_blocked = True
        print(f"✗ Rejected instructor application ID {application_id} for user ID {application.user_id}")

    db.commit()

    return {"message": f"Application {action}d successfully"}

@router.get("/revenue")
async def get_revenue_analytics(
    current_user: User = Depends(AuthService.require_admin),
    period: str = Query("30d"),  # 7d, 30d, 90d, 1y
    db: Session = Depends(get_db)
):
    """
    Get revenue analytics
    """
    # Calculate date range
    if period == "7d":
        start_date = datetime.utcnow() - timedelta(days=7)
    elif period == "30d":
        start_date = datetime.utcnow() - timedelta(days=30)
    elif period == "90d":
        start_date = datetime.utcnow() - timedelta(days=90)
    elif period == "1y":
        start_date = datetime.utcnow() - timedelta(days=365)
    else:
        start_date = datetime.utcnow() - timedelta(days=30)

    # Get revenue data
    payments = db.query(Payment).filter(
        Payment.status == "completed",
        Payment.created_at >= start_date
    ).all()

    total_revenue = sum([p.amount for p in payments])
    total_transactions = len(payments)

    # Revenue by course
    course_revenue = {}
    for payment in payments:
        course_id = payment.course_id
        if course_id not in course_revenue:
            course_revenue[course_id] = {
                "course_title": payment.course.course_title,
                "revenue": 0,
                "transactions": 0
            }
        course_revenue[course_id]["revenue"] += payment.amount
        course_revenue[course_id]["transactions"] += 1

    # Top courses by revenue
    top_courses = sorted(
        course_revenue.values(),
        key=lambda x: x["revenue"],
        reverse=True
    )[:10]

    return {
        "period": period,
        "total_revenue": total_revenue,
        "total_transactions": total_transactions,
        "avg_transaction_value": total_revenue / total_transactions if total_transactions > 0 else 0,
        "top_courses": top_courses
    }

@router.get("/system-health")
async def get_system_health(
    current_user: User = Depends(AuthService.require_admin),
    db: Session = Depends(get_db)
):
    """
    Get system health metrics
    """
    # Database health
    try:
        db.execute("SELECT 1")
        db_status = "healthy"
    except:
        db_status = "unhealthy"

    # Recent activity
    recent_users = db.query(User).filter(
        User.user_registered >= datetime.utcnow() - timedelta(hours=24)
    ).count()

    recent_enrollments = db.query(Enrollment).filter(
        Enrollment.enrollment_date >= datetime.utcnow() - timedelta(hours=24)
    ).count()

    recent_payments = db.query(Payment).filter(
        Payment.created_at >= datetime.utcnow() - timedelta(hours=24),
        Payment.status == "completed"
    ).count()

    return {
        "database_status": db_status,
        "total_users": db.query(User).count(),
        "total_courses": db.query(Course).count(),
        "recent_activity_24h": {
            "new_users": recent_users,
            "new_enrollments": recent_enrollments,
            "completed_payments": recent_payments
        },
        "server_time": datetime.utcnow(),
        "uptime": "healthy"  # This would typically come from system metrics
    }

@router.get("/enrollments")
async def get_enrollments(
    current_user: User = Depends(AuthService.require_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    status: Optional[str] = None,
    course_id: Optional[int] = None,
    student_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Get all enrollments with filtering options
    """
    query = db.query(Enrollment).options(
        joinedload(Enrollment.student),
        joinedload(Enrollment.course)
    )

    if status:
        query = query.filter(Enrollment.enrollment_status == status)

    if course_id:
        query = query.filter(Enrollment.course_id == course_id)

    if student_id:
        query = query.filter(Enrollment.user_id == student_id)

    enrollments = query.order_by(desc(Enrollment.enrollment_date)).offset(skip).limit(limit).all()

    return [
        {
            "id": enrollment.id,
            "student_name": enrollment.student.display_name,
            "student_email": enrollment.student.user_email,
            "course_title": enrollment.course.post_title,
            "course_id": enrollment.course_id,
            "enrollment_date": enrollment.enrollment_date,
            "status": enrollment.enrollment_status,
            "progress": enrollment.course_progress_percentage,
            "completed_lessons": enrollment.completed_lessons,
            "total_lessons": enrollment.total_lessons,
            "completion_date": enrollment.completion_date
        }
        for enrollment in enrollments
    ]

@router.put("/enrollments/{enrollment_id}/status")
async def update_enrollment_status(
    enrollment_id: int,
    status: str,
    reason: Optional[str] = None,
    notify_student: bool = True,
    current_user: User = Depends(AuthService.require_admin),
    db: Session = Depends(get_db)
):
    """
    Update enrollment status with enhanced options for admin management
    """
    from app.services.email_service import EmailService

    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found"
        )

    if status not in ["enrolled", "completed", "cancelled", "suspended"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be: enrolled, completed, cancelled, or suspended"
        )

    old_status = enrollment.enrollment_status
    enrollment.enrollment_status = status

    # Set completion date if status is completed
    if status == "completed" and not enrollment.completion_date:
        enrollment.completion_date = datetime.utcnow()

    # Handle status change notifications
    if notify_student and old_status != status:
        try:
            # Prepare notification details
            notification_data = {
                'student_name': enrollment.student.display_name,
                'student_email': enrollment.student.user_email,
                'course_title': enrollment.course.post_title,
                'course_id': enrollment.course_id,
                'old_status': old_status,
                'new_status': status,
                'changed_by': current_user.display_name,
                'reason': reason or 'Administrative action'
            }

            # Send appropriate notification based on status change
            if status == "cancelled":
                EmailService.send_enrollment_termination_notice(
                    student_email=enrollment.student.user_email,
                    student_name=enrollment.student.display_name,
                    course_title=enrollment.course.post_title,
                    reason=f"Cancelled by administrator: {reason or 'Administrative action'}"
                )
            elif status == "suspended":
                EmailService.send_enrollment_suspension_notice(
                    student_email=enrollment.student.user_email,
                    student_name=enrollment.student.display_name,
                    course_title=enrollment.course.post_title,
                    reason=f"Suspended by administrator: {reason or 'Administrative action'}"
                )
            elif status == "completed":
                EmailService.send_enrollment_completion_notification(
                    student_email=enrollment.student.user_email,
                    student_name=enrollment.student.display_name,
                    course_title=enrollment.course.post_title,
                    course_id=enrollment.course_id,
                    completed_by=current_user.display_name,
                    reason=f"Marked as completed by administrator: {reason or 'Administrative action'}"
                )

            logger.info(f"✅ Sent enrollment status change notification to {enrollment.student.user_email}")

        except Exception as e:
            logger.error(f"❌ Failed to send enrollment notification: {e}")
            # Don't raise the error - continue with the status update

    db.commit()

    return {
        "message": f"Enrollment status updated from {old_status} to {status}",
        "enrollment_id": enrollment_id,
        "student_name": enrollment.student.display_name,
        "course_title": enrollment.course.post_title,
        "notification_sent": notify_student and old_status != status
    }

@router.put("/enrollments/bulk-update")
async def bulk_update_enrollment_status(
    enrollment_ids: List[int],
    status: str,
    reason: Optional[str] = None,
    notify_students: bool = True,
    current_user: User = Depends(AuthService.require_admin),
    db: Session = Depends(get_db)
):
    """
    Bulk update enrollment status for multiple enrollments
    """
    from app.services.email_service import EmailService

    # Get all enrollments
    enrollments = db.query(Enrollment).filter(
        Enrollment.id.in_(enrollment_ids)
    ).all()

    if not enrollments:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No enrollments found with provided IDs"
        )

    # Validate status
    if status not in ["enrolled", "completed", "cancelled", "suspended"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be: enrolled, completed, cancelled, or suspended"
        )

    updated_count = 0
    notification_count = 0

    for enrollment in enrollments:
        old_status = enrollment.enrollment_status
        enrollment.enrollment_status = status

        # Set completion date if status is completed
        if status == "completed" and not enrollment.completion_date:
            enrollment.completion_date = datetime.utcnow()

        updated_count += 1

        # Send notification if requested and status changed
        if notify_students and old_status != status:
            try:
                if status == "cancelled":
                    EmailService.send_enrollment_termination_notice(
                        student_email=enrollment.student.user_email,
                        student_name=enrollment.student.display_name,
                        course_title=enrollment.course.post_title,
                        reason=f"Bulk cancelled by administrator: {reason or 'Administrative action'}"
                    )
                elif status == "suspended":
                    EmailService.send_enrollment_suspension_notice(
                        student_email=enrollment.student.user_email,
                        student_name=enrollment.student.display_name,
                        course_title=enrollment.course.post_title,
                        reason=f"Bulk suspended by administrator: {reason or 'Administrative action'}"
                    )
                elif status == "completed":
                    EmailService.send_enrollment_completion_notification(
                        student_email=enrollment.student.user_email,
                        student_name=enrollment.student.display_name,
                        course_title=enrollment.course.post_title,
                        course_id=enrollment.course_id,
                        completed_by=current_user.display_name,
                        reason=f"Bulk marked as completed by administrator: {reason or 'Administrative action'}"
                    )
                notification_count += 1
                logger.info(f"✅ Sent bulk notification to {enrollment.student.user_email}")

            except Exception as e:
                logger.error(f"❌ Failed to send bulk notification to {enrollment.student.user_email}: {e}")

    db.commit()

    return {
        "message": f"Bulk update completed: {updated_count} enrollments updated",
        "status_changed_to": status,
        "enrollments_updated": updated_count,
        "notifications_sent": notification_count,
        "total_notifications_requested": len(enrollments) if notify_students else 0,
        "changed_by": current_user.display_name,
        "reason": reason
    }

@router.delete("/courses/{course_id}/with-enrollments")
async def delete_course_with_enrollments(
    course_id: int,
    send_notifications: bool = True,
    refund_enrolled_students: bool = False,
    reason: Optional[str] = None,
    current_user: User = Depends(AuthService.require_admin),
    db: Session = Depends(get_db)
):
    """
    Delete a course and all its associated enrollments with proper notifications
    """
    from app.services.email_service import EmailService

    # Get course details
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Get all enrollments for this course
    enrollments = db.query(Enrollment).filter(
        Enrollment.course_id == course_id
    ).all()

    # Prepare notification data
    notifications = []
    for enrollment in enrollments:
        notifications.append({
            'student_email': enrollment.student.user_email,
            'student_name': enrollment.student.display_name,
            'course_title': course.post_title,
            'course_id': course_id,
            'deleted_by': current_user.display_name,
            'reason': reason or 'Course removed by administrator'
        })

    # Delete all related data (similar to existing user deletion logic but for course)
    try:
        # Delete certificates
        db.query(IssuedCertificate).filter(
            IssuedCertificate.course_id == course_id
        ).delete(synchronize_session=False)

        # Delete quiz attempts
        db.query(QuizAttempt).filter(
            QuizAttempt.course_id == course_id
        ).delete(synchronize_session=False)

        # Delete quiz content
        quizzes = db.query(Quiz).filter(Quiz.post_parent == course_id).all()
        quiz_ids = [q.id for q in quizzes]
        if quiz_ids:
            questions = db.query(QuizQuestion).filter(
                QuizQuestion.quiz_id.in_(quiz_ids)
            ).all()
            question_ids = [q.question_id for q in questions]
            if question_ids:
                db.query(QuizQuestionAnswer).filter(
                    QuizQuestionAnswer.belongs_question_id.in_(question_ids)
                ).delete(synchronize_session=False)
                db.query(QuizQuestion).filter(
                    QuizQuestion.quiz_id.in_(quiz_ids)
                ).delete(synchronize_session=False)
            db.query(Quiz).filter(Quiz.post_parent == course_id).delete(synchronize_session=False)

        # Delete assignments and submissions
        assignments = db.query(Assignment).filter(
            Assignment.course_id == course_id
        ).all()
        assignment_ids = [a.id for a in assignments]
        if assignment_ids:
            db.query(AssignmentSubmission).filter(
                AssignmentSubmission.assignment_id.in_(assignment_ids)
            ).delete(synchronize_session=False)
            db.query(Assignment).filter(
                Assignment.course_id == course_id
            ).delete(synchronize_session=False)

        # Delete lesson progress
        db.query(LessonProgress).filter(
            LessonProgress.course_id == course_id
        ).delete(synchronize_session=False)

        # Delete enrollments
        enrollment_ids = [e.id for e in enrollments]
        db.query(Enrollment).filter(
            Enrollment.course_id == course_id
        ).delete(synchronize_session=False)

        # Delete payments and order items related to this course
        db.query(OrderItem).filter(
            OrderItem.course_id == course_id
        ).delete(synchronize_session=False)

        # Delete lessons
        db.query(Lesson).filter(
            Lesson.post_parent == course_id
        ).delete(synchronize_session=False)

        # Delete the course
        db.delete(course)
        db.commit()

        # Send notifications if requested
        if send_notifications and notifications:
            try:
                result = EmailService.send_bulk_course_deletion_notifications(notifications)
                logger.info(f"✅ Sent {result['sent']} deletion notifications, {result['failed']} failed")
            except Exception as e:
                logger.error(f"❌ Failed to send bulk deletion notifications: {e}")

        return {
            "message": f"Course '{course.post_title}' and all related data have been deleted successfully",
            "course_id": course_id,
            "course_title": course.post_title,
            "enrollments_affected": len(enrollments),
            "notifications_sent": len(notifications) if send_notifications else 0,
            "refund_requested": refund_enrolled_students,
            "deleted_by": current_user.display_name,
            "reason": reason or "Course removed by administrator"
        }

    except Exception as e:
        db.rollback()
        logger.error(f"❌ Failed to delete course {course_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete course: {str(e)}"
        )

# Categories Management

@router.get("/categories")
async def get_categories(
    current_user: User = Depends(AuthService.require_admin),
    db: Session = Depends(get_db)
):
    """Get all course categories"""
    categories = db.query(CourseCategory).all()
    return [
        {
            "id": cat.id,
            "name": cat.name,
            "slug": cat.slug,
            "description": cat.description,
            "course_count": len(cat.courses),
            "created_at": cat.created_at
        }
        for cat in categories
    ]

@router.post("/categories")
async def create_category(
    name: str,
    description: str = "",
    current_user: User = Depends(AuthService.require_admin),
    db: Session = Depends(get_db)
):
    """Create a new category"""
    # Generate slug from name
    slug = name.lower().replace(' ', '-').replace('_', '-')

    # Check if slug already exists
    existing = db.query(CourseCategory).filter(CourseCategory.slug == slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists"
        )

    category = CourseCategory(
        name=name,
        slug=slug,
        description=description
    )
    db.add(category)
    db.commit()
    db.refresh(category)

    return {
        "id": category.id,
        "name": category.name,
        "slug": category.slug,
        "description": category.description
    }

@router.put("/categories/{category_id}")
async def update_category(
    category_id: int,
    name: str,
    description: str = "",
    current_user: User = Depends(AuthService.require_admin),
    db: Session = Depends(get_db)
):
    """Update a category"""
    category = db.query(CourseCategory).filter(CourseCategory.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    category.name = name
    category.slug = name.lower().replace(' ', '-').replace('_', '-')
    category.description = description
    db.commit()

    return {"message": "Category updated successfully"}

@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: int,
    current_user: User = Depends(AuthService.require_admin),
    db: Session = Depends(get_db)
):
    """Delete a category"""
    category = db.query(CourseCategory).filter(CourseCategory.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    db.delete(category)
    db.commit()

    return {"message": "Category deleted successfully"}

# Tags Management

@router.get("/tags")
async def get_tags(
    current_user: User = Depends(AuthService.require_admin),
    db: Session = Depends(get_db)
):
    """Get all course tags"""
    tags = db.query(CourseTag).all()
    return [
        {
            "id": tag.id,
            "name": tag.name,
            "slug": tag.slug,
            "description": tag.description,
            "course_count": len(tag.courses),
            "created_at": tag.created_at
        }
        for tag in tags
    ]

@router.post("/tags")
async def create_tag(
    name: str,
    description: str = "",
    current_user: User = Depends(AuthService.require_admin),
    db: Session = Depends(get_db)
):
    """Create a new tag"""
    # Generate slug from name
    slug = name.lower().replace(' ', '-').replace('_', '-')

    # Check if slug already exists
    existing = db.query(CourseTag).filter(CourseTag.slug == slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tag with this name already exists"
        )

    tag = CourseTag(
        name=name,
        slug=slug,
        description=description
    )
    db.add(tag)
    db.commit()
    db.refresh(tag)

    return {
        "id": tag.id,
        "name": tag.name,
        "slug": tag.slug,
        "description": tag.description
    }

@router.put("/tags/{tag_id}")
async def update_tag(
    tag_id: int,
    name: str,
    description: str = "",
    current_user: User = Depends(AuthService.require_admin),
    db: Session = Depends(get_db)
):
    """Update a tag"""
    tag = db.query(CourseTag).filter(CourseTag.id == tag_id).first()
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )

    tag.name = name
    tag.slug = name.lower().replace(' ', '-').replace('_', '-')
    tag.description = description
    db.commit()

    return {"message": "Tag updated successfully"}

@router.delete("/tags/{tag_id}")
async def delete_tag(
    tag_id: int,
    current_user: User = Depends(AuthService.require_admin),
    db: Session = Depends(get_db)
):
    """Delete a tag"""
    tag = db.query(CourseTag).filter(CourseTag.id == tag_id).first()
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )

    db.delete(tag)
    db.commit()

    return {"message": "Tag deleted successfully"}

# Certificates Management

@router.get("/certificates")
async def get_issued_certificates(
    current_user: User = Depends(AuthService.require_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db)
):
    """Get all issued certificates (completed enrollments)"""
    # Get enrollments with completion dates
    enrollments = db.query(Enrollment).options(
        joinedload(Enrollment.student),
        joinedload(Enrollment.course)
    ).filter(
        Enrollment.completion_date.isnot(None)
    ).order_by(desc(Enrollment.completion_date)).offset(skip).limit(limit).all()

    return [
        {
            "id": enrollment.id,
            "student_name": enrollment.student.display_name if enrollment.student else "N/A",
            "student_email": enrollment.student.user_email if enrollment.student else "N/A",
            "course_title": enrollment.course.post_title if enrollment.course else "N/A",
            "course_id": enrollment.course_id,
            "certificate_id": enrollment.certificate_id or f"CERT-{enrollment.id}-{enrollment.course_id}",
            "issue_date": enrollment.completion_date,
            "completion_date": enrollment.completion_date,
            "grade": enrollment.course_progress_percentage or 100
        }
        for enrollment in enrollments
    ]

# Orders Management

@router.get("/orders")
async def get_orders(
    current_user: User = Depends(AuthService.require_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all orders"""
    query = db.query(Order).options(
        joinedload(Order.user),
        joinedload(Order.order_items)
    )

    if status:
        query = query.filter(Order.order_status == status)

    orders = query.order_by(desc(Order.created_at)).offset(skip).limit(limit).all()

    return [
        {
            "id": order.id,
            "order_key": order.order_key,
            "user_name": order.user.display_name if order.user else "N/A",
            "user_email": order.user.user_email if order.user else "N/A",
            "course_title": ", ".join([item.order_item_name for item in order.order_items]) if order.order_items else "N/A",
            "amount": float(order.total_amount or 0),
            "status": order.order_status.value if hasattr(order.order_status, 'value') else str(order.order_status),
            "payment_method": order.payment_method or "N/A",
            "created_at": order.created_at,
            "updated_at": order.updated_at
        }
        for order in orders
    ]
@router.post("/instructors/create")
async def create_instructor_account(
    data: dict,
    current_user: User = Depends(AuthService.require_admin),
    db: Session = Depends(get_db)
):
    """Create a new instructor account directly from admin panel"""
    from app.models.user import InstructorProfile
    import bcrypt

    email = data.get("email", "").strip().lower()
    username = data.get("username", "").strip()
    password = data.get("password", "")
    display_name = data.get("display_name", username)
    bio = data.get("bio", "")

    if not email or not username or not password:
        raise HTTPException(status_code=400, detail="Email, username and password are required")

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    if db.query(User).filter(User.user_login == username).first():
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user = User(
        user_login=username, user_email=email, user_pass=hashed,
        display_name=display_name, role="instructor",
        user_status=1, email_verified=True,
        user_registered=datetime.utcnow()
    )
    db.add(user)
    db.flush()

    profile = InstructorProfile(
        user_id=user.id, bio=bio, status="approved",
        expertise="", experience="", education=""
    )
    db.add(profile)
    db.commit()
    return {"message": "Instructor created successfully", "user_id": user.id, "email": email}


@router.post("/courses/create")
async def admin_create_course(
    data: dict,
    current_user: User = Depends(AuthService.require_admin),
    db: Session = Depends(get_db)
):
    """Create a course and assign to an instructor"""
    title = data.get("title", "").strip()
    instructor_id = data.get("instructor_id")
    category = data.get("category", "General")
    description = data.get("description", "")
    price = float(data.get("price", 0))
    certificate_template_id = data.get("certificate_template_id")

    if not title or not instructor_id:
        raise HTTPException(status_code=400, detail="Title and instructor_id are required")

    from sqlalchemy import or_
    instructor = db.query(User).filter(User.id == instructor_id, or_(User.role == "instructor", User.role == "admin")).first()
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor/Admin not found")

    from app.models.course import Course
    import re
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    existing = db.query(Course).filter(Course.post_name == slug).first()
    if existing:
        slug = f"{slug}-{instructor_id}"

    course = Course(
        post_title=title, post_author=instructor_id,
        post_content=description, post_status="publish",
        post_name=slug, post_type="course",
        course_price=price, course_category=category,
        certificate_template=str(certificate_template_id) if certificate_template_id else ""
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return {"message": "Course created successfully", "course_id": course.id, "title": title}


@router.get("/certificate-templates")
async def get_certificate_templates_admin(
    current_user: User = Depends(AuthService.require_admin),
    db: Session = Depends(get_db)
):
    """Get all certificate templates"""
    from sqlalchemy import text
    rows = db.execute(text("""
        SELECT id, post_title, background_color, title_font_color, title_font_family
        FROM certificates WHERE post_status='publish' ORDER BY id
    """)).fetchall()
    return [{"id": r.id, "name": r.post_title, "bg_color": r.background_color,
             "title_color": r.title_font_color, "font": r.title_font_family} for r in rows]


@router.get("/instructors/list")
async def list_instructors_simple(
    current_user: User = Depends(AuthService.require_admin),
    db: Session = Depends(get_db)
):
    """Get all instructors for dropdown"""
    from sqlalchemy import or_
    instructors = db.query(User).filter(or_(User.role == "instructor", User.role == "admin")).all()
    return [{"id": u.id, "name": (u.display_name or u.user_login) + (" [Admin]" if u.role == "admin" else ""), "email": u.user_email} for u in instructors]

@router.post("/courses/{course_id}/assign-instructor")
async def assign_instructor_to_course(
    course_id: int,
    data: dict,
    current_user: User = Depends(AuthService.require_admin),
    db: Session = Depends(get_db)
):
    """Assign or reassign a course to an instructor"""
    from app.models.course import Course
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    instructor_id = data.get("instructor_id")
    from sqlalchemy import or_
    instructor = db.query(User).filter(User.id == instructor_id, or_(User.role == "instructor", User.role == "admin")).first()
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor/Admin not found")
    course.post_author = instructor_id
    db.commit()
    return {"message": f"Course assigned to {instructor.display_name or instructor.user_login}"}

@router.patch("/courses/{course_id}/force-publish")
async def force_publish_course(
    course_id: int,
    current_user: User = Depends(AuthService.require_admin),
    db: Session = Depends(get_db)
):
    """Force publish a course directly - admin only"""
    from app.models.course import Course
    from sqlalchemy import text
    db.execute(text("UPDATE courses SET post_status='publish' WHERE id=:id"), {"id": course_id})
    db.commit()
    return {"message": "Course published", "course_id": course_id}

@router.patch("/courses/{course_id}/lessons/{lesson_id}/order")
async def update_lesson_order(
    course_id: int,
    lesson_id: int,
    data: dict,
    current_user: User = Depends(AuthService.require_admin),
    db: Session = Depends(get_db)
):
    """Update lesson order and section info"""
    from app.models.course import Lesson
    from sqlalchemy import text
    order = data.get("order", 0)
    db.execute(text("UPDATE lessons SET menu_order=:order WHERE id=:id AND post_parent=:cid"),
               {"order": order, "id": lesson_id, "cid": course_id})
    db.commit()
    return {"message": "Updated"}
