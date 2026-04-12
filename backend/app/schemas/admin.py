"""
Admin Schemas - Pydantic models for admin endpoints
"""

from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class UserStats(BaseModel):
    total_users: int
    active_users: int
    students: int
    instructors: int
    new_users_30d: int

class CourseStats(BaseModel):
    total_courses: int
    published_courses: int
    draft_courses: int
    avg_rating: float

class EnrollmentStats(BaseModel):
    total_enrollments: int
    completed_enrollments: int
    completion_rate: float
    new_enrollments_30d: int

class RevenueStats(BaseModel):
    total_revenue: float
    avg_course_price: float
    revenue_30d: float

class AdminStatsResponse(BaseModel):
    user_stats: UserStats
    course_stats: CourseStats
    enrollment_stats: EnrollmentStats
    revenue_stats: RevenueStats

class UserManagementResponse(BaseModel):
    id: int
    username: str
    email: str
    display_name: str
    role: str
    status: str
    joined_date: datetime
    last_login: Optional[datetime]
    total_courses: int
    profile_complete: bool

class CourseManagementResponse(BaseModel):
    id: int
    title: str
    instructor_name: str
    status: str
    price: float
    enrolled_students: int
    rating: float
    created_at: datetime
    updated_at: datetime

class RevenueStatsResponse(BaseModel):
    period: str
    total_revenue: float
    total_transactions: int
    avg_transaction_value: float
    top_courses: List[Dict[str, Any]]

class SystemHealthResponse(BaseModel):
    database_status: str
    total_users: int
    total_courses: int
    recent_activity_24h: Dict[str, int]
    server_time: datetime
    uptime: str