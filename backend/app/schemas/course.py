"""
Course Schemas - Pydantic models for course endpoints
"""

from pydantic import BaseModel, validator
from typing import List, Optional, Dict, Any
from datetime import datetime

class CourseBase(BaseModel):
    title: str
    description: str
    content: Optional[str] = ""
    excerpt: Optional[str] = ""
    thumbnail: Optional[str] = ""
    intro_video: Optional[str] = ""
    price: float = 0
    sale_price: Optional[float] = None
    level: str = "beginner"
    category: str
    duration: Optional[int] = 0
    language: Optional[str] = "English"
    requirements: Optional[List[str]] = []
    benefits: Optional[List[str]] = []
    faq: Optional[List[Dict[str, str]]] = []

    @validator('level')
    def validate_level(cls, v):
        allowed_levels = ['beginner', 'intermediate', 'advanced', 'expert']
        if v not in allowed_levels:
            raise ValueError(f'Level must be one of: {allowed_levels}')
        return v

    @validator('price')
    def validate_price(cls, v):
        if v < 0:
            raise ValueError('Price cannot be negative')
        return v

class CourseCreate(CourseBase):
    instructor_id: Optional[int] = None  # Admin only
    pass

class CourseUpdate(BaseModel):
    sections_meta: Optional[str] = None  # JSON sections structure
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    thumbnail: Optional[str] = None
    intro_video: Optional[str] = None
    price: Optional[float] = None
    sale_price: Optional[float] = None
    level: Optional[str] = None
    category: Optional[str] = None
    duration: Optional[int] = None
    language: Optional[str] = None
    requirements: Optional[List[str]] = None
    benefits: Optional[List[str]] = None
    faq: Optional[List[Dict[str, str]]] = None
    status: Optional[str] = None

class InstructorInfo(BaseModel):
    id: int
    name: str
    avatar: str

class CourseStats(BaseModel):
    lessons: int
    quizzes: int
    duration: int
    students: int

class CourseListResponse(BaseModel):
    id: int
    title: str
    description: str
    featured_image: str
    price: float
    sale_price: Optional[float] = None
    level: str
    category: str
    instructor: InstructorInfo
    stats: CourseStats
    rating: float
    is_enrolled: bool = False
    created_at: datetime
    updated_at: datetime

class PaginatedCoursesResponse(BaseModel):
    courses: List[CourseListResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class LessonInfo(BaseModel):
    attachment_url: Optional[str] = None
    id: int
    title: str
    duration: Optional[int]
    is_preview: bool
    order: int
    lesson_video: Optional[str] = ""
    lesson_content: Optional[str] = ""
    lesson_title: Optional[str] = ""
    youtube_url: Optional[str] = ""
    created_at: Optional[datetime] = None
    post_date: Optional[datetime] = None

class QuizInfo(BaseModel):
    id: int
    title: str
    questions_count: int
    time_limit: Optional[int]
    created_at: datetime

class AssignmentInfo(BaseModel):
    id: int
    title: str
    description: Optional[str]
    total_points: int
    created_at: datetime

class CourseResponse(BaseModel):
    slug: Optional[str] = None
    id: int
    title: str
    description: str
    content: str
    excerpt: str
    thumbnail: str
    intro_video: str
    price: float
    sale_price: Optional[float] = None
    level: str
    category: str
    duration: int
    language: str
    requirements: List[str]
    benefits: List[str]
    faq: List[Dict[str, str]]
    instructor: InstructorInfo
    lessons: List[LessonInfo]
    quizzes: List[QuizInfo]
    assignments: List[AssignmentInfo]
    stats: CourseStats
    rating: float
    is_enrolled: bool
    enrollment_date: Optional[datetime]
    progress: Optional[float]
    status: str
    sections_meta: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# Lesson Schemas

class LessonBase(BaseModel):
    title: str
    content: Optional[str] = ""
    video_url: Optional[str] = ""
    video_duration: Optional[int] = 0
    is_preview: bool = False
    youtube_url: Optional[str] = ""

class LessonCreate(LessonBase):
    pass

class LessonUpdate(BaseModel):
    menu_order: Optional[int] = None
    attachment_url: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None
    video_url: Optional[str] = None
    youtube_url: Optional[str] = None
    video_duration: Optional[int] = None
    is_preview: Optional[bool] = None
    order: Optional[int] = None

class LessonResponse(BaseModel):
    id: int
    title: str
    content: str
    video_url: str
    video_duration: Optional[int]
    is_preview: bool
    order: int
    course_id: int
    created_at: datetime
    updated_at: datetime
    youtube_url: Optional[str] = ""

# Enrollment Schemas

class EnrollmentResponse(BaseModel):
    id: int
    course_id: int
    student_id: int
    status: str
    enrolled_at: datetime
    progress: float

class CourseProgressResponse(BaseModel):
    course_id: int
    student_id: int
    total_lessons: int
    completed_lessons: int
    total_quizzes: int
    completed_quizzes: int
    overall_progress: float
    last_accessed: Optional[datetime]
    completion_date: Optional[datetime]
    certificate_earned: bool