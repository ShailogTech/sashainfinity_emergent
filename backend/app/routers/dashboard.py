from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, text, desc, or_, Integer
from typing import Any, Dict, List
from datetime import datetime, timedelta

from app.core.database import get_db
from app.services.auth_service import AuthService
from app.models.user import User
from app.models.course import Course, CourseReview
from app.models.enrollment import Enrollment, LessonProgress
from app.models.payment import Payment, Order, OrderItem, PaymentStatus

router = APIRouter()


def get_recent_activities(user_id: int, db: Session, limit: int = 10) -> List[Dict]:
    """
    Get recent activities for a student
    Shows recent enrollments
    """
    activities = []

    # Get recent enrollments (last 30 days)
    recent_enrollments = db.query(Enrollment).filter(
        Enrollment.user_id == user_id,
        Enrollment.enrollment_date >= datetime.now() - timedelta(days=30)
    ).order_by(desc(Enrollment.enrollment_date)).limit(limit).all()

    for enrollment in recent_enrollments:
        course = db.query(Course).filter(Course.id == enrollment.course_id).first()
        if course:
            activities.append({
                "type": "enrollment",
                "action": "Enrolled in course",
                "title": f"Enrolled in {course.post_title}",
                "course": course.post_title,
                "description": "Started learning",
                "timestamp": enrollment.enrollment_date.strftime("%Y-%m-%d %H:%M") if enrollment.enrollment_date else "Recently",
                "time": get_relative_time(enrollment.enrollment_date) if enrollment.enrollment_date else "Recently"
            })

    return activities


def get_relative_time(dt: datetime) -> str:
    """Convert datetime to relative time string"""
    if not dt:
        return "Recently"

    # Make both datetimes timezone-aware for comparison
    now = datetime.now(dt.tzinfo) if dt.tzinfo else datetime.now()
    # If dt has timezone but now doesn't, make dt naive
    if dt.tzinfo and not now.tzinfo:
        dt = dt.replace(tzinfo=None)
    diff = now - dt

    if diff.days > 30:
        return f"{diff.days // 30} month{'s' if diff.days // 30 > 1 else ''} ago"
    elif diff.days > 0:
        return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
    elif diff.seconds >= 3600:
        hours = diff.seconds // 3600
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    elif diff.seconds >= 60:
        minutes = diff.seconds // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    else:
        return "Just now"


@router.get("/student")
async def get_student_dashboard(
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get student dashboard statistics
    """
    # Get enrolled courses count
    enrolled_count = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id
    ).count()

    # Get completed courses count
    completed_count = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.enrollment_status == "completed"
    ).count()

    # Calculate total learning hours from actual course durations
    total_hours = 0
    enrollments = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id
    ).all()

    for enrollment in enrollments:
        course = db.query(Course).filter(Course.id == enrollment.course_id).first()
        if course and course.course_duration:
            try:
                # Try to parse hours from duration string (e.g., "20 hours", "3 weeks")
                duration_str = str(course.course_duration).lower()
                if 'hour' in duration_str:
                    hours = int(''.join(filter(str.isdigit, duration_str)))
                    total_hours += hours
                elif 'week' in duration_str:
                    weeks = int(''.join(filter(str.isdigit, duration_str)))
                    total_hours += weeks * 10  # Estimate 10 hours per week
            except:
                pass

    # Get certificates count (completed courses)
    certificates_count = completed_count

    # Get enrolled courses with details
    enrollments = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id
    ).limit(10).all()

    enrolled_courses = []
    for enrollment in enrollments:
        course = db.query(Course).filter(Course.id == enrollment.course_id).first()
        if course:
            # Get real lesson counts from enrollment
            total_lessons = enrollment.total_lessons or 0
            completed_lessons = enrollment.completed_lessons or 0

            # Get instructor name
            instructor = db.query(User).filter(User.id == course.post_author).first()
            instructor_name = instructor.display_name if instructor else "Instructor"

            # Calculate average rating from reviews
            reviews = db.query(func.avg(func.cast(CourseReview.rating, Integer))).filter(
                CourseReview.course_id == course.id,
                CourseReview.review_status == "approved"
            ).scalar()
            avg_rating = float(reviews) if reviews else 0.0

            enrolled_courses.append({
                "id": course.id,
                "title": course.post_title,
                "thumbnail": course.course_thumbnail or "/api/placeholder/300/200",
                "progress": enrollment.course_progress_percentage or 0,
                "totalLessons": total_lessons,
                "completedLessons": completed_lessons,
                "instructor": instructor_name,
                "rating": round(avg_rating, 1),
                "nextLesson": "Continue Learning" if enrollment.course_progress_percentage < 100 else "Completed",
                "enrollment_status": enrollment.enrollment_status
            })

    # Get recent activities
    recent_activity = get_recent_activities(current_user.id, db, limit=10)

    # Calculate weekly learning goal (based on this week's activity)
    week_start = datetime.now() - timedelta(days=datetime.now().weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)

    # Count lessons completed this week
    lessons_this_week = db.query(LessonProgress).filter(
        LessonProgress.user_id == current_user.id,
        LessonProgress.progress_status == "completed",
        LessonProgress.completion_date >= week_start
    ).count()

    # Calculate estimated hours from lessons completed this week
    # Assume average 30 minutes per lesson
    hours_this_week = lessons_this_week * 0.5

    # Set a goal based on enrolled courses (aim for 1 hour per enrolled course per week)
    weekly_goal_hours = max(enrolled_count * 1, 5)  # Minimum 5 hours
    weekly_progress_percentage = min(int((hours_this_week / weekly_goal_hours) * 100), 100) if weekly_goal_hours > 0 else 0

    return {
        "stats": {
            "enrolled_courses": enrolled_count,
            "completed_courses": completed_count,
            "total_hours": total_hours,
            "certificates": certificates_count
        },
        "enrolled_courses": enrolled_courses,
        "recent_activity": recent_activity,
        "weekly_goal": {
            "goal_hours": weekly_goal_hours,
            "completed_hours": round(hours_this_week, 1),
            "progress_percentage": weekly_progress_percentage,
            "lessons_completed": lessons_this_week
        }
    }


@router.get("/instructor")
async def get_instructor_dashboard(
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get instructor dashboard statistics
    """
    # Verify user is instructor
    if current_user.role != "instructor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized as instructor"
        )

    # Get courses created by instructor
    courses = db.query(Course).filter(
        Course.post_author == current_user.id
    ).all()

    total_courses = len(courses)

    # Get total students enrolled in instructor's courses
    course_ids = [course.id for course in courses]
    total_students = 0
    if course_ids:
        total_students = db.query(Enrollment).filter(
            Enrollment.course_id.in_(course_ids)
        ).count()

    # Calculate total earnings through orders
    total_earnings = 0
    if course_ids:
        # Join Payment with Order and OrderItem to get course_id
        payments = db.query(Payment).join(
            Order, Payment.order_id == Order.id
        ).join(
            OrderItem, OrderItem.order_id == Order.id
        ).filter(
            OrderItem.course_id.in_(course_ids),
            Payment.payment_status == PaymentStatus.COMPLETED
        ).all()
        total_earnings = sum(float(p.amount or 0) for p in payments)

    # Average rating (mock for now)
    average_rating = 4.8

    # Get course details
    course_list = []
    for course in courses[:10]:  # Limit to 10
        enrollments = db.query(Enrollment).filter(
            Enrollment.course_id == course.id
        ).count()

        course_list.append({
            "id": course.id,
            "title": course.post_title,
            "students": enrollments,
            "total_enrollments": enrollments,
            "rating": 4.8,
            "average_rating": 4.8,
            "earnings": course.course_price or 0,
            "course_price": course.course_price or 0,
            "course_sale_price": course.course_sale_price or course.course_price or 0,
            "course_duration": course.course_duration or "4 weeks",
            "status": "published"
        })

    # Get recent enrollments in instructor's courses
    recent_activity = []
    if course_ids:
        recent_enrollments = db.query(Enrollment).filter(
            Enrollment.course_id.in_(course_ids),
            Enrollment.enrollment_date >= datetime.now() - timedelta(days=30)
        ).order_by(desc(Enrollment.enrollment_date)).limit(10).all()

        for enrollment in recent_enrollments:
            student = db.query(User).filter(User.id == enrollment.user_id).first()
            course = db.query(Course).filter(Course.id == enrollment.course_id).first()
            if student and course:
                recent_activity.append({
                    "type": "enrollment",
                    "action": "New enrollment",
                    "title": f"{student.display_name} enrolled",
                    "course": course.post_title,
                    "description": f"New student in {course.post_title}",
                    "timestamp": enrollment.enrollment_date.strftime("%Y-%m-%d %H:%M") if enrollment.enrollment_date else "Recently",
                    "time": get_relative_time(enrollment.enrollment_date) if enrollment.enrollment_date else "Recently"
                })

    return {
        "stats": {
            "total_courses": total_courses,
            "total_students": total_students,
            "total_earnings": f"₹{total_earnings:,.0f}",
            "average_rating": average_rating
        },
        "courses": course_list,
        "recent_activity": recent_activity
    }


@router.get("/admin")
async def get_admin_dashboard(
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get admin dashboard statistics
    """
    # Verify user is admin
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized as admin"
        )

    # Get total counts
    total_courses = db.query(Course).count()
    total_students = db.query(User).filter(User.role == "student").count()
    total_enrollments = db.query(Enrollment).count()

    # Calculate total revenue
    total_payments = db.query(Payment).filter(
        Payment.payment_status == PaymentStatus.COMPLETED
    ).all()
    total_revenue = sum(float(p.amount or 0) for p in total_payments)

    # Get recent courses
    recent_courses = db.query(Course).order_by(
        Course.created_at.desc()
    ).limit(10).all()

    course_list = []
    for course in recent_courses:
        enrollments = db.query(Enrollment).filter(
            Enrollment.course_id == course.id
        ).count()

        # Calculate revenue for this course through orders
        course_payments = db.query(Payment).join(
            Order, Payment.order_id == Order.id
        ).filter(
            Order.course_id == course.id,
            Payment.payment_status == PaymentStatus.COMPLETED
        ).all()
        course_revenue = sum(float(p.amount or 0) for p in course_payments)

        course_list.append({
            "id": course.id,
            "title": course.post_title,
            "students": enrollments,
            "revenue": f"₹{course_revenue:,.0f}",
            "rating": 4.8,
            "status": "Published"
        })

    # Get recent enrollments
    recent_enrollments = db.query(Enrollment).order_by(
        Enrollment.enrollment_date.desc()
    ).limit(10).all()

    enrollment_list = []
    for enrollment in recent_enrollments:
        student = db.query(User).filter(User.id == enrollment.user_id).first()
        course = db.query(Course).filter(Course.id == enrollment.course_id).first()

        if student and course:
            enrollment_list.append({
                "student": student.display_name,
                "course": course.post_title,
                "date": enrollment.enrollment_date.strftime("%Y-%m-%d") if enrollment.enrollment_date else "Recent",
                "status": "active"
            })

    return {
        "stats": {
            "total_courses": total_courses,
            "total_students": total_students,
            "total_revenue": f"₹{total_revenue:,.0f}",
            "active_enrollments": total_enrollments
        },
        "recent_courses": course_list,
        "recent_enrollments": enrollment_list
    }
