"""
Models package - Import all models to register them with SQLAlchemy
"""
from app.core.database import Base
from app.models.user import User, UserProfile
from app.models.course import Course, Lesson, CourseCategory, CourseTag, CourseReview
from app.models.enrollment import Enrollment, LessonProgress, StudentCourseActivity, CourseAnnouncement, WishlistItem
from app.models.quiz import Quiz, QuizQuestion, QuizQuestionAnswer, QuizAttempt, QuizAttemptAnswer
from app.models.assignment import Assignment, AssignmentSubmission
from app.models.certificate import Certificate, IssuedCertificate, CertificateElementTemplate
from app.models.payment import Payment, Order, OrderItem
from app.models.instructor_review import InstructorReview
from app.models.blog import BlogPost, BlogComment
from app.models.coupon import Coupon, CouponUsage

__all__ = [
    "Base",
    "User",
    "UserProfile",
    "Course",
    "Lesson",
    "CourseCategory",
    "CourseTag",
    "CourseReview",
    "Enrollment",
    "LessonProgress",
    "StudentCourseActivity",
    "CourseAnnouncement",
    "WishlistItem",
    "Quiz",
    "QuizQuestion",
    "QuizQuestionAnswer",
    "QuizAttempt",
    "QuizAttemptAnswer",
    "Assignment",
    "AssignmentSubmission",
    "Certificate",
    "IssuedCertificate",
    "CertificateElementTemplate",
    "Payment",
    "Order",
    "OrderItem",
    "InstructorReview",
    "BlogPost",
    "BlogComment",
    "Coupon",
    "CouponUsage",
]
