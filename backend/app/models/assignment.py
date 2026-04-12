"""
Assignment models for course assignments
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.types import Numeric as Decimal
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


# Status enums for validation
class AssignmentStatus(str, enum.Enum):
    """Valid assignment statuses"""
    DRAFT = "draft"
    PUBLISHED = "published"
    CLOSED = "closed"


class SubmissionStatus(str, enum.Enum):
    """Valid submission statuses"""
    SUBMITTED = "submitted"
    GRADED = "graded"
    RETURNED = "returned"


class Assignment(Base):
    """
    Assignment model - Similar to Quiz structure
    """
    __tablename__ = "assignments"

    # Core fields
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    instructions = Column(Text, default="")

    # Assignment settings
    due_date = Column(DateTime(timezone=True), nullable=True)
    total_points = Column(Integer, default=100)
    allowed_file_types = Column(JSON, default=[])  # List of allowed file extensions
    max_file_size = Column(Integer, default=10)  # in MB
    max_files = Column(Integer, default=5)
    submission_type = Column(String(50), default="both")  # text, file, both
    attachments = Column(JSON, default=[])  # Instructor reference files

    # Display settings
    status = Column(SQLEnum(AssignmentStatus), default=AssignmentStatus.PUBLISHED, nullable=False)
    order = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    course = relationship("Course", back_populates="assignments")
    creator = relationship("User", foreign_keys=[created_by])
    submissions = relationship("AssignmentSubmission", back_populates="assignment", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Assignment(id={self.id}, title={self.title})>"


class AssignmentSubmission(Base):
    """
    Student submissions for assignments
    """
    __tablename__ = "assignment_submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Submission content
    text_content = Column(Text, default="")
    files = Column(JSON, default=[])  # List of uploaded file URLs

    # Grading
    grade = Column(Decimal(9, 2), nullable=True)
    feedback = Column(Text, default="")
    status = Column(SQLEnum(SubmissionStatus), default=SubmissionStatus.SUBMITTED, nullable=False)

    # Timestamps
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    graded_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User", foreign_keys=[user_id])

    def __repr__(self):
        return f"<AssignmentSubmission(id={self.id}, user_id={self.user_id}, status={self.status})>"
