"""
Nano Learning API Module
Comprehensive backend for 5-minute video modules and micro-challenges
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, ConfigDict, EmailStr, validator
from typing import List, Optional, Dict, Any
import uuid
import logging
from datetime import datetime, timezone, timedelta
from enum import Enum

# Create router for nano learning endpoints
nano_router = APIRouter(prefix="/api/nano")

# Models
class NanoChapter(BaseModel):
    """5-minute video chapter model"""
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    course_id: str
    title: str
    description: str
    video_url: str
    duration: int = 300  # 5 minutes in seconds
    order: int
    thumbnail: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NanoChapterCreate(BaseModel):
    """Create nano chapter input"""
    course_id: str
    title: str
    description: str
    video_url: str
    duration: int = 300
    order: int
    thumbnail: Optional[str] = None

class ChapterMarker(BaseModel):
    """Chapter marker for video navigation"""
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    chapter_id: str
    title: str
    timestamp: int  # seconds from start
    description: Optional[str] = None
    thumbnail: Optional[str] = None

class MicroChallenge(BaseModel):
    """Micro-challenge model"""
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    chapter_id: str
    challenge_type: str  # "quiz", "code", "drag_drop", "fill_blank"
    question: str
    options: Optional[List[str]] = None
    correct_answer: Any
    time_limit: int = 30  # seconds
    points: int = 10
    hint: Optional[str] = None
    explanation: Optional[str] = None
    difficulty: str = "medium"  # "easy", "medium", "hard"

class NanoProgress(BaseModel):
    """User progress tracking"""
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    course_id: str
    chapter_id: str
    video_progress: float = 0.0
    video_completed: bool = False
    quiz_completed: bool = False
    quiz_score: int = 0
    last_position: int = 0
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CourseProgress(BaseModel):
    """Course-level progress summary"""
    model_config = ConfigDict(extra="ignore")

    total_chapters: int
    completed_chapters: int
    overall_progress: float
    total_points: int
    current_streak: int
    next_chapter_id: Optional[str] = None
    achievements: List[str] = []
    average_quiz_score: float = 0.0
    total_time_spent: int = 0

class LearningAnalytics(BaseModel):
    """Comprehensive learning analytics"""
    model_config = ConfigDict(extra="ignore")

    user_id: str
    course_id: str
    total_chapters_completed: int
    total_points_earned: int
    average_quiz_score: float
    total_time_spent: int
    current_streak: int
    longest_streak: int
    challenges_completed: int
    challenges_passed: int
    completion_rate: float
    last_activity: datetime
    learning_speed: str
    strong_topics: List[str] = []
    weak_topics: List[str] = []

class Bookmark(BaseModel):
    """Video bookmark model"""
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    chapter_id: str
    timestamp: int
    note: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Mock data storage (in production, use MongoDB)
_chapters_db = {}
_markers_db = {}
_challenges_db = {}
_progress_db = {}
_attempts_db = []
_bookmarks_db = {}

# API Endpoints

@nano_router.get("/courses/{course_id}/chapters", response_model=List[NanoChapter])
async def get_nano_chapters(course_id: str):
    """Get all nano learning chapters for a course"""
    if course_id not in _chapters_db:
        # Return mock data for demo
        return [
            NanoChapter(
                id="ch1",
                course_id=course_id,
                title="Introduction to React Components",
                description="Learn the basics of React components and how to build reusable UI elements.",
                video_url="https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
                duration=300,
                order=1,
                thumbnail="https://picsum.photos/seed/react1/800/450.jpg"
            ),
            NanoChapter(
                id="ch2",
                course_id=course_id,
                title="Understanding State and Props",
                description="Deep dive into React state management and props passing.",
                video_url="https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
                duration=300,
                order=2,
                thumbnail="https://picsum.photos/seed/react2/800/450.jpg"
            ),
            NanoChapter(
                id="ch3",
                course_id=course_id,
                title="React Hooks Essentials",
                description="Master useState and useEffect hooks to manage component state.",
                video_url="https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
                duration=300,
                order=3,
                thumbnail="https://picsum.photos/seed/react3/800/450.jpg"
            )
        ]

    return _chapters_db[course_id]

@nano_router.post("/chapters", response_model=NanoChapter)
async def create_nano_chapter(chapter: NanoChapterCreate):
    """Create a new nano learning chapter"""
    chapter_data = NanoChapter(**chapter.model_dump())

    if chapter_data.course_id not in _chapters_db:
        _chapters_db[chapter_data.course_id] = []

    _chapters_db[chapter_data.course_id].append(chapter_data)
    return chapter_data

@nano_router.get("/chapters/{chapter_id}/markers", response_model=List[ChapterMarker])
async def get_chapter_markers(chapter_id: str):
    """Get chapter markers for a video chapter"""
    if chapter_id not in _markers_db:
        # Return mock data
        return [
            ChapterMarker(
                id="m1",
                chapter_id=chapter_id,
                title="Introduction",
                timestamp=0,
                description="Welcome to this chapter"
            ),
            ChapterMarker(
                id="m2",
                chapter_id=chapter_id,
                title="Key Concepts",
                timestamp=120,
                description="Core concepts explained"
            ),
            ChapterMarker(
                id="m3",
                chapter_id=chapter_id,
                title="Practice Example",
                timestamp=240,
                description="Hands-on demonstration"
            )
        ]

    return _markers_db[chapter_id]

@nano_router.post("/chapters/{chapter_id}/markers", response_model=ChapterMarker)
async def create_chapter_marker(chapter_id: str, marker: ChapterMarker):
    """Create a new chapter marker"""
    if chapter_id not in _markers_db:
        _markers_db[chapter_id] = []

    marker_data = ChapterMarker(**marker.model_dump(), chapter_id=chapter_id)
    _markers_db[chapter_id].append(marker_data)
    return marker_data

@nano_router.get("/chapters/{chapter_id}/quiz", response_model=MicroChallenge)
async def get_chapter_quiz(chapter_id: str):
    """Get quiz challenge for a chapter"""
    if chapter_id not in _challenges_db:
        # Return mock quiz
        return MicroChallenge(
            id="quiz1",
            chapter_id=chapter_id,
            challenge_type="quiz",
            question="What is the primary purpose of React components?",
            options=[
                "To manage database connections",
                "To build reusable UI elements",
                "To handle server routing",
                "To perform API authentication"
            ],
            correct_answer=1,
            time_limit=30,
            points=10,
            hint="Think about React's main purpose",
            explanation="React components are reusable building blocks for creating user interfaces."
        )

    # Find quiz challenge
    for challenge in _challenges_db[chapter_id]:
        if challenge.challenge_type == "quiz":
            return challenge

    # Return default quiz if none found
    return MicroChallenge(
        id="quiz_default",
        chapter_id=chapter_id,
        challenge_type="quiz",
        question="What did you learn from this chapter?",
        options=["Option A", "Option B", "Option C", "Option D"],
        correct_answer=0,
        time_limit=30,
        points=10
    )

@nano_router.post("/challenges", response_model=MicroChallenge)
async def create_challenge(challenge: MicroChallenge):
    """Create a new micro challenge"""
    if challenge.chapter_id not in _challenges_db:
        _challenges_db[challenge.chapter_id] = []

    _challenges_db[challenge.chapter_id].append(challenge)
    return challenge

@nano_router.post("/quiz/submit")
async def submit_quiz_answer(submission: dict):
    """Submit quiz answer and get immediate feedback"""
    user_id = submission.get("user_id")
    chapter_id = submission.get("chapter_id")
    quiz_id = submission.get("quiz_id")
    selected_answer = submission.get("selected_answer")
    time_taken = submission.get("time_taken", 0)

    # Get the quiz
    quiz = None
    if chapter_id in _challenges_db:
        for challenge in _challenges_db[chapter_id]:
            if challenge.id == quiz_id:
                quiz = challenge
                break

    # Use mock quiz if not found
    if not quiz:
        is_correct = True
        points_earned = 10
        correct_answer = selected_answer
        explanation = "Great job!"
    else:
        is_correct = selected_answer == quiz.correct_answer
        points_earned = quiz.points if is_correct else 0
        correct_answer = quiz.correct_answer
        explanation = quiz.explanation or ("Correct!" if is_correct else "Keep practicing!")

    # Record attempt
    attempt_data = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "chapter_id": chapter_id,
        "challenge_id": quiz_id,
        "selected_answer": selected_answer,
        "is_correct": is_correct,
        "time_taken": time_taken,
        "points_earned": points_earned,
        "attempted_at": datetime.now(timezone.utc).isoformat()
    }
    _attempts_db.append(attempt_data)

    return {
        "is_correct": is_correct,
        "points_earned": points_earned,
        "correct_answer": correct_answer,
        "selected_answer": selected_answer,
        "time_taken": time_taken,
        "explanation": explanation
    }

@nano_router.post("/progress")
async def update_nano_progress(progress_data: dict):
    """Update learning progress for a chapter"""
    user_id = progress_data.get("user_id")
    course_id = progress_data.get("course_id")
    chapter_id = progress_data.get("chapter_id")

    key = f"{user_id}_{course_id}_{chapter_id}"

    progress_update = {
        "id": key,
        "user_id": user_id,
        "course_id": course_id,
        "chapter_id": chapter_id,
        "video_progress": progress_data.get("video_progress", 0),
        "last_position": progress_data.get("last_position", 0),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    if progress_data.get("video_completed"):
        progress_update["video_completed"] = True

    if progress_data.get("quiz_completed") is not None:
        progress_update["quiz_completed"] = progress_data["quiz_completed"]

    if progress_data.get("quiz_score") is not None:
        progress_update["quiz_score"] = progress_data["quiz_score"]

    if progress_data.get("completed_at"):
        progress_update["completed_at"] = progress_data["completed_at"]

    _progress_db[key] = progress_update

    return {"message": "Progress updated successfully"}

@nano_router.get("/progress/{user_id}/courses/{course_id}", response_model=CourseProgress)
async def get_course_progress(user_id: str, course_id: str):
    """Get overall progress for a user in a course"""
    # Get user's progress for this course
    user_progress = [p for p in _progress_db.values()
                    if p.get("user_id") == user_id and p.get("course_id") == course_id]

    completed_chapters = len([p for p in user_progress
                            if p.get("video_completed") and p.get("quiz_completed")])

    # Get total points
    user_attempts = [a for a in _attempts_db if a.get("user_id") == user_id]
    total_points = sum([a.get("points_earned", 0) for a in user_attempts])

    # Calculate average quiz score
    quiz_scores = [a.get("points_earned", 0) for a in user_attempts if a.get("is_correct")]
    average_quiz_score = sum(quiz_scores) / len(quiz_scores) if quiz_scores else 0.0

    return CourseProgress(
        total_chapters=3,
        completed_chapters=completed_chapters,
        overall_progress=(completed_chapters / 3 * 100) if 3 > 0 else 0,
        total_points=total_points,
        current_streak=3,
        next_chapter_id=None,
        achievements=["Quick Learner", "First Steps"] if completed_chapters > 0 else [],
        average_quiz_score=average_quiz_score,
        total_time_spent=1800
    )

@nano_router.get("/progress/{user_id}/courses/{course_id}/modules", response_model=List[NanoProgress])
async def get_module_progress(user_id: str, course_id: str):
    """Get detailed progress for all modules in a course"""
    user_progress = [p for p in _progress_db.values()
                    if p.get("user_id") == user_id and p.get("course_id") == course_id]

    return [NanoProgress(**p) for p in user_progress]

@nano_router.get("/analytics/{user_id}/courses/{course_id}", response_model=LearningAnalytics)
async def get_learning_analytics(user_id: str, course_id: str):
    """Get comprehensive learning analytics for a user"""
    user_progress = [p for p in _progress_db.values()
                    if p.get("user_id") == user_id and p.get("course_id") == course_id]

    user_attempts = [a for a in _attempts_db if a.get("user_id") == user_id]

    completed_chapters = len([p for p in user_progress
                            if p.get("video_completed") and p.get("quiz_completed")])

    total_points = sum([a.get("points_earned", 0) for a in user_attempts])

    quiz_scores = [a.get("points_earned", 0) for a in user_attempts if a.get("is_correct")]
    average_quiz_score = sum(quiz_scores) / len(quiz_scores) if quiz_scores else 0.0

    return LearningAnalytics(
        user_id=user_id,
        course_id=course_id,
        total_chapters_completed=completed_chapters,
        total_points_earned=total_points,
        average_quiz_score=average_quiz_score,
        total_time_spent=3600,
        current_streak=5,
        longest_streak=7,
        challenges_completed=len(user_attempts),
        challenges_passed=len([a for a in user_attempts if a.get("is_correct")]),
        completion_rate=(completed_chapters / 3 * 100) if 3 > 0 else 0,
        last_activity=datetime.now(timezone.utc),
        learning_speed="normal",
        strong_topics=["Components", "Hooks"],
        weak_topics=["State Management"]
    )

@nano_router.post("/bookmarks", response_model=Bookmark)
async def create_bookmark(bookmark: Bookmark):
    """Create a video bookmark"""
    key = f"{bookmark.user_id}_{bookmark.chapter_id}_{bookmark.timestamp}"

    bookmark_data = Bookmark(**bookmark.model_dump())
    _bookmarks_db[key] = bookmark_data

    return bookmark_data

@nano_router.get("/bookmarks/{user_id}/chapters/{chapter_id}", response_model=List[Bookmark])
async def get_chapter_bookmarks(user_id: str, chapter_id: str):
    """Get all bookmarks for a chapter"""
    bookmarks = [b for b in _bookmarks_db.values()
                if b.user_id == user_id and b.chapter_id == chapter_id]

    return sorted(bookmarks, key=lambda x: x.timestamp)

@nano_router.delete("/bookmarks/{bookmark_id}")
async def delete_bookmark(bookmark_id: str):
    """Delete a bookmark"""
    _bookmarks_db.pop(bookmark_id, None)
    return {"message": "Bookmark deleted successfully"}

def get_nano_router():
    """Get the nano learning router"""
    return nano_router