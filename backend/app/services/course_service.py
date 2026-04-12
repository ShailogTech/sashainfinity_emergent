"""
Course Service - Business logic for course management
"""

from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from datetime import datetime
import json

from app.models.course import Course, Lesson
from app.models.quiz import Quiz, QuizAttempt
from app.models.enrollment import Enrollment, LessonProgress

class CourseService:
    """Course service class"""

    @staticmethod
    def format_course_response(course: Course, is_enrolled: bool = False, enrollment = None, db: Session = None) -> Dict[str, Any]:
        """
        Format course data for API response
        """
        # Parse JSON fields safely
        try:
            requirements = json.loads(course.course_requirements) if course.course_requirements else []
            # Ensure it's a list, not a dict
            if isinstance(requirements, dict):
                requirements = []
        except:
            requirements = []

        try:
            benefits = json.loads(course.course_benefits) if course.course_benefits else []
            # Ensure it's a list, not a dict
            if isinstance(benefits, dict):
                benefits = []
        except:
            benefits = []

        # FAQ field doesn't exist in current model
        faq = []

        # Get lesson completion status if user is enrolled
        lessons_with_status = []
        if enrollment and db:
            from app.models.enrollment import LessonProgress
            for lesson in course.lessons:
                lesson_progress = db.query(LessonProgress).filter(
                    LessonProgress.enrollment_id == enrollment.id,
                    LessonProgress.lesson_id == lesson.id
                ).first()

                lesson_data = CourseService.format_lesson_info(lesson)
                lesson_data["is_completed"] = lesson_progress.progress_status == "completed" if lesson_progress else False
                lessons_with_status.append(lesson_data)
        else:
            lessons_with_status = [CourseService.format_lesson_info(lesson) for lesson in course.lessons]

        return {
            "id": course.id,
            "slug": course.post_name or str(course.id),
            "title": course.post_title,
            "description": course.post_content,
            "content": course.post_content or "",
            "excerpt": course.post_excerpt or "",
            "thumbnail": (course.course_thumbnail or "").replace("lms.sashainfinity.com", "sashainfinity.com"),
            "intro_video": course.course_intro_video or "",
            "price": float(course.course_price) if course.course_price else 0,
            "sale_price": float(course.course_sale_price) if course.course_sale_price and course.course_sale_price > 0 else None,
            "level": course.course_level,
            "category": course.course_category,
            "duration": int(course.course_duration) if course.course_duration and str(course.course_duration).isdigit() else 0,
            "language": course.course_language or "English",
            "requirements": requirements,
            "benefits": benefits,
            "faq": faq,
            "instructor": {
                "id": course.instructor.id,
                "name": course.instructor.display_name,
                "avatar": course.instructor.profile.profile_photo if course.instructor.profile else ""
            },
            "lessons": lessons_with_status,
            "quizzes": [CourseService.format_quiz_response(quiz) for quiz in course.quizzes],
            "assignments": [CourseService.format_assignment_response(assignment) for assignment in course.assignments],
            "stats": {
                "lessons": len(course.lessons),
                "quizzes": len(course.quizzes),
                "duration": sum([int(lesson.lesson_video_duration or 0) for lesson in course.lessons]),
                "students": course.total_enrollments or 0
            },
            "rating": course.average_rating or 0,
            "is_enrolled": is_enrolled,
            "enrollment_date": enrollment.enrollment_date if enrollment else None,
            "progress": enrollment.course_progress_percentage if enrollment else None,
            "status": course.post_status,
            "sections_meta": getattr(course, "course_sections_meta", "") or "",
            "created_at": course.created_at,
            "updated_at": course.updated_at
        }

    @staticmethod
    def format_lesson_info(lesson: Lesson) -> Dict[str, Any]:
        """
        Format brief lesson data for course response (LessonInfo schema)
        """
        return {
            "id": lesson.id,
            "title": lesson.post_title,
            "duration": int(lesson.lesson_video_duration) if lesson.lesson_video_duration else 0,
            "is_preview": bool(lesson.lesson_preview),
            "order": lesson.menu_order,
            "lesson_video": lesson.lesson_video_url or "",
            "youtube_url": getattr(lesson, 'lesson_youtube_url', "") or "",
            "lesson_content": lesson.post_content or "",
            "attachment_url": getattr(lesson, "lesson_attachment_url", "") or "",
            "lesson_title": lesson.post_title,
            "created_at": lesson.created_at,
            "post_date": lesson.post_date
        }

    @staticmethod
    def format_lesson_response(lesson: Lesson) -> Dict[str, Any]:
        """
        Format full lesson data for API response (LessonResponse schema)
        """
        return {
            "id": lesson.id,
            "title": lesson.post_title,
            "content": lesson.post_content or "",
            "video_url": lesson.lesson_video_url or "",
            "video_duration": int(lesson.lesson_video_duration) if lesson.lesson_video_duration else 0,
            "is_preview": bool(lesson.lesson_preview),
            "order": lesson.menu_order,
            "course_id": lesson.post_parent,
            "created_at": lesson.created_at,
            "updated_at": lesson.updated_at,
            "youtube_url": getattr(lesson, 'lesson_youtube_url', "") or ""
        }

    @staticmethod
    def format_quiz_response(quiz: Quiz) -> Dict[str, Any]:
        """
        Format quiz data for API response
        """
        return {
            "id": quiz.id,
            "title": quiz.post_title,
            "questions_count": len(quiz.questions) if quiz.questions else 0,
            "time_limit": quiz.quiz_time_limit,
            "created_at": quiz.created_at
        }

    @staticmethod
    def format_assignment_response(assignment) -> Dict[str, Any]:
        """
        Format assignment data for API response
        """
        return {
            "id": assignment.id,
            "title": assignment.title,
            "description": assignment.description,
            "total_points": assignment.total_points,
            "created_at": assignment.created_at
        }

    @staticmethod
    def calculate_course_progress(db: Session, enrollment: Enrollment) -> Dict[str, Any]:
        """
        Calculate student's progress in a course
        """
        from app.models.assignment import Assignment, AssignmentSubmission

        course = enrollment.course

        # Get lesson progress
        lesson_progress = db.query(LessonProgress).filter(
            LessonProgress.enrollment_id == enrollment.id
        ).all()

        completed_lessons = len([lp for lp in lesson_progress if lp.progress_status == "completed"])
        total_lessons = len(course.lessons)

        # Get quiz attempts - calculate passed quizzes
        quiz_attempts = db.query(QuizAttempt).join(Quiz).filter(
            QuizAttempt.user_id == enrollment.user_id,
            QuizAttempt.course_id == enrollment.course_id,
            QuizAttempt.attempt_status == "attempt_ended"
        ).all()

        # Count passed quizzes based on earned_marks vs total_marks and passing_grade
        completed_quizzes = 0
        for attempt in quiz_attempts:
            if attempt.total_marks > 0:
                percentage = (float(attempt.earned_marks) / float(attempt.total_marks)) * 100
                # Get the quiz's passing grade
                quiz = db.query(Quiz).filter(Quiz.id == attempt.quiz_id).first()
                if quiz and percentage >= quiz.quiz_passing_grade:
                    completed_quizzes += 1

        total_quizzes = len(course.quizzes) if course.quizzes else 0

        # Get assignment submissions - calculate graded assignments
        all_assignments = db.query(Assignment).filter(
            Assignment.course_id == enrollment.course_id
        ).all()

        completed_assignments = 0
        if all_assignments:
            student_submissions = db.query(AssignmentSubmission).filter(
                AssignmentSubmission.user_id == enrollment.user_id,
                AssignmentSubmission.assignment_id.in_([a.id for a in all_assignments]),
                AssignmentSubmission.status == "graded"
            ).all()
            completed_assignments = len(student_submissions)

        total_assignments = len(all_assignments) if all_assignments else 0

        # Calculate overall progress
        total_content = total_lessons + total_quizzes + total_assignments
        completed_content = completed_lessons + completed_quizzes + completed_assignments

        overall_progress = (completed_content / total_content * 100) if total_content > 0 else 0

        # Check if course is completed
        is_completed = (completed_lessons == total_lessons and
                       completed_quizzes == total_quizzes and
                       completed_assignments == total_assignments and
                       total_content > 0)

        # Update enrollment progress
        enrollment.course_progress_percentage = int(overall_progress)
        if is_completed and not enrollment.completion_date:
            enrollment.completion_date = datetime.utcnow()

        db.commit()

        return {
            "course_id": course.id,
            "student_id": enrollment.user_id,
            "total_lessons": total_lessons,
            "completed_lessons": completed_lessons,
            "total_quizzes": total_quizzes,
            "completed_quizzes": completed_quizzes,
            "total_assignments": total_assignments,
            "completed_assignments": completed_assignments,
            "overall_progress": overall_progress,
            "last_accessed": enrollment.updated_at,
            "completion_date": enrollment.completion_date,
            "certificate_earned": is_completed,
            "completed_lesson_ids": [lp.lesson_id for lp in lesson_progress if lp.progress_status == "completed"]
        }

    @staticmethod
    def get_course_categories(db: Session) -> list:
        """
        Get all available course categories
        """
        categories = db.query(Course.course_category).distinct().all()
        return [cat[0] for cat in categories if cat[0]]

    @staticmethod
    def get_instructor_courses(db: Session, instructor_id: int, status: Optional[str] = None) -> list:
        """
        Get all courses for a specific instructor
        """
        query = db.query(Course).filter(Course.instructor_id == instructor_id)

        if status:
            query = query.filter(Course.course_status == status)

        return query.all()

    @staticmethod
    def update_lesson_order(db: Session, course_id: int, lesson_orders: Dict[int, int]) -> bool:
        """
        Update the order of lessons in a course
        """
        try:
            for lesson_id, new_order in lesson_orders.items():
                lesson = db.query(Lesson).filter(
                    Lesson.id == lesson_id,
                    Lesson.course_id == course_id
                ).first()

                if lesson:
                    lesson.lesson_order = new_order

            db.commit()
            return True
        except Exception:
            db.rollback()
            return False