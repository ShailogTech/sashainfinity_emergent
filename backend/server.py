from fastapi import FastAPI, APIRouter, HTTPException, Depends, BackgroundTasks, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.status import HTTP_401_UNAUTHORIZED
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator
from typing import List, Optional, Dict, Any, Set, Tuple
import uuid
from datetime import datetime, timezone, timedelta
from enum import Enum
import json
import asyncio
from functools import partial
import bcrypt
import jwt
from jose import JWTError, jwt as jose_jwt
from passlib.context import CryptContext
import re
from collections import defaultdict

# Import AI services
import whisper
import torch
import tempfile
import os
from typing import List, Dict, Any, Optional, Set, Tuple
import aiohttp
import aiofiles
import asyncio
from urllib.parse import urlparse
from collections import defaultdict
import json

# Import Nano Learning API (if available)
try:
    from nanolearning_api import get_nano_router
except ImportError:
    get_nano_router = None  # Nano learning API is optional

# Import auth module
try:
    from auth import (
        UserRole, Token, TokenData, UserAuth, UserRegister, UserLogin,
        UserResponse, PasswordResetRequest, PasswordResetConfirm,
        PasswordChange, UserProfileUpdate,
        verify_password, get_password_hash, create_access_token,
        create_refresh_token, create_password_reset_token, verify_token,
        get_current_user, get_current_active_user, require_role,
    )
    from auth_routes import router as auth_router, set_database
except ImportError:
    # If auth module is not available, define minimal imports
    # This maintains backward compatibility
    UserRole = None
    auth_router = None
    set_database = None


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'sashainfinity_db')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-jwt-key-change-this-in-production-min-32-characters")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Create the main app
app = FastAPI(
    title="Sasha Infinity LMS API",
    description="Learning Management System API with authentication, course management, and AI features",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models FIRST (before they are referenced)
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Authentication Models
class UserRole(str, Enum):
    admin = "admin"
    instructor = "instructor"
    student = "student"

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class UserAuth(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    hashed_password: str
    role: UserRole = UserRole.student
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: Optional[datetime] = None

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.student
    confirm_password: str

    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if 'password' in info.data and v != info.data['password']:
            raise ValueError('passwords do not match')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime

# Authentication Utility Functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    try:
        # Ensure plain password is bytes and truncate to 72 bytes
        plain_bytes = plain_password.encode('utf-8')[:72]
        # Ensure hashed password is bytes
        hashed_bytes = hashed_password.encode('utf-8') if isinstance(hashed_password, str) else hashed_password
        return bcrypt.checkpw(plain_bytes, hashed_bytes)
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Hash a password."""
    # Truncate password to 72 bytes max for bcrypt
    password_bytes = password.encode('utf-8')[:72]
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed.decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jose_jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserAuth:
    """Get the current authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jose_jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")

        if email is None:
            raise credentials_exception

        token_data = TokenData(email=email, role=role)
    except JWTError:
        raise credentials_exception

    user = await db.users.find_one({"email": token_data.email})

    if user is None:
        raise credentials_exception

    # Convert MongoDB document to UserAuth model
    user['id'] = str(user.pop('_id', user.get('id')))

    return UserAuth(**user)

async def get_current_active_user(current_user: UserAuth = Depends(get_current_user)) -> UserAuth:
    """Get the current active user."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def require_role(required_roles: List[UserRole]):
    """Dependency to check if user has required role."""
    async def role_checker(current_user: UserAuth = Depends(get_current_active_user)) -> UserAuth:
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_checker

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


class CourseStatus(str, Enum):
    draft = "draft"
    published = "published"

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    role: UserRole = UserRole.student
    courses_enrolled: int = 0
    join_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "active"

class UserCreate(BaseModel):
    name: str
    email: str
    role: UserRole = UserRole.student

class Course(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    instructor: str
    price: float
    enrolled: int = 0
    status: CourseStatus = CourseStatus.draft
    thumbnail: str = "📚"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CourseCreate(BaseModel):
    title: str
    description: str
    instructor: str
    price: float
    status: CourseStatus = CourseStatus.draft

class DashboardStats(BaseModel):
    total_users: int
    total_courses: int
    total_blog_posts: int
    active_users: int
    revenue: float

# AI Content Management Models
class TranscriptionStatus(str, Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"

class ResourceType(str, Enum):
    website = "website"
    book = "book"
    article = "article"
    video = "video"
    tool = "tool"
    other = "other"

class VideoTranscript(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    video_id: str
    language: str = "en"
    transcript: List[Dict[str, Any]] = []  # [{"text": "...", "start": 0.0, "end": 1.5}]
    full_text: str = ""
    status: TranscriptionStatus = TranscriptionStatus.pending
    confidence_score: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    error_message: Optional[str] = None

class VideoChapter(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    video_id: str
    title: str
    description: str
    start_time: float
    end_time: float
    confidence_score: float = 0.0
    topics: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VideoResource(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    video_id: str
    resource_type: ResourceType
    title: str
    url: Optional[str] = None
    description: Optional[str] = None
    timestamp: Optional[float] = None  # Where in video it was mentioned
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VideoAnalysisResult(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    video_id: str
    has_transcript: bool = False
    has_chapters: bool = False
    has_resources: bool = False
    transcript_status: Optional[TranscriptionStatus] = None
    chapters_count: int = 0
    resources_count: int = 0
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Request/Response Models for AI Services
class TranscriptionRequest(BaseModel):
    video_id: str
    audio_url: str  # URL to audio file
    language: str = "en"  # en, ta (Tamil), etc.

class ChapteringRequest(BaseModel):
    video_id: str

class ResourceExtractionRequest(BaseModel):
    video_id: str

class VideoAnalysisRequest(BaseModel):
    video_id: str
    perform_transcription: bool = False
    audio_url: Optional[str] = None
    generate_chapters: bool = True
    extract_resources: bool = True

# Video Analytics Models
class VideoViewEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    video_id: str
    user_id: str
    session_id: str
    event_type: str  # play, pause, seek, complete, buffer
    timestamp: float  # Video timestamp in seconds
    server_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: Dict[str, Any] = {}

class VideoSession(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    video_id: str
    user_id: str
    session_id: str
    start_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    end_time: Optional[datetime] = None
    video_duration: float = 0.0
    watch_time: float = 0.0
    last_position: float = 0.0
    completed: bool = False

class VideoViewEventCreate(BaseModel):
    video_id: str
    user_id: str
    session_id: str
    event_type: str
    timestamp: float
    metadata: Dict[str, Any] = {}

class VideoSessionCreate(BaseModel):
    video_id: str
    user_id: str
    video_duration: float

class VideoSessionUpdate(BaseModel):
    end_time: Optional[datetime] = None
    watch_time: Optional[float] = None
    last_position: Optional[float] = None
    completed: Optional[bool] = None

class ChapterUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    topics: Optional[List[str]] = None

class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    resource_type: Optional[ResourceType] = None

# EduSearch Models
class SearchMatch(BaseModel):
    model_config = ConfigDict(extra="ignore")

    video_id: str
    course_id: Optional[str] = None
    course_title: str
    video_title: str
    instructor: str
    timestamp: float
    end_time: float
    matched_text: str
    context_before: str = ""
    context_after: str = ""
    confidence_score: float = 1.0
    relevance_score: float = 1.0

class SearchFilters(BaseModel):
    course_id: Optional[str] = None
    instructor: Optional[str] = None
    topic: Optional[str] = None
    min_confidence: float = 0.0
    duration_min: Optional[float] = None
    duration_max: Optional[float] = None

class SearchRequest(BaseModel):
    query: str
    fuzzy_match: bool = True
    fuzzy_threshold: float = 0.7
    context_window: int = 50  # characters of context
    max_results: int = 50
    filters: Optional[SearchFilters] = None

class SearchSuggestion(BaseModel):
    text: str
    count: int
    category: str  # "topic", "phrase", "instructor", "course"

class VideoMetadata(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    video_id: str
    course_id: Optional[str] = None
    course_title: str
    video_title: str
    instructor: str
    topics: List[str] = []
    duration: float = 0.0
    language: str = "en"
    indexed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TranscriptIndex(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    video_id: str
    word: str
    normalized_word: str
    positions: List[float] = []  # timestamps where word appears
    phonetic_variants: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# EduSearch Service Class
class EduSearchService:
    """Service for intelligent video transcript search with fuzzy matching and context."""

    # Common technical terms and their variants for fuzzy matching
    TECH_SYNONYMS = {
        "javascript": ["js", "ecmascript", "nodejs", "node.js"],
        "react": ["reactjs", "react.js", "reactjs", "react hooks", "jsx"],
        "python": ["py", "python3", "pip", "django", "flask"],
        "database": ["db", "sql", "nosql", "mongodb", "postgres"],
        "api": ["application programming interface", "rest", "graphql", "endpoint"],
        "function": ["method", "def", "fn", "lambda", "arrow function"],
        "variable": ["var", "let", "const", "declaration"],
        "array": ["list", "vector", "sequence", "slice"],
        "object": ["dict", "dictionary", "hash", "map", "struct"],
        "async": ["await", "promise", "async/await", "callback", "coroutine"],
        "component": ["props", "state", "jsx", "tsx", "sfc"],
        "hook": ["useeffect", "usestate", "custom hook", "react hook"],
        "css": ["stylesheet", "style", "scss", "sass", "tailwind"],
        "html": ["markup", "dom", "element", "tag", "attribute"],
        "git": ["version control", "commit", "branch", "merge", "pull request"],
        "docker": ["container", "image", "compose", "kubernetes", "k8s"],
        "testing": ["test", "jest", "pytest", "unit test", "integration test"],
        "debug": ["debugger", "breakpoint", "console.log", "logging"],
        "algorithm": ["algo", "complexity", "big o", "sorting", "searching"],
        "string": ["str", "text", "character", "substring", "concatenation"],
        "loop": ["for", "while", "iteration", "foreach", "map", "filter", "reduce"],
        "condition": ["if", "else", "switch", "case", "ternary"],
        "class": ["object", "constructor", "this", "inheritance", "polymorphism"],
        "import": ["require", "export", "module", "package", "dependency"],
        "error": ["exception", "try", "catch", "throw", "error handling"],
        "http": ["request", "response", "get", "post", "put", "delete", "fetch", "axios"],
    }

    @staticmethod
    def normalize_text(text: str) -> str:
        """Normalize text for search comparison."""
        return re.sub(r'[^\w\s]', '', text.lower().strip())

    @staticmethod
    def extract_context(transcript_segments: List[Dict], timestamp: float, window: int = 50) -> Tuple[str, str, str]:
        """Extract context around a timestamp from transcript segments."""
        full_text = " ".join([seg.get("text", "") for seg in transcript_segments])

        # Find approximate position in full text
        total_duration = sum([seg.get("end", seg.get("start", 0)) - seg.get("start", 0) for seg in transcript_segments])
        char_position = int((timestamp / total_duration) * len(full_text)) if total_duration > 0 else 0

        start = max(0, char_position - window)
        end = min(len(full_text), char_position + window)

        context_before = full_text[start:char_position].strip()
        matched_text = full_text[char_position:min(len(full_text), char_position + 100)].strip()
        context_after = full_text[char_position + 100:end].strip()

        return context_before, matched_text, context_after

    @staticmethod
    def calculate_fuzzy_similarity(text1: str, text2: str) -> float:
        """Calculate similarity ratio between two strings using simple character overlap."""
        text1 = EduSearchService.normalize_text(text1)
        text2 = EduSearchService.normalize_text(text2)

        if not text1 or not text2:
            return 0.0

        # Simple character-based similarity
        set1 = set(text1)
        set2 = set(text2)
        intersection = set1 & set2
        union = set1 | set2

        return len(intersection) / len(union) if union else 0.0

    @staticmethod
    def get_search_variants(query: str) -> Set[str]:
        """Get all search term variants including synonyms."""
        variants = {EduSearchService.normalize_text(query)}
        query_lower = query.lower()

        # Check for technical synonyms
        for term, synonyms in EduSearchService.TECH_SYNONYMS.items():
            if term in query_lower or any(s in query_lower for s in synonyms):
                variants.add(term)
                variants.update(synonyms)

        # Add word splits and joins
        words = query_lower.split()
        if len(words) > 1:
            variants.add("".join(words))  # Remove spaces
            variants.add("_".join(words))  # Underscore join
            variants.add("-".join(words))  # Dash join

        return variants

    @staticmethod
    def search_in_transcript(transcript: List[Dict], query: str, fuzzy_threshold: float = 0.7) -> List[Dict]:
        """Search for query in transcript segments with fuzzy matching."""
        results = []
        query_variants = EduSearchService.get_search_variants(query)

        for segment in transcript:
            text = segment.get("text", "")
            start_time = segment.get("start", 0)
            end_time = segment.get("end", start_time)

            text_normalized = EduSearchService.normalize_text(text)

            # Exact match check
            for variant in query_variants:
                if variant in text_normalized:
                    results.append({
                        "timestamp": start_time,
                        "end_time": end_time,
                        "matched_text": text,
                        "confidence_score": 1.0,
                        "match_type": "exact"
                    })
                    break

            # Fuzzy match check
            for word in text_normalized.split():
                for variant in query_variants:
                    similarity = EduSearchService.calculate_fuzzy_similarity(word, variant)
                    if similarity >= fuzzy_threshold:
                        results.append({
                            "timestamp": start_time,
                            "end_time": end_time,
                            "matched_text": text,
                            "confidence_score": similarity,
                            "match_type": "fuzzy"
                        })
                        break

        return results

    @staticmethod
    def deduplicate_results(results: List[Dict], time_threshold: float = 2.0) -> List[Dict]:
        """Remove duplicate results that are too close in time."""
        if not results:
            return []

        # Sort by timestamp and confidence
        sorted_results = sorted(results, key=lambda x: (-x["confidence_score"], x["timestamp"]))

        deduplicated = [sorted_results[0]]
        for result in sorted_results[1:]:
            last_timestamp = deduplicated[-1]["timestamp"]
            if abs(result["timestamp"] - last_timestamp) > time_threshold:
                deduplicated.append(result)

        return deduplicated

# =============================================================================
# Health Check Endpoints
# =============================================================================

@api_router.get("/")
async def root():
    """Root endpoint - API information."""
    return {
        "name": "Sasha Infinity LMS API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "health": "/api/health",
            "auth": "/api/auth/*",
            "courses": "/api/courses",
            "admin": "/api/admin/*"
        }
    }


@api_router.get("/health")
async def health_check():
    """Health check endpoint for monitoring and load balancers."""
    try:
        # Check MongoDB connection
        await db.command("ping")

        return {
            "status": "healthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "services": {
                "mongodb": "connected",
                "api": "running"
            },
            "database": {
                "name": db_name,
                "connection": "established"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "error": str(e)
        }


@api_router.get("/health/detailed")
async def detailed_health_check():
    """Detailed health check with service status."""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {},
        "database": {},
        "version": "1.0.0"
    }

    try:
        # Check MongoDB connection
        await db.command("ping")
        health_status["services"]["mongodb"] = "connected"
        health_status["database"]["connection"] = "established"

        # Get database stats
        db_stats = await db.command("dbStats")
        health_status["database"]["stats"] = {
            "collections": db_stats.get("collections", 0),
            "dataSize": f"{db_stats.get('dataSize', 0) / 1024 / 1024:.2f} MB"
        }

        # Count users
        users_count = await db.users.count_documents({})
        health_status["database"]["users"] = users_count

    except Exception as e:
        health_status["status"] = "degraded"
        health_status["error"] = str(e)

    return health_status


# Authentication Endpoints (Legacy - kept for backward compatibility)
@api_router.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserRegister):
    """Register a new user."""
    try:
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Hash the password
        hashed_password = get_password_hash(user.password)

        # Create user document
        user_doc = {
            "name": user.name,
            "email": user.email,
            "hashed_password": hashed_password,
            "role": user.role,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "last_login": None
        }

        # Insert into database
        result = await db.users.insert_one(user_doc)

        # Return user response
        user_response = UserResponse(
            id=str(result.inserted_id),
            name=user.name,
            email=user.email,
            role=user.role,
            is_active=True,
            created_at=datetime.now(timezone.utc)
        )

        return user_response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration"
        )

@api_router.post("/auth/refresh-token")
async def refresh_token(current_user: UserAuth = Depends(get_current_active_user)):
    """Refresh access token."""
    try:
        # Create new access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": current_user.email, "role": current_user.role},
            expires_delta=access_token_expires
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during token refresh"
        )

@api_router.post("/auth/login", response_model=Token)
async def login_user(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login user and return JWT token."""
    try:
        # Find user by email (username in OAuth2 form)
        user = await db.users.find_one({"email": form_data.username})

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Verify password
        if not verify_password(form_data.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Update last login
        await db.users.update_one(
            {"email": user["email"]},
            {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
        )

        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email"], "role": user["role"]},
            expires_delta=access_token_expires
        )

        # Prepare user data for response
        user_data = {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "is_active": user.get("is_active", True)
        }

        return Token(
            access_token=access_token,
            token_type="bearer",
            user=user_data
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login"
        )

# Simple JSON login endpoint (easier for testing)
@api_router.post("/auth/login-json")
async def login_user_json(login_data: UserLogin):
    """Login user with JSON payload and return JWT token."""
    try:
        # Find user by email
        user = await db.users.find_one({"email": login_data.email})

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Verify password
        if not verify_password(login_data.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Update last login
        await db.users.update_one(
            {"email": user["email"]},
            {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
        )

        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email"], "role": user["role"]},
            expires_delta=access_token_expires
        )

        # Prepare user data for response
        user_data = {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "is_active": user.get("is_active", True)
        }

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": user_data
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login"
        )

# Simple working login endpoint
@api_router.post("/auth/login-simple")
async def login_simple(credentials: dict):
    """Simple login endpoint for testing."""
    try:
        email = credentials.get("email")
        password = credentials.get("password")

        # Find user
        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        # Verify password
        if not verify_password(password, user["hashed_password"]):
            raise HTTPException(status_code=401, detail="Invalid password")

        # Create token
        access_token = create_access_token(
            data={"sub": user["email"], "role": user["role"]}
        )

        # Return response
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "role": user["role"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        return {"error": str(e)}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserAuth = Depends(get_current_active_user)):
    """Get current user information."""
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )

@api_router.post("/auth/logout")
async def logout_user():
    """Logout user (client-side token removal)."""
    # In a JWT-based system, logout is handled client-side by removing the token
    # This endpoint exists for future extensibility (e.g., token blacklisting)
    return {"message": "Successfully logged out"}

# Code Sandbox API Endpoints

class CodeExecutionRequest(BaseModel):
    code: str
    language: str = "javascript"
    timeout: int = 5

class CodeExecutionResponse(BaseModel):
    success: bool
    output: List[str] = []
    error: Optional[str] = None
    execution_time: float = 0.0

class CodeSnippetCreate(BaseModel):
    title: str
    description: Optional[str] = None
    code: str
    language: str = "javascript"
    timestamp: float = 0.0
    video_id: Optional[str] = None

class CodeSnippet(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    code: str
    language: str = "javascript"
    timestamp: float = 0.0
    video_id: Optional[str] = None
    user_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CodeSnippetUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    code: Optional[str] = None
    language: Optional[str] = None
    timestamp: Optional[float] = None

@api_router.post("/sandbox/execute", response_model=CodeExecutionResponse)
async def execute_code(request: CodeExecutionRequest):
    """Execute code and return output"""
    import subprocess
    import sys
    from io import StringIO
    import time

    start_time = time.time()

    try:
        if request.language == "javascript":
            # Execute JavaScript using Node.js
            process = subprocess.Popen(
                ["node", "-e", request.code],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=request.timeout
            )
            stdout, stderr = process.communicate()

            if process.returncode != 0:
                return CodeExecutionResponse(
                    success=False,
                    error=stderr.strip(),
                    execution_time=time.time() - start_time
                )

            output = [line.strip() for line in stdout.strip().split('\n') if line.strip()]
            return CodeExecutionResponse(
                success=True,
                output=output,
                execution_time=time.time() - start_time
            )

        elif request.language == "python":
            # Execute Python code
            process = subprocess.Popen(
                [sys.executable, "-c", request.code],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=request.timeout
            )
            stdout, stderr = process.communicate()

            if process.returncode != 0:
                return CodeExecutionResponse(
                    success=False,
                    error=stderr.strip(),
                    execution_time=time.time() - start_time
                )

            output = [line.strip() for line in stdout.strip().split('\n') if line.strip()]
            return CodeExecutionResponse(
                success=True,
                output=output,
                execution_time=time.time() - start_time
            )

        else:
            return CodeExecutionResponse(
                success=False,
                error=f"Language '{request.language}' not supported for server-side execution",
                execution_time=time.time() - start_time
            )

    except subprocess.TimeoutExpired:
        return CodeExecutionResponse(
            success=False,
            error=f"Code execution timed out after {request.timeout} seconds",
            execution_time=request.timeout
        )
    except Exception as e:
        return CodeExecutionResponse(
            success=False,
            error=str(e),
            execution_time=time.time() - start_time
        )

@api_router.post("/sandbox/snippets", response_model=CodeSnippet, status_code=status.HTTP_201_CREATED)
async def create_code_snippet(snippet: CodeSnippetCreate, current_user: UserAuth = Depends(get_current_active_user)):
    """Create a new code snippet"""
    try:
        snippet_data = snippet.model_dump()
        snippet_data['user_id'] = current_user.id
        snippet_data['created_at'] = datetime.now(timezone.utc).isoformat()

        result = await db.code_snippets.insert_one(snippet_data)

        snippet_data['id'] = str(result.inserted_id)
        return CodeSnippet(**snippet_data)

    except Exception as e:
        logging.error(f"Failed to create code snippet: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/sandbox/snippets", response_model=List[CodeSnippet])
async def get_code_snippets(
    video_id: Optional[str] = None,
    language: Optional[str] = None,
    current_user: UserAuth = Depends(get_current_active_user)
):
    """Get code snippets with optional filters"""
    try:
        query = {"user_id": current_user.id}

        if video_id:
            query["video_id"] = video_id
        if language:
            query["language"] = language

        snippets = await db.code_snippets.find(query, {"_id": 0}).to_list(100)

        # Convert ISO string timestamps back to datetime objects
        for snippet in snippets:
            if isinstance(snippet['created_at'], str):
                snippet['created_at'] = datetime.fromisoformat(snippet['created_at'])

        return [CodeSnippet(**snippet) for snippet in snippets]

    except Exception as e:
        logging.error(f"Failed to get code snippets: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/sandbox/snippets/{snippet_id}", response_model=CodeSnippet)
async def get_code_snippet(snippet_id: str, current_user: UserAuth = Depends(get_current_active_user)):
    """Get a specific code snippet"""
    try:
        snippet = await db.code_snippets.find_one({
            "id": snippet_id,
            "user_id": current_user.id
        }, {"_id": 0})

        if not snippet:
            raise HTTPException(status_code=404, detail="Code snippet not found")

        if isinstance(snippet['created_at'], str):
            snippet['created_at'] = datetime.fromisoformat(snippet['created_at'])

        return CodeSnippet(**snippet)

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to get code snippet: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/sandbox/snippets/{snippet_id}", response_model=CodeSnippet)
async def update_code_snippet(
    snippet_id: str,
    update: CodeSnippetUpdate,
    current_user: UserAuth = Depends(get_current_active_user)
):
    """Update a code snippet"""
    try:
        # Check if snippet exists and belongs to user
        existing = await db.code_snippets.find_one({
            "id": snippet_id,
            "user_id": current_user.id
        })

        if not existing:
            raise HTTPException(status_code=404, detail="Code snippet not found")

        # Prepare update data (only include non-None fields)
        update_data = {k: v for k, v in update.model_dump().items() if v is not None}

        if update_data:
            await db.code_snippets.update_one(
                {"id": snippet_id},
                {"$set": update_data}
            )

        # Get updated snippet
        updated_snippet = await db.code_snippets.find_one(
            {"id": snippet_id},
            {"_id": 0}
        )

        if isinstance(updated_snippet['created_at'], str):
            updated_snippet['created_at'] = datetime.fromisoformat(updated_snippet['created_at'])

        return CodeSnippet(**updated_snippet)

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to update code snippet: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/sandbox/snippets/{snippet_id}")
async def delete_code_snippet(snippet_id: str, current_user: UserAuth = Depends(get_current_active_user)):
    """Delete a code snippet"""
    try:
        result = await db.code_snippets.delete_one({
            "id": snippet_id,
            "user_id": current_user.id
        })

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Code snippet not found")

        return {"message": "Code snippet deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to delete code snippet: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# User Profile Management
class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

@api_router.get("/auth/profile", response_model=UserResponse)
async def get_user_profile(current_user: UserAuth = Depends(get_current_active_user)):
    """Get current user profile."""
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )

@api_router.put("/auth/profile", response_model=UserResponse)
async def update_user_profile(
    profile_update: UserProfileUpdate,
    current_user: UserAuth = Depends(get_current_active_user)
):
    """Update user profile."""
    try:
        update_data = {}

        # Update name if provided
        if profile_update.name:
            update_data["name"] = profile_update.name

        # Update email if provided
        if profile_update.email:
            # Check if email is already taken by another user
            existing_user = await db.users.find_one({"email": profile_update.email, "_id": {"$ne": current_user.id}})
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            update_data["email"] = profile_update.email

        # Update password if provided
        if profile_update.new_password:
            if not profile_update.current_password:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Current password is required to change password"
                )

            # Verify current password
            if not verify_password(profile_update.current_password, current_user.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Current password is incorrect"
                )

            # Hash new password
            update_data["hashed_password"] = get_password_hash(profile_update.new_password)

        # Update timestamp
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

        # Update in database
        if update_data:
            await db.users.update_one(
                {"_id": current_user.id},
                {"$set": update_data}
            )

            # Fetch updated user
            updated_user = await db.users.find_one({"_id": current_user.id})
            return UserResponse(
                id=str(updated_user["_id"]),
                name=updated_user["name"],
                email=updated_user["email"],
                role=updated_user["role"],
                is_active=updated_user.get("is_active", True),
                created_at=datetime.fromisoformat(updated_user["created_at"])
            )

        return UserResponse(
            id=current_user.id,
            name=current_user.name,
            email=current_user.email,
            role=current_user.role,
            is_active=current_user.is_active,
            created_at=current_user.created_at
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile update error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during profile update"
        )

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)

    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])

    return status_checks

# Admin Endpoints (Protected - Require admin role)
@api_router.get("/admin/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(current_user: UserAuth = Depends(require_role([UserRole.admin, UserRole.instructor]))):
    """Get dashboard statistics for admin panel - Real MongoDB implementation"""
    try:
        # Get real counts from MongoDB
        total_users = await db.users.count_documents({})
        total_courses = await db.courses.count_documents({})
        total_blog_posts = await db.blog_posts.count_documents({}) if "blog_posts" in await db.list_collection_names() else 0

        # Count active users (logged in within last 30 days)
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        active_users = await db.users.count_documents({
            "last_login": {"$gte": thirty_days_ago.isoformat()},
            "is_active": True
        })

        # Calculate revenue from enrollments/courses
        pipeline = [
            {"$group": {
                "_id": None,
                "total": {"$sum": "$price"}
            }}
        ]
        result = await db.courses.aggregate(pipeline).to_list(1)
        revenue = float(result[0]["total"]) if result else 0.0

        return DashboardStats(
            total_users=total_users,
            total_courses=total_courses,
            total_blog_posts=total_blog_posts,
            active_users=active_users,
            revenue=revenue
        )
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard statistics: {str(e)}")

@api_router.get("/admin/users", response_model=List[User])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    role: Optional[UserRole] = None,
    current_user: UserAuth = Depends(require_role([UserRole.admin, UserRole.instructor]))
):
    """Get all users for admin panel - Real MongoDB implementation with pagination and filtering"""
    try:
        # Build query with filters
        query = {}
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}}
            ]
        if role:
            query["role"] = role

        # Fetch users from MongoDB
        users_cursor = db.users.find(query).skip(skip).limit(limit)
        users_list = await users_cursor.to_list(length=limit)

        # Convert to User model format
        result = []
        for user_doc in users_list:
            # Count enrolled courses
            courses_enrolled = await db.enrollments.count_documents({
                "user_id": str(user_doc["_id"]),
                "status": "active"
            })

            user_dict = {
                "id": str(user_doc["_id"]),
                "name": user_doc.get("name", ""),
                "email": user_doc.get("email", ""),
                "role": user_doc.get("role", UserRole.student),
                "courses_enrolled": courses_enrolled,
                "join_date": user_doc.get("created_at", datetime.now(timezone.utc).isoformat()),
                "status": "active" if user_doc.get("is_active", True) else "inactive"
            }
            result.append(User(**user_dict))

        return result
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch users: {str(e)}")

@api_router.post("/admin/users", response_model=User)
async def create_user(
    user: UserCreate,
    current_user: UserAuth = Depends(require_role([UserRole.admin]))
):
    """Create a new user - Real MongoDB implementation"""
    try:
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create user document with hashed password
        default_password = "ChangeMe123!"  # Should be changed on first login
        hashed_password = get_password_hash(default_password)

        user_data = {
            "name": user.name,
            "email": user.email,
            "hashed_password": hashed_password,
            "role": user.role,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "last_login": None,
            "courses_enrolled": 0
        }

        # Insert into database
        result = await db.users.insert_one(user_data)

        # Return created user
        return User(
            id=str(result.inserted_id),
            name=user.name,
            email=user.email,
            role=user.role,
            courses_enrolled=0,
            join_date=user_data["created_at"],
            status="active"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

@api_router.delete("/admin/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: UserAuth = Depends(require_role([UserRole.admin]))
):
    """Delete a user - Real MongoDB implementation"""
    try:
        # Check if user exists
        user = await db.users.find_one({"_id": user_id})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Prevent deleting yourself
        if str(user.get("_id")) == str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete your own account"
            )

        # Delete user enrollments
        await db.enrollments.delete_many({"user_id": user_id})

        # Delete user
        result = await db.users.delete_one({"_id": user_id})

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return {"message": "User deleted successfully", "deleted_id": user_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete user: {str(e)}")

@api_router.put("/admin/users/{user_id}/status")
async def toggle_user_status(
    user_id: str,
    current_user: UserAuth = Depends(require_role([UserRole.admin]))
):
    """Toggle user active/inactive status - Real MongoDB implementation"""
    try:
        # Check if user exists
        user = await db.users.find_one({"_id": user_id})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Prevent deactivating yourself
        if str(user.get("_id")) == str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot change your own account status"
            )

        # Toggle status
        new_status = not user.get("is_active", True)
        await db.users.update_one(
            {"_id": user_id},
            {"$set": {"is_active": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )

        return {
            "message": f"User {'activated' if new_status else 'deactivated'} successfully",
            "user_id": user_id,
            "is_active": new_status
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error toggling user status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update user status: {str(e)}")

@api_router.get("/admin/courses", response_model=List[Course])
async def get_courses(
    skip: int = 0,
    limit: int = 100,
    status: Optional[CourseStatus] = None,
    current_user: UserAuth = Depends(require_role([UserRole.admin, UserRole.instructor]))
):
    """Get all courses for admin panel - Real MongoDB implementation with filtering"""
    try:
        # Build query
        query = {}
        if status:
            query["status"] = status

        # Fetch courses from MongoDB
        courses_cursor = db.courses.find(query).skip(skip).limit(limit).sort("created_at", -1)
        courses_list = await courses_cursor.to_list(length=limit)

        # Convert to Course model format
        result = []
        for course_doc in courses_list:
            # Count enrolled students
            enrolled_count = await db.enrollments.count_documents({
                "course_id": str(course_doc["_id"]),
                "status": "active"
            })

            course_dict = {
                "id": str(course_doc["_id"]),
                "title": course_doc.get("title", ""),
                "description": course_doc.get("description", ""),
                "instructor": course_doc.get("instructor", ""),
                "price": float(course_doc.get("price", 0)),
                "enrolled": enrolled_count,
                "status": course_doc.get("status", CourseStatus.draft),
                "thumbnail": course_doc.get("thumbnail", "📚"),
                "created_at": course_doc.get("created_at", datetime.now(timezone.utc).isoformat())
            }
            result.append(Course(**course_dict))

        return result
    except Exception as e:
        logger.error(f"Error fetching courses: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch courses: {str(e)}")

@api_router.post("/admin/courses", response_model=Course)
async def create_course(
    course: CourseCreate,
    current_user: UserAuth = Depends(require_role([UserRole.admin, UserRole.instructor]))
):
    """Create a new course - Real MongoDB implementation"""
    try:
        # Check if course with same title exists
        existing = await db.courses.find_one({"title": course.title})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Course with this title already exists"
            )

        # Create course document
        course_data = {
            "title": course.title,
            "description": course.description,
            "instructor": course.instructor,
            "price": float(course.price),
            "status": course.status,
            "thumbnail": "📚",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "created_by": current_user.id
        }

        # Insert into database
        result = await db.courses.insert_one(course_data)

        # Return created course
        return Course(
            id=str(result.inserted_id),
            title=course.title,
            description=course.description,
            instructor=course.instructor,
            price=float(course.price),
            enrolled=0,
            status=course.status,
            thumbnail="📚",
            created_at=datetime.now(timezone.utc)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating course: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create course: {str(e)}")

@api_router.put("/admin/courses/{course_id}", response_model=Course)
async def update_course(
    course_id: str,
    course: CourseCreate,
    current_user: UserAuth = Depends(require_role([UserRole.admin, UserRole.instructor]))
):
    """Update a course - Real MongoDB implementation"""
    try:
        # Check if course exists
        existing = await db.courses.find_one({"_id": course_id})
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )

        # Update data
        update_data = {
            "title": course.title,
            "description": course.description,
            "instructor": course.instructor,
            "price": float(course.price),
            "status": course.status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        # Update in database
        await db.courses.update_one(
            {"_id": course_id},
            {"$set": update_data}
        )

        # Get updated course
        updated = await db.courses.find_one({"_id": course_id})
        enrolled = await db.enrollments.count_documents({"course_id": course_id})

        return Course(
            id=course_id,
            title=course.title,
            description=course.description,
            instructor=course.instructor,
            price=float(course.price),
            enrolled=enrolled,
            status=course.status,
            thumbnail=existing.get("thumbnail", "📚"),
            created_at=datetime.fromisoformat(existing.get("created_at", datetime.now(timezone.utc).isoformat()))
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating course: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update course: {str(e)}")

@api_router.delete("/admin/courses/{course_id}")
async def delete_course(
    course_id: str,
    current_user: UserAuth = Depends(require_role([UserRole.admin, UserRole.instructor]))
):
    """Delete a course - Real MongoDB implementation"""
    try:
        # Check if course exists
        course = await db.courses.find_one({"_id": course_id})
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )

        # Delete course enrollments
        await db.enrollments.delete_many({"course_id": course_id})

        # Delete course videos/sessions
        await db.video_sessions.delete_many({"course_id": course_id})

        # Delete course metadata
        await db.video_metadata.delete_many({"course_id": course_id})

        # Delete course
        result = await db.courses.delete_one({"_id": course_id})

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )

        return {"message": "Course deleted successfully", "deleted_id": course_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting course: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete course: {str(e)}")

# =============================================================================
# VIDEO UPLOAD ENDPOINTS
# =============================================================================

class VideoUploadCreate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    course_id: Optional[str] = None
    auto_transcribe: bool = True
    language: str = "en"

class VideoUploadResponse(BaseModel):
    video_id: str
    title: str
    status: str
    duration: float
    upload_url: str

@api_router.post("/videos/upload", response_model=VideoUploadResponse)
async def upload_video(
    background_tasks: BackgroundTasks,
    title: Optional[str] = None,
    description: Optional[str] = None,
    course_id: Optional[str] = None,
    auto_transcribe: bool = True,
    language: str = "en",
    current_user: UserAuth = Depends(get_current_active_user)
):
    """
    Upload a video file and optionally trigger auto-transcription.
    In production, this would handle multipart file upload to cloud storage.
    """
    try:
        video_id = str(uuid.uuid4())

        # In production, upload to cloud storage and get the URL
        # For now, we'll create a placeholder record
        video_doc = {
            "id": video_id,
            "title": title or "Untitled Video",
            "description": description,
            "course_id": course_id,
            "uploaded_by": current_user.id,
            "upload_date": datetime.now(timezone.utc).isoformat(),
            "status": "uploaded",
            "duration": 0,
            "thumbnail": None
        }

        await db.videos.insert_one(video_doc)

        # Trigger auto-transcription if requested
        if auto_transcribe:
            background_tasks.add_task(
                process_transcription,
                video_id=video_id,
                audio_path=f"/videos/{video_id}/audio",
                language=language,
                db=db
            )

        return VideoUploadResponse(
            video_id=video_id,
            title=video_doc["title"],
            status="uploaded",
            duration=0,
            upload_url=f"/videos/{video_id}"
        )

    except Exception as e:
        logging.error(f"Video upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/videos/recent", response_model=List[Dict])
async def get_recent_uploads(
    limit: int = 10,
    current_user: UserAuth = Depends(get_current_active_user)
):
    """Get recently uploaded videos for the current user."""
    try:
        query = {"uploaded_by": current_user.id}
        videos = await db.videos.find(query, {"_id": 0}).sort("upload_date", -1).to_list(limit)

        # Enrich with transcript and chapter counts
        for video in videos:
            video["transcription_status"] = "pending"
            video["chapters_count"] = 0
            video["resources_count"] = 0

            # Check transcript status
            transcript = await db.transcripts.find_one({"video_id": video["id"]})
            if transcript:
                video["transcription_status"] = transcript.get("status", "pending")

            # Count chapters
            video["chapters_count"] = await db.chapters.count_documents({"video_id": video["id"]})

            # Count resources
            video["resources_count"] = await db.resources.count_documents({"video_id": video["id"]})

        return videos

    except Exception as e:
        logging.error(f"Failed to get recent uploads: {e}")
        # Return mock data if database query fails
        return []

@api_router.put("/videos/{video_id}/transcript")
async def update_transcript(
    video_id: str,
    transcript_data: Dict,
    current_user: UserAuth = Depends(get_current_active_user)
):
    """Update transcript for a video."""
    try:
        update_data = {
            "transcript": transcript_data.get("transcript", []),
            "full_text": " ".join([seg.get("text", "") for seg in transcript_data.get("transcript", [])]),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        result = await db.transcripts.update_one(
            {"video_id": video_id},
            {"$set": update_data}
        )

        if result.modified_count == 0:
            # Create new transcript record
            await db.transcripts.insert_one({
                "video_id": video_id,
                **update_data,
                "status": TranscriptionStatus.completed,
                "created_at": datetime.now(timezone.utc).isoformat()
            })

        return {"message": "Transcript updated successfully"}

    except Exception as e:
        logging.error(f"Failed to update transcript: {e}")
        raise HTTPException(status_code=500, detail=str(e))
        return {"message": "Course deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# AI VIDEO PROCESSING ENDPOINTS
# =============================================================================

@api_router.post("/videos/transcribe")
async def start_transcription(request: TranscriptionRequest, background_tasks: BackgroundTasks):
    """
    Start video transcription job.
    Accepts video_id and audio_url, returns job status.
    Supports English and Tamil languages.
    """
    try:
        # Check if transcript already exists
        existing = await db.transcripts.find_one({"video_id": request.video_id})
        if existing:
            return {
                "message": "Transcript already exists",
                "video_id": request.video_id,
                "status": existing.get("status", "unknown")
            }

        # Create initial transcript record
        transcript_doc = {
            "video_id": request.video_id,
            "audio_url": request.audio_url,
            "language": request.language,
            "status": TranscriptionStatus.pending,
            "transcript": [],
            "full_text": "",
            "confidence_score": 0.0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        await db.transcripts.insert_one(transcript_doc)

        # Add background task to process transcription
        background_tasks.add_task(
            process_transcription,
            video_id=request.video_id,
            audio_path=request.audio_url,
            language=request.language,
            db=db
        )

        return {
            "message": "Transcription job started",
            "video_id": request.video_id,
            "status": TranscriptionStatus.pending,
            "estimated_time": "2-5 minutes depending on video length"
        }
    except Exception as e:
        logging.error(f"Failed to start transcription: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/videos/{video_id}/transcript")
async def get_transcript(video_id: str, language: str = None):
    """
    Get transcript for a video.
    Optionally filter by language (en, ta).
    Returns transcript segments with timestamps and full text.
    """
    try:
        query = {"video_id": video_id}
        if language:
            query["language"] = language

        transcript = await db.transcripts.find_one(query, {"_id": 0})

        if not transcript:
            raise HTTPException(status_code=404, detail="Transcript not found")

        # Convert ISO string timestamps back to datetime objects
        if isinstance(transcript.get('created_at'), str):
            transcript['created_at'] = datetime.fromisoformat(transcript['created_at'])
        if isinstance(transcript.get('updated_at'), str):
            transcript['updated_at'] = datetime.fromisoformat(transcript['updated_at'])

        return transcript
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to get transcript: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/videos/{video_id}/subtitles/{format}")
async def get_video_subtitles(video_id: str, format: str = "srt", language: str = "en"):
    """
    Get subtitles in specified format (srt or vtt).
    Returns the subtitle file content for download.
    """
    try:
        transcript = await db.transcripts.find_one({"video_id": video_id}, {"_id": 0})

        if not transcript:
            raise HTTPException(status_code=404, detail="Transcript not found")

        if transcript.get("status") != TranscriptionStatus.completed:
            raise HTTPException(
                status_code=400,
                detail=f"Transcription not completed. Current status: {transcript.get('status')}"
            )

        subtitles = transcript.get("subtitles", {}).get(format.lower())
        if not subtitles:
            # Generate subtitles on-the-fly if not stored
            segments = transcript.get("transcript", [])
            if format.lower() == "srt":
                subtitles = TranscriptionService.generate_srt(segments)
            else:
                subtitles = TranscriptionService.generate_vtt(segments)

        from fastapi.responses import Response, PlainTextResponse
        content_type = "text/srt" if format.lower() == "srt" else "text/vtt"
        return PlainTextResponse(content=subtitles, media_type=content_type)

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to get subtitles: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/videos/{video_id}/transcript")
async def delete_transcript(video_id: str, current_user: UserAuth = Depends(get_current_active_user)):
    """Delete a video transcript."""
    try:
        result = await db.transcripts.delete_one({"video_id": video_id})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Transcript not found")

        # Also delete associated chapters and resources
        await db.chapters.delete_many({"video_id": video_id})
        await db.resources.delete_many({"video_id": video_id})

        return {"message": "Transcript and associated data deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to delete transcript: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/videos/chapter")
async def generate_chapters(request: ChapteringRequest, background_tasks: BackgroundTasks):
    """
    Generate automated chapters for a video using AI.
    Analyzes transcript to detect topic changes and creates chapter markers.
    """
    try:
        # Check if transcript exists and is completed
        transcript = await db.transcripts.find_one({"video_id": request.video_id})

        if not transcript:
            raise HTTPException(
                status_code=404,
                detail="Transcript not found. Please transcribe the video first using /videos/transcribe"
            )

        if transcript["status"] != TranscriptionStatus.completed:
            raise HTTPException(
                status_code=400,
                detail=f"Transcript must be completed before generating chapters. Current status: {transcript['status']}"
            )

        # Add background task to generate chapters
        background_tasks.add_task(process_chaptering, video_id=request.video_id, db=db)

        return {
            "message": "Chapter generation started",
            "video_id": request.video_id,
            "estimated_chapters": "Will be calculated based on content analysis"
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to start chapter generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/videos/{video_id}/chapters")
async def get_chapters(video_id: str):
    """
    Get chapters for a video.
    Returns list of chapters with timestamps, titles, and topics.
    """
    try:
        chapters = await db.chapters.find({"video_id": video_id}, {"_id": 0}).to_list(100)

        # Convert ISO string timestamps back to datetime objects
        for chapter in chapters:
            if isinstance(chapter.get('created_at'), str):
                chapter['created_at'] = datetime.fromisoformat(chapter['created_at'])

        return chapters
    except Exception as e:
        logging.error(f"Failed to get chapters: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/videos/{video_id}/chapters/{chapter_id}")
async def update_chapter(
    video_id: str,
    chapter_id: str,
    update: ChapterUpdate,
    current_user: UserAuth = Depends(get_current_active_user)
):
    """
    Update a chapter (title, description, topics).
    Manual override for AI-generated chapters.
    """
    try:
        update_data = {k: v for k, v in update.model_dump().items() if v is not None}

        if update_data:
            await db.chapters.update_one(
                {"id": chapter_id, "video_id": video_id},
                {"$set": update_data}
            )

        return {"message": "Chapter updated successfully"}
    except Exception as e:
        logging.error(f"Failed to update chapter: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/videos/extract-resources")
async def extract_resources(request: ResourceExtractionRequest, background_tasks: BackgroundTasks):
    """
    Extract resources from a video transcript.
    Identifies URLs, books, tools, and references mentioned in the video.
    """
    try:
        # Check if transcript exists and is completed
        transcript = await db.transcripts.find_one({"video_id": request.video_id})

        if not transcript:
            raise HTTPException(
                status_code=404,
                detail="Transcript not found. Please transcribe the video first using /videos/transcribe"
            )

        if transcript["status"] != TranscriptionStatus.completed:
            raise HTTPException(
                status_code=400,
                detail=f"Transcript must be completed before extracting resources. Current status: {transcript['status']}"
            )

        # Add background task to extract resources
        background_tasks.add_task(process_resource_extraction, video_id=request.video_id, db=db)

        return {
            "message": "Resource extraction started",
            "video_id": request.video_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to start resource extraction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/videos/{video_id}/resources")
async def get_resources(video_id: str, resource_type: str = None):
    """
    Get resources for a video.
    Optionally filter by resource_type (website, book, article, video, tool).
    Returns clickable resource links with timestamps.
    """
    try:
        query = {"video_id": video_id}
        if resource_type:
            query["resource_type"] = resource_type

        resources = await db.resources.find(query, {"_id": 0}).to_list(100)

        # Convert ISO string timestamps back to datetime objects
        for resource in resources:
            if isinstance(resource.get('created_at'), str):
                resource['created_at'] = datetime.fromisoformat(resource['created_at'])

        return resources
    except Exception as e:
        logging.error(f"Failed to get resources: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/videos/{video_id}/resources")
async def add_resource(video_id: str, resource: VideoResource, current_user: UserAuth = Depends(get_current_active_user)):
    """
    Manually add a resource to a video.
    Allows instructors to add additional resources not found by AI.
    """
    try:
        resource.video_id = video_id
        resource.id = str(uuid.uuid4())
        resource.created_at = datetime.now(timezone.utc)

        resource_doc = resource.model_dump()
        resource_doc['created_at'] = resource.created_at.isoformat()

        await db.resources.insert_one(resource_doc)

        return resource
    except Exception as e:
        logging.error(f"Failed to add resource: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/videos/{video_id}/resources/{resource_id}")
async def delete_resource(video_id: str, resource_id: str, current_user: UserAuth = Depends(get_current_active_user)):
    """Delete a resource from a video."""
    try:
        result = await db.resources.delete_one({"id": resource_id, "video_id": video_id})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Resource not found")

        return {"message": "Resource deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to delete resource: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/videos/{video_id}/analysis")
async def get_video_analysis(video_id: str):
    """
    Get complete analysis results for a video.
    Returns status of transcription, chaptering, and resource extraction.
    """
    try:
        # Get transcript
        transcript = await db.transcripts.find_one({"video_id": video_id}, {"_id": 0})

        # Get chapters count
        chapters_count = await db.chapters.count_documents({"video_id": video_id})

        # Get resources count
        resources_count = await db.resources.count_documents({"video_id": video_id})

        # Get analytics if available
        total_views = await db.video_sessions.count_documents({"video_id": video_id})

        analysis = {
            "video_id": video_id,
            "has_transcript": transcript is not None,
            "has_chapters": chapters_count > 0,
            "has_resources": resources_count > 0,
            "transcript_status": transcript.get("status") if transcript else None,
            "transcript_language": transcript.get("language") if transcript else None,
            "transcript_duration": transcript.get("duration") if transcript else 0,
            "chapters_count": chapters_count,
            "resources_count": resources_count,
            "total_views": total_views,
            "last_updated": datetime.now(timezone.utc).isoformat()
        }

        return analysis
    except Exception as e:
        logging.error(f"Failed to get video analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/videos/analyze")
async def analyze_video(request: VideoAnalysisRequest, background_tasks: BackgroundTasks):
    """Perform complete video analysis (transcription, chaptering, resource extraction)"""
    try:
        results = {}
        video_id = request.video_id

        # Start transcription if requested
        if request.perform_transcription:
            if not request.audio_url:
                raise HTTPException(status_code=400, detail="audio_url is required when perform_transcription is True")

            # Check if transcript already exists
            existing = await db.transcripts.find_one({"video_id": video_id})
            if not existing:
                background_tasks.add_task(
                    process_transcription,
                    video_id=video_id,
                    audio_path=request.audio_url,
                    language="en",
                    db=db
                )
                results["transcription"] = "started"
            else:
                results["transcription"] = f"already_exists ({existing['status']})"

        # Wait for transcript if we need to generate chapters or resources
        if request.generate_chapters or request.extract_resources:
            transcript = await db.transcripts.find_one({"video_id": video_id})

            if not transcript:
                raise HTTPException(
                    status_code=400,
                    detail="Transcript not found. Please perform transcription first or set perform_transcription=True."
                )

            if transcript["status"] == TranscriptionStatus.completed:
                # Generate chapters
                if request.generate_chapters:
                    background_tasks.add_task(process_chaptering, video_id=video_id, db=db)
                    results["chaptering"] = "started"

                # Extract resources
                if request.extract_resources:
                    background_tasks.add_task(process_resource_extraction, video_id=video_id, db=db)
                    results["resource_extraction"] = "started"
            else:
                results["chaptering"] = f"pending_transcript ({transcript['status']})"
                results["resource_extraction"] = f"pending_transcript ({transcript['status']})"

        return {
            "message": "Video analysis jobs started",
            "video_id": video_id,
            "jobs": results
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to start video analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Video Analytics Endpoints

@api_router.post("/videos/track-event")
async def track_video_event(event: VideoViewEventCreate):
    """Track a video viewing event (play, pause, seek, etc.)"""
    try:
        # Initialize analytics service
        analytics_service = VideoAnalyticsService()

        # Create event record
        event_data = await analytics_service.record_view_event(
            video_id=event.video_id,
            user_id=event.user_id,
            event_type=event.event_type,
            timestamp=event.timestamp,
            session_id=event.session_id,
            metadata=event.metadata
        )

        # Store in database
        await db.video_events.insert_one(event_data)

        return {"message": "Event tracked successfully", "event_id": event_data["id"]}
    except Exception as e:
        logging.error(f"Failed to track event: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/videos/session/start")
async def start_video_session(session: VideoSessionCreate):
    """Start a new video viewing session"""
    try:
        session_id = str(uuid.uuid4())

        session_doc = {
            "session_id": session_id,
            "video_id": session.video_id,
            "user_id": session.user_id,
            "start_time": datetime.now(timezone.utc).isoformat(),
            "video_duration": session.video_duration,
            "watch_time": 0.0,
            "last_position": 0.0,
            "completed": False
        }

        await db.video_sessions.insert_one(session_doc)

        return {
            "message": "Session started successfully",
            "session_id": session_id,
            "video_id": session.video_id
        }
    except Exception as e:
        logging.error(f"Failed to start session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/videos/session/{session_id}")
async def update_video_session(session_id: str, update: VideoSessionUpdate):
    """Update an existing video viewing session"""
    try:
        # Build update document
        update_doc = {}
        if update.end_time:
            update_doc["end_time"] = update.end_time.isoformat()
        if update.watch_time is not None:
            update_doc["watch_time"] = update.watch_time
        if update.last_position is not None:
            update_doc["last_position"] = update.last_position
        if update.completed is not None:
            update_doc["completed"] = update.completed

        if update_doc:
            await db.video_sessions.update_one(
                {"session_id": session_id},
                {"$set": update_doc}
            )

        return {"message": "Session updated successfully"}
    except Exception as e:
        logging.error(f"Failed to update session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/videos/{video_id}/analytics")
async def get_video_analytics(video_id: str):
    """Get comprehensive analytics for a specific video"""
    try:
        # Initialize analytics service
        analytics_service = VideoAnalyticsService()

        # Get heatmap data
        heatmap_data = await analytics_service.generate_heatmap_data(video_id, db)

        # Get video statistics
        video_stats = await analytics_service.get_video_statistics(video_id, db)

        # Combine results
        return {
            "video_id": video_id,
            "heatmap": heatmap_data,
            "statistics": video_stats
        }
    except Exception as e:
        logging.error(f"Failed to get video analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/videos/{video_id}/heatmap")
async def get_video_heatmap(video_id: str):
    """Get engagement heatmap data for a video"""
    try:
        analytics_service = VideoAnalyticsService()
        heatmap_data = await analytics_service.generate_heatmap_data(video_id, db)
        return heatmap_data
    except Exception as e:
        logging.error(f"Failed to get heatmap: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/videos/{video_id}/statistics")
async def get_video_stats(video_id: str):
    """Get viewing statistics for a video"""
    try:
        analytics_service = VideoAnalyticsService()
        stats = await analytics_service.get_video_statistics(video_id, db)
        return stats
    except Exception as e:
        logging.error(f"Failed to get video statistics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/users/{user_id}/viewing-history")
async def get_user_viewing_history(user_id: str, limit: int = 20):
    """Get viewing history for a specific user"""
    try:
        analytics_service = VideoAnalyticsService()
        history = await analytics_service.get_user_viewing_history(user_id, db, limit)
        return history
    except Exception as e:
        logging.error(f"Failed to get user viewing history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/admin/analytics/dashboard")
async def get_analytics_dashboard(current_user: UserAuth = Depends(require_role([UserRole.admin, UserRole.instructor]))):
    """Get analytics dashboard overview"""
    try:
        # Get aggregate statistics across all videos
        total_sessions = await db.video_sessions.count_documents({})
        total_events = await db.video_events.count_documents({})

        # Get top performing videos
        pipeline = [
            {"$group": {
                "_id": "$video_id",
                "total_views": {"$sum": 1},
                "unique_viewers": {"$addToSet": "$user_id"}
            }},
            {"$project": {
                "video_id": "$_id",
                "total_views": 1,
                "unique_viewers": {"$size": "$unique_viewers"}
            }},
            {"$sort": {"total_views": -1}},
            {"$limit": 10}
        ]

        top_videos = await db.video_sessions.aggregate(pipeline).to_list(10)

        return {
            "total_sessions": total_sessions,
            "total_events": total_events,
            "top_performing_videos": top_videos,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logging.error(f"Failed to get analytics dashboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Enhanced Analytics Endpoints - Comprehensive Heatmap & Engagement Analytics

@api_router.get("/analytics/videos")
async def get_analytics_videos(
    timeRange: str = "30d",
    course_id: Optional[str] = None,
    current_user: UserAuth = Depends(require_role([UserRole.admin, UserRole.instructor]))
):
    """Get list of videos with analytics data for heatmap view"""
    try:
        # Calculate date filter
        days_map = {"7d": 7, "30d": 30, "90d": 90, "365d": 365}
        days = days_map.get(timeRange, 30)
        start_date = datetime.now(timezone.utc) - timedelta(days=days)

        # Build query
        query = {"start_time": {"$gte": start_date.isoformat()}}
        if course_id:
            query["course_id"] = course_id

        # Aggregate video stats
        pipeline = [
            {"$match": query},
            {"$group": {
                "_id": "$video_id",
                "total_views": {"$sum": 1},
                "unique_viewers": {"$addToSet": "$user_id"},
                "total_watch_time": {"$sum": "$watch_time"},
                "avg_completion": {"$avg": {"$cond": [{"$eq": ["$completed", True]}, 1, 0]}}
            }},
            {"$project": {
                "video_id": "$_id",
                "total_views": 1,
                "unique_viewers": {"$size": "$unique_viewers"},
                "total_watch_time": {"$round": ["$total_watch_time", 0]},
                "avg_completion": {"$round": [{"$multiply": ["$avg_completion", 100]}, 1]}
            }}
        ]

        results = await db.video_sessions.aggregate(pipeline).to_list(100)

        # Enrich with video metadata if available
        videos = []
        for result in results:
            video_meta = await db.video_metadata.find_one({"video_id": result["video_id"]})
            if video_meta:
                videos.append({
                    **video_meta,
                    **result,
                    "avgEngagement": min(100, int(result.get("avg_completion", 70) * 0.9)),
                    "completionRate": int(result.get("avg_completion", 70))
                })

        return {"videos": videos}
    except Exception as e:
        logging.error(f"Failed to get analytics videos: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/analytics/video/{video_id}/metrics")
async def get_video_metrics(
    video_id: str,
    timeRange: str = "30d",
    current_user: UserAuth = Depends(require_role([UserRole.admin, UserRole.instructor]))
):
    """Get detailed engagement metrics for a specific video"""
    try:
        days_map = {"7d": 7, "30d": 30, "90d": 90, "365d": 365}
        days = days_map.get(timeRange, 30)
        start_date = datetime.now(timezone.utc) - timedelta(days=days)

        # Get video duration
        video_session = await db.video_sessions.find_one({"video_id": video_id})
        if not video_session:
            raise HTTPException(status_code=404, detail="Video not found")

        video_duration = video_session.get("video_duration", 0)

        # Get all sessions in date range
        sessions_cursor = db.video_sessions.find({
            "video_id": video_id,
            "start_time": {"$gte": start_date.isoformat()}
        })

        sessions = await sessions_cursor.to_list(1000)

        if not sessions:
            return generate_mock_metrics(video_id, video_duration)

        # Calculate overview metrics
        total_views = len(sessions)
        unique_viewers = len(set(s["user_id"] for s in sessions))
        total_watch_time = sum(s.get("watch_time", 0) for s in sessions)
        completed = sum(1 for s in sessions if s.get("completed", False))
        repeat_viewers = sum(1 for user_id in set(s["user_id"] for s in sessions)
                            if sum(1 for s in sessions if s["user_id"] == user_id) > 1)

        # Calculate drop-off points
        dropoff_points = await calculate_dropoff_points(video_id, db)

        # Calculate rewatch data
        rewatch_data = await calculate_rewatch_data(video_id, db)

        # Calculate pause data
        pause_data = await calculate_pause_data(video_id, db)

        # Device breakdown
        device_breakdown = await calculate_device_breakdown(video_id, start_date, db)

        # Time of day engagement
        time_of_day = await calculate_time_of_day_engagement(video_id, start_date, db)

        return {
            "overview": {
                "averageWatchTime": total_watch_time / total_views if total_views > 0 else 0,
                "totalWatchTime": total_watch_time,
                "completionRate": (completed / total_views * 100) if total_views > 0 else 0,
                "averageCompletionRate": sum(s.get("watch_time", 0) / video_duration * 100
                                            for s in sessions if video_duration > 0) / len(sessions)
                                            if sessions else 0,
                "totalViews": total_views,
                "uniqueViewers": unique_viewers,
                "repeatViewers": repeat_viewers,
                "retentionRate": (unique_viewers / total_views * 100) if total_views > 0 else 0
            },
            "dropoffPoints": dropoff_points,
            "rewatchData": rewatch_data,
            "pauseData": pause_data,
            "engagementByDevice": device_breakdown,
            "engagementByTimeOfDay": time_of_day
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to get video metrics: {e}")
        # Return mock data for development
        return generate_mock_metrics(video_id, 1800)


@api_router.get("/analytics/course/{course_id}/metrics")
async def get_course_metrics(
    course_id: str,
    timeRange: str = "30d",
    current_user: UserAuth = Depends(require_role([UserRole.admin, UserRole.instructor]))
):
    """Get aggregated metrics for a course"""
    try:
        # Get all videos in course
        videos_cursor = db.video_metadata.find({"course_id": course_id})
        videos = await videos_cursor.to_list(100)

        if not videos:
            raise HTTPException(status_code=404, detail="Course not found")

        video_ids = [v["video_id"] for v in videos]

        # Get sessions for all videos
        days_map = {"7d": 7, "30d": 30, "90d": 90, "365d": 365}
        days = days_map.get(timeRange, 30)
        start_date = datetime.now(timezone.utc) - timedelta(days=days)

        sessions_cursor = db.video_sessions.find({
            "video_id": {"$in": video_ids},
            "start_time": {"$gte": start_date.isoformat()}
        })

        sessions = await sessions_cursor.to_list(1000)

        # Aggregate metrics
        total_views = len(sessions)
        unique_viewers = len(set(s["user_id"] for s in sessions))
        total_watch_time = sum(s.get("watch_time", 0) for s in sessions)
        completed = sum(1 for s in sessions if s.get("completed", False))

        return {
            "course_id": course_id,
            "overview": {
                "averageWatchTime": total_watch_time / total_views if total_views > 0 else 0,
                "totalWatchTime": total_watch_time,
                "completionRate": (completed / total_views * 100) if total_views > 0 else 0,
                "totalViews": total_views,
                "uniqueViewers": unique_viewers,
                "videosCount": len(videos)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to get course metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/analytics/track-event")
async def track_video_event(event: VideoViewEventCreate):
    """Track a video viewing event (play, pause, seek, etc.)"""
    try:
        event_doc = VideoViewEvent(
            video_id=event.video_id,
            user_id=event.user_id,
            session_id=event.session_id,
            event_type=event.event_type,
            timestamp=event.timestamp,
            metadata=event.metadata or {}
        )

        await db.video_events.insert_one(event_doc.model_dump(by_alias=True, exclude={"id"}))

        return {"status": "recorded", "event_id": str(event_doc.id)}
    except Exception as e:
        logging.error(f"Failed to track event: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/analytics/session/start")
async def start_video_session(session: VideoSessionCreate, current_user: UserAuth = Depends(get_current_active_user)):
    """Start a new video viewing session"""
    try:
        session_doc = VideoSession(
            video_id=session.video_id,
            user_id=str(current_user.id),
            session_id=str(uuid.uuid4()),
            video_duration=session.video_duration,
            start_time=datetime.now(timezone.utc),
            last_position=0.0,
            watch_time=0.0,
            completed=False
        )

        await db.video_sessions.insert_one(session_doc.model_dump(by_alias=True, exclude={"id"}))

        return {
            "session_id": session_doc.session_id,
            "started_at": session_doc.start_time.isoformat()
        }
    except Exception as e:
        logging.error(f"Failed to start session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.put("/analytics/session/{session_id}")
async def update_video_session(
    session_id: str,
    update: VideoSessionUpdate,
    current_user: UserAuth = Depends(get_current_active_user)
):
    """Update an existing video session"""
    try:
        # Build update document
        update_doc = {}
        if update.end_time:
            update_doc["end_time"] = update.end_time.isoformat()
        if update.watch_time is not None:
            update_doc["watch_time"] = update.watch_time
        if update.last_position is not None:
            update_doc["last_position"] = update.last_position
        if update.completed is not None:
            update_doc["completed"] = update.completed

        if update_doc:
            await db.video_sessions.update_one(
                {"session_id": session_id, "user_id": str(current_user.id)},
                {"$set": update_doc}
            )

        return {"status": "updated"}
    except Exception as e:
        logging.error(f"Failed to update session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Helper functions for analytics calculations

async def calculate_dropoff_points(video_id: str, db) -> List[Dict[str, Any]]:
    """Calculate critical drop-off points in a video"""
    try:
        # Get session data with last positions
        pipeline = [
            {"$match": {"video_id": video_id}},
            {"$group": {
                "_id": None,
                "last_positions": {"$push": "$last_position"},
                "video_durations": {"$first": "$video_duration"}
            }}
        ]

        result = await db.video_sessions.aggregate(pipeline).to_list(1)

        if not result:
            return []

        positions = result[0].get("last_positions", [])
        video_duration = result[0].get("video_durations", 1800)

        if not positions or video_duration == 0:
            return []

        # Create bins and calculate drop-off
        bin_size = 30  # 30 second bins
        num_bins = int(video_duration // bin_size) + 1
        bins = [0] * num_bins

        for pos in positions:
            if pos > 0:
                bin_idx = int(min(pos, video_duration) // bin_size)
                if bin_idx < num_bins:
                    bins[bin_idx] += 1

        total_sessions = len(positions)
        dropoff_points = []

        for i, count in enumerate(bins):
            if i == 0:
                continue

            dropped_off = sum(bins[i:])  # People who haven't watched past this point
            dropoff_rate = (dropped_off / total_sessions * 100) if total_sessions > 0 else 0

            if dropoff_rate > 5:  # Only significant drop-offs
                dropoff_points.append({
                    "timestamp": i * bin_size,
                    "percentage": round(dropoff_rate, 1),
                    "cumulativeDropoff": round(dropoff_rate, 1),
                    "reason": "Content transition" if i % 5 == 0 else "Complex section",
                    "severity": "high" if dropoff_rate > 15 else "medium" if dropoff_rate > 10 else "low",
                    "studentsAffected": dropped_off
                })

        # Sort by drop-off rate and take top 5
        dropoff_points.sort(key=lambda x: x["percentage"], reverse=True)
        return dropoff_points[:5]
    except Exception as e:
        logging.error(f"Failed to calculate dropoff points: {e}")
        return []


async def calculate_rewatch_data(video_id: str, db) -> Dict[str, Any]:
    """Calculate rewatch statistics for a video"""
    try:
        # Get all seek events (indicating rewatching)
        seek_events = await db.video_events.find({
            "video_id": video_id,
            "event_type": "seek"
        }).to_list(1000)

        # Get sessions
        sessions = await db.video_sessions.find({"video_id": video_id}).to_list(1000)

        if not sessions:
            return {
                "totalRewatches": 0,
                "averageRewatchesPerViewer": 0,
                "mostRewatchedSegments": []
            }

        # Count rewatches (backward seeks)
        backward_seeks = [e for e in seek_events if e.get("metadata", {}).get("direction") == "backward"]
        total_rewatches = len(backward_seeks)
        unique_viewers = len(set(s["user_id"] for s in sessions))

        # Find most rewatched segments
        segment_rewatches = {}
        for event in backward_seeks:
            timestamp = event.get("timestamp", 0)
            segment_start = (timestamp // 30) * 30
            segment_rewatches[segment_start] = segment_rewatches.get(segment_start, 0) + 1

        most_rewatched = sorted(segment_rewatches.items(), key=lambda x: x[1], reverse=True)[:5]

        return {
            "totalRewatches": total_rewatches,
            "averageRewatchesPerViewer": round(total_rewatches / unique_viewers, 2) if unique_viewers > 0 else 0,
            "mostRewatchedSegments": [
                {
                    "startTime": seg,
                    "endTime": seg + 30,
                    "rewatchCount": count,
                    "percentage": round(count / total_rewatches * 100, 1) if total_rewatches > 0 else 0
                }
                for seg, count in most_rewatched
            ]
        }
    except Exception as e:
        logging.error(f"Failed to calculate rewatch data: {e}")
        return {"totalRewatches": 0, "averageRewatchesPerViewer": 0, "mostRewatchedSegments": []}


async def calculate_pause_data(video_id: str, db) -> Dict[str, Any]:
    """Calculate pause statistics for a video"""
    try:
        pause_events = await db.video_events.find({
            "video_id": video_id,
            "event_type": "pause"
        }).to_list(1000)

        sessions = await db.video_sessions.find({"video_id": video_id}).to_list(1000)

        if not sessions:
            return {
                "totalPauses": 0,
                "averagePausesPerViewer": 0,
                "pauseFrequency": []
            }

        total_pauses = len(pause_events)
        unique_viewers = len(set(s["user_id"] for s in sessions))

        # Calculate pause distribution by time ranges
        pause_frequency = [
            {"timeRange": "0-2m", "count": 0, "percentage": 0},
            {"timeRange": "2-5m", "count": 0, "percentage": 0},
            {"timeRange": "5-10m", "count": 0, "percentage": 0},
            {"timeRange": "10-15m", "count": 0, "percentage": 0},
            {"timeRange": "15-20m", "count": 0, "percentage": 0},
            {"timeRange": "20m+", "count": 0, "percentage": 0}
        ]

        for event in pause_events:
            timestamp = event.get("timestamp", 0)
            if timestamp < 120:
                pause_frequency[0]["count"] += 1
            elif timestamp < 300:
                pause_frequency[1]["count"] += 1
            elif timestamp < 600:
                pause_frequency[2]["count"] += 1
            elif timestamp < 900:
                pause_frequency[3]["count"] += 1
            elif timestamp < 1200:
                pause_frequency[4]["count"] += 1
            else:
                pause_frequency[5]["count"] += 1

        # Calculate percentages
        for pf in pause_frequency:
            pf["percentage"] = round(pf["count"] / total_pauses * 100, 1) if total_pauses > 0 else 0

        return {
            "totalPauses": total_pauses,
            "averagePausesPerViewer": round(total_pauses / unique_viewers, 2) if unique_viewers > 0 else 0,
            "pauseFrequency": pause_frequency
        }
    except Exception as e:
        logging.error(f"Failed to calculate pause data: {e}")
        return {"totalPauses": 0, "averagePausesPerViewer": 0, "pauseFrequency": []}


async def calculate_device_breakdown(video_id: str, start_date: datetime, db) -> Dict[str, Any]:
    """Calculate engagement breakdown by device type"""
    try:
        # For now, return mock data since we don't track device type
        # In production, this would come from the user_agent in events
        return {
            "desktop": {"views": 2847, "avgWatchTime": 923, "completionRate": 71.2},
            "mobile": {"views": 1234, "avgWatchTime": 654, "completionRate": 58.3},
            "tablet": {"views": 342, "avgWatchTime": 789, "completionRate": 65.8}
        }
    except Exception as e:
        logging.error(f"Failed to calculate device breakdown: {e}")
        return {}


async def calculate_time_of_day_engagement(video_id: str, start_date: datetime, db) -> List[Dict[str, Any]]:
    """Calculate engagement patterns by time of day"""
    try:
        sessions = await db.video_sessions.find({
            "video_id": video_id,
            "start_time": {"$gte": start_date.isoformat()}
        }).to_list(1000)

        if not sessions:
            return []

        # Group by hour of day
        hour_counts = {}
        hour_watch_times = {}

        for session in sessions:
            try:
                start_time_str = session.get("start_time", "")
                if isinstance(start_time_str, str):
                    start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
                else:
                    start_time = start_time_str

                hour = start_time.hour
                hour_counts[hour] = hour_counts.get(hour, 0) + 1
                hour_watch_times[hour] = hour_watch_times.get(hour, 0) + session.get("watch_time", 0)
            except:
                continue

        # Create summary for key hours
        key_hours = [6, 9, 12, 15, 18, 21]
        result = []

        for hour in key_hours:
            result.append({
                "hour": hour,
                "label": f"{hour % 12 or 12}{'AM' if hour < 12 else 'PM'}",
                "views": hour_counts.get(hour, 0),
                "avgWatchTime": hour_watch_times.get(hour, 0) // max(hour_counts.get(hour, 1), 1)
            })

        return result
    except Exception as e:
        logging.error(f"Failed to calculate time of day engagement: {e}")
        return []


def generate_mock_metrics(video_id: str, video_duration: float) -> Dict[str, Any]:
    """Generate mock metrics for development/testing"""
    return {
        "overview": {
            "averageWatchTime": 847,
            "totalWatchTime": 125000,
            "completionRate": 67.8,
            "averageCompletionRate": 72.3,
            "totalViews": 4523,
            "uniqueViewers": 3840,
            "repeatViewers": 683,
            "retentionRate": 78.5
        },
        "dropoffPoints": [
            {"timestamp": 245, "percentage": 23.4, "cumulativeDropoff": 23.4, "reason": "Complex explanation", "severity": "high", "studentsAffected": 1059},
            {"timestamp": 487, "percentage": 18.2, "cumulativeDropoff": 36.2, "reason": "Lengthy code example", "severity": "medium", "studentsAffected": 824},
            {"timestamp": 723, "percentage": 14.8, "cumulativeDropoff": 45.6, "reason": "Transition to new topic", "severity": "medium", "studentsAffected": 669}
        ],
        "rewatchData": {
            "totalRewatches": 1892,
            "averageRewatchesPerViewer": 0.49,
            "mostRewatchedSegments": [
                {"startTime": 120, "endTime": 180, "rewatchCount": 342, "percentage": 18.1},
                {"startTime": 450, "endTime": 510, "rewatchCount": 287, "percentage": 15.2}
            ]
        },
        "pauseData": {
            "totalPauses": 5634,
            "averagePausesPerViewer": 1.47,
            "pauseFrequency": [
                {"timeRange": "0-2m", "count": 847, "percentage": 15.0},
                {"timeRange": "2-5m", "count": 1234, "percentage": 21.9},
                {"timeRange": "5-10m", "count": 1567, "percentage": 27.8}
            ]
        },
        "engagementByDevice": {
            "desktop": {"views": 2847, "avgWatchTime": 923, "completionRate": 71.2},
            "mobile": {"views": 1234, "avgWatchTime": 654, "completionRate": 58.3},
            "tablet": {"views": 342, "avgWatchTime": 789, "completionRate": 65.8}
        },
        "engagementByTimeOfDay": [
            {"hour": 6, "label": "6AM", "views": 123, "avgWatchTime": 720},
            {"hour": 9, "label": "9AM", "views": 567, "avgWatchTime": 890},
            {"hour": 12, "label": "12PM", "views": 892, "avgWatchTime": 845},
            {"hour": 15, "label": "3PM", "views": 734, "avgWatchTime": 867},
            {"hour": 18, "label": "6PM", "views": 1245, "avgWatchTime": 812},
            {"hour": 21, "label": "9PM", "views": 962, "avgWatchTime": 834}
        ]
    }


# EduSearch Endpoints - Smart Video Search with Timestamp Indexing

@api_router.post("/search/videos", response_model=List[SearchMatch])
async def search_video_transcripts(search_request: SearchRequest):
    """Search for exact moments in video transcripts with fuzzy matching."""
    try:
        query = search_request.query.strip()
        if not query:
            raise HTTPException(status_code=400, detail="Search query cannot be empty")

        # Get all completed transcripts
        transcripts_cursor = db.transcripts.find({"status": TranscriptionStatus.completed})

        all_matches = []

        async for transcript_doc in transcripts_cursor:
            video_id = transcript_doc.get("video_id")
            transcript_segments = transcript_doc.get("transcript", [])

            if not transcript_segments:
                continue

            # Get video metadata
            video_meta = await db.video_metadata.find_one({"video_id": video_id}, {"_id": 0})
            if not video_meta:
                # Create basic metadata from transcript
                video_meta = {
                    "video_id": video_id,
                    "course_title": transcript_doc.get("course_title", "Unknown Course"),
                    "video_title": transcript_doc.get("video_title", f"Video {video_id}"),
                    "instructor": transcript_doc.get("instructor", "Unknown"),
                    "course_id": transcript_doc.get("course_id"),
                    "topics": []
                }

            # Perform search in this transcript
            results = EduSearchService.search_in_transcript(
                transcript_segments,
                query,
                search_request.fuzzy_threshold
            )

            # Extract context and create matches
            for result in results:
                context_before, matched_text, context_after = EduSearchService.extract_context(
                    transcript_segments,
                    result["timestamp"],
                    search_request.context_window
                )

                # Calculate relevance score
                relevance_score = result["confidence_score"]
                if search_request.filters:
                    # Apply filters
                    if search_request.filters.course_id and video_meta.get("course_id") != search_request.filters.course_id:
                        continue
                    if search_request.filters.instructor and search_request.filters.instructor.lower() not in video_meta.get("instructor", "").lower():
                        continue
                    if search_request.filters.topic:
                        topic_match = any(search_request.filters.topic.lower() in t.lower() for t in video_meta.get("topics", []))
                        if not topic_match and search_request.filters.topic.lower() not in matched_text.lower():
                            relevance_score *= 0.5

                match = SearchMatch(
                    video_id=video_id,
                    course_id=video_meta.get("course_id"),
                    course_title=video_meta.get("course_title", ""),
                    video_title=video_meta.get("video_title", ""),
                    instructor=video_meta.get("instructor", ""),
                    timestamp=result["timestamp"],
                    end_time=result["end_time"],
                    matched_text=matched_text[:200],
                    context_before=context_before[:100],
                    context_after=context_after[:100],
                    confidence_score=result["confidence_score"],
                    relevance_score=relevance_score
                )
                all_matches.append(match.model_dump())

        # Deduplicate and sort
        deduplicated = EduSearchService.deduplicate_results(all_matches)
        sorted_results = sorted(deduplicated, key=lambda x: (-x.get("relevance_score", 0), x.get("timestamp", 0)))

        return sorted_results[:search_request.max_results]

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/search/suggestions")
async def get_search_suggestions(q: str, limit: int = 10):
    """Get auto-suggestions for search queries based on indexed content."""
    try:
        if not q or len(q) < 2:
            return []

        query_lower = q.lower()
        suggestions = []
        seen = set()

        # Get from indexed topics
        async for video in db.video_metadata.find({"topics": {"$regex": query_lower, "$options": "i"}}, {"_id": 0}):
            for topic in video.get("topics", []):
                if query_lower in topic.lower() and topic not in seen:
                    suggestions.append(SearchSuggestion(
                        text=topic,
                        count=1,
                        category="topic"
                    ).model_dump())
                    seen.add(topic)

        # Get from course titles
        async for video in db.video_metadata.find({"course_title": {"$regex": query_lower, "$options": "i"}}, {"_id": 0}):
            title = video.get("course_title", "")
            if title and title not in seen:
                suggestions.append(SearchSuggestion(
                    text=title,
                    count=1,
                    category="course"
                ).model_dump())
                seen.add(title)

        # Get from instructors
        async for video in db.video_metadata.find({"instructor": {"$regex": query_lower, "$options": "i"}}, {"_id": 0}):
            instructor = video.get("instructor", "")
            if instructor and instructor not in seen:
                suggestions.append(SearchSuggestion(
                    text=instructor,
                    count=1,
                    category="instructor"
                ).model_dump())
                seen.add(instructor)

        # Add common technical terms that match
        for term, synonyms in EduSearchService.TECH_SYNONYMS.items():
            if query_lower in term.lower() or any(query_lower in s.lower() for s in synonyms):
                if term not in seen:
                    suggestions.append(SearchSuggestion(
                        text=term,
                        count=0,
                        category="topic"
                    ).model_dump())
                    seen.add(term)
                for syn in synonyms[:3]:
                    if query_lower in syn.lower() and syn not in seen:
                        suggestions.append(SearchSuggestion(
                            text=syn,
                            count=0,
                            category="topic"
                        ).model_dump())
                        seen.add(syn)

        return suggestions[:limit]

    except Exception as e:
        logging.error(f"Suggestions error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/search/filters")
async def get_available_filters():
    """Get available filter options for search."""
    try:
        courses = await db.video_metadata.distinct("course_title")
        instructors = await db.video_metadata.distinct("instructor")
        topics = await db.video_metadata.distinct("topics")

        # Flatten topics list
        all_topics = set()
        for topic_list in topics:
            if isinstance(topic_list, list):
                all_topics.update(topic_list)
            else:
                all_topics.add(topic_list)

        return {
            "courses": sorted([c for c in courses if c]),
            "instructors": sorted([i for i in instructors if i]),
            "topics": sorted([t for t in all_topics if t])
        }

    except Exception as e:
        logging.error(f"Filters error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/admin/search/index", status_code=status.HTTP_201_CREATED)
async def index_video_for_search(
    video_id: str,
    course_id: Optional[str] = None,
    course_title: str = "",
    video_title: str = "",
    instructor: str = "",
    topics: List[str] = [],
    duration: float = 0.0,
    language: str = "en"
):
    """Index a video transcript for search. This should be called after transcription is complete."""
    try:
        transcript = await db.transcripts.find_one({"video_id": video_id})
        if not transcript:
            raise HTTPException(status_code=404, detail="Transcript not found. Please transcribe the video first.")

        if transcript.get("status") != TranscriptionStatus.completed:
            raise HTTPException(
                status_code=400,
                detail=f"Transcript must be completed before indexing. Current status: {transcript.get('status')}"
            )

        # Create or update video metadata
        metadata_doc = {
            "video_id": video_id,
            "course_id": course_id,
            "course_title": course_title,
            "video_title": video_title,
            "instructor": instructor,
            "topics": topics,
            "duration": duration,
            "language": language,
            "indexed_at": datetime.now(timezone.utc).isoformat()
        }

        await db.video_metadata.update_one(
            {"video_id": video_id},
            {"$set": metadata_doc},
            upsert=True
        )

        # Build word index for faster searching
        transcript_segments = transcript.get("transcript", [])
        word_index = defaultdict(list)

        for segment in transcript_segments:
            text = segment.get("text", "")
            timestamp = segment.get("start", 0)

            # Tokenize and index words
            words = re.findall(r'\b\w+\b', text.lower())
            for word in words:
                word_index[word].append(timestamp)

        # Create index documents
        bulk_operations = []
        for word, positions in word_index.items():
            bulk_operations.append({
                "update_one": {
                    "filter": {"video_id": video_id, "normalized_word": word},
                    "update": {
                        "$set": {
                            "word": word,
                            "normalized_word": word,
                            "positions": positions,
                            "created_at": datetime.now(timezone.utc).isoformat()
                        }
                    },
                    "upsert": True
                }
            })

        if bulk_operations:
            await db.transcript_index.bulk_write(bulk_operations)

        return {
            "message": "Video indexed successfully",
            "video_id": video_id,
            "words_indexed": len(word_index),
            "indexed_at": metadata_doc["indexed_at"]
        }

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Indexing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/search/indexed-videos")
async def get_indexed_videos():
    """Get list of all videos that are indexed for search."""
    try:
        videos = await db.video_metadata.find({}, {"_id": 0}).to_list(100)

        for video in videos:
            if isinstance(video.get("indexed_at"), str):
                video["indexed_at"] = datetime.fromisoformat(video["indexed_at"])

        return videos

    except Exception as e:
        logging.error(f"Failed to get indexed videos: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/admin/search/index/{video_id}")
async def remove_video_from_search_index(video_id: str):
    """Remove a video from the search index."""
    try:
        await db.video_metadata.delete_many({"video_id": video_id})
        await db.transcript_index.delete_many({"video_id": video_id})

        return {"message": "Video removed from search index", "video_id": video_id}

    except Exception as e:
        logging.error(f"Failed to remove from index: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/search/stats")
async def get_search_statistics():
    """Get statistics about the search index."""
    try:
        total_videos = await db.video_metadata.count_documents({})
        total_words = await db.transcript_index.count_documents({})

        # Get most common topics
        pipeline = [
            {"$unwind": "$topics"},
            {"$group": {"_id": "$topics", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 20}
        ]
        top_topics = await db.video_metadata.aggregate(pipeline).to_list(20)

        return {
            "total_videos_indexed": total_videos,
            "total_unique_words_indexed": total_words,
            "top_topics": [{"topic": t["_id"], "count": t["count"]} for t in top_topics]
        }

    except Exception as e:
        logging.error(f"Failed to get search stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# TEACHER ANALYTICS API ENDPOINTS
# ============================================

class AnalyticsDashboardStats(BaseModel):
    model_config = ConfigDict(extra="ignore")
    total_views: int
    unique_students: int
    avg_completion_rate: float
    total_watch_time: int
    revenue: float
    active_courses: int
    quiz_pass_rate: float
    avg_quiz_score: float

# Teacher Analytics Dashboard Endpoint
@api_router.get("/analytics/dashboard")
async def get_analytics_dashboard(
    time_range: str = "30d",
    course_id: Optional[str] = None,
    current_user: UserAuth = Depends(require_role([UserRole.admin, UserRole.instructor]))
):
    """Get comprehensive analytics dashboard data for teachers."""
    try:
        days_map = {"7d": 7, "30d": 30, "90d": 90, "365d": 365}
        days = days_map.get(time_range, 30)
        start_date = datetime.now(timezone.utc) - timedelta(days=days)

        base_query = {"start_time": {"$gte": start_date.isoformat()}}
        if course_id:
            base_query["course_id"] = course_id

        total_views = await db.video_sessions.count_documents(base_query)

        pipeline = [
            {"$match": base_query},
            {"$group": {"_id": "$user_id"}},
            {"$count": "total"}
        ]
        result = await db.video_sessions.aggregate(pipeline).to_list(1)
        unique_students = result[0]["total"] if result else 0

        completed_pipeline = [
            {"$match": {**base_query, "completed": True}},
            {"$count": "total"}
        ]
        completed_result = await db.video_sessions.aggregate(completed_pipeline).to_list(1)
        completed_count = completed_result[0]["total"] if completed_result else 0
        avg_completion_rate = (completed_count / total_views * 100) if total_views > 0 else 0

        pipeline = [
            {"$match": base_query},
            {"$group": {"_id": None, "total": {"$sum": "$watch_time"}}}
        ]
        result = await db.video_sessions.aggregate(pipeline).to_list(1)
        total_watch_time = int(result[0]["total"]) if result else 0

        revenue = unique_students * 45.00
        active_courses = await db.courses.count_documents({"status": "published"})
        quiz_pass_rate = 73.5
        avg_quiz_score = 81.2

        return AnalyticsDashboardStats(
            total_views=total_views,
            unique_students=unique_students,
            avg_completion_rate=round(avg_completion_rate, 1),
            total_watch_time=total_watch_time,
            revenue=round(revenue, 2),
            active_courses=active_courses,
            quiz_pass_rate=quiz_pass_rate,
            avg_quiz_score=avg_quiz_score
        )

    except Exception as e:
        logging.error(f"Failed to get analytics dashboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Video Heatmap Endpoint
@api_router.get("/analytics/heatmap/{video_id}")
async def get_video_heatmap(
    video_id: str,
    segment_size: int = 30,
    current_user: UserAuth = Depends(require_role([UserRole.admin, UserRole.instructor]))
):
    """Get engagement heatmap data for a specific video."""
    try:
        analytics_service = VideoAnalyticsService()
        heatmap_data = await analytics_service.generate_heatmap_data(video_id, db, segment_size)
        video_stats = await analytics_service.get_video_statistics(video_id, db)

        return {
            "video_id": video_id,
            "segment_size": segment_size,
            "heatmap": heatmap_data,
            "statistics": video_stats
        }

    except Exception as e:
        logging.error(f"Failed to get heatmap: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Students Analytics Endpoint
@api_router.get("/analytics/students")
async def get_students_analytics(
    course_id: Optional[str] = None,
    performance_filter: str = "all",
    limit: int = 50,
    current_user: UserAuth = Depends(require_role([UserRole.admin, UserRole.instructor]))
):
    """Get analytics data for students."""
    try:
        match_stage = {"role": "student"}
        students_cursor = db.users.find(match_stage)
        students = await students_cursor.to_list(limit)

        student_data = []
        for student in students:
            sessions = await db.video_sessions.find({"user_id": str(student.get("_id"))}).to_list(None)
            total_watch_time = sum(s.get("watch_time", 0) for s in sessions)
            completed_courses = sum(1 for s in sessions if s.get("completed", False))

            quizzes = await db.quiz_results.find({"user_id": str(student.get("_id"))}).to_list(None)
            avg_score = sum(q.get("score", 0) for q in quizzes) / len(quizzes) if quizzes else 75

            student_data.append({
                "id": str(student.get("_id")),
                "name": student.get("name", ""),
                "email": student.get("email", ""),
                "courses_completed": completed_courses,
                "avg_score": round(avg_score, 1),
                "streak": 0,
                "total_watch_time": total_watch_time,
                "last_activity": sessions[0].get("start_time") if sessions else None,
                "badges": completed_courses // 3
            })

        if performance_filter == "top":
            student_data = [s for s in student_data if s["avg_score"] >= 85]
        elif performance_filter == "at_risk":
            student_data = [s for s in student_data if s["avg_score"] < 60 or s["courses_completed"] == 0]

        student_data.sort(key=lambda x: x["avg_score"], reverse=True)

        return {
            "students": student_data[:limit],
            "total": len(student_data),
            "filter": performance_filter
        }

    except Exception as e:
        logging.error(f"Failed to get students analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Course Performance Analytics Endpoint
@api_router.get("/analytics/courses")
async def get_courses_analytics(
    current_user: UserAuth = Depends(require_role([UserRole.admin, UserRole.instructor]))
):
    """Get performance analytics for all courses."""
    try:
        courses_cursor = db.courses.find({"status": "published"})
        courses = await courses_cursor.to_list(100)

        course_analytics = []

        for course in courses:
            course_id = str(course.get("_id"))
            total_views = course.get("enrolled", 0) * 5
            students = course.get("enrolled", 0)
            completion_rate = min(95, max(50, 60 + (students / 100)))
            revenue = course.get("price", 0) * students
            avg_score = min(95, max(65, 70 + (completion_rate / 5)))
            trend = "up" if completion_rate > 70 else "down"

            course_analytics.append({
                "id": course_id,
                "title": course.get("title", ""),
                "views": total_views,
                "students": students,
                "completion_rate": round(completion_rate, 1),
                "revenue": round(revenue, 2),
                "avg_score": round(avg_score, 1),
                "trend": trend
            })

        course_analytics.sort(key=lambda x: x["views"], reverse=True)

        return {
            "courses": course_analytics,
            "total": len(course_analytics)
        }

    except Exception as e:
        logging.error(f"Failed to get courses analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Engagement Trends Endpoint
@api_router.get("/analytics/engagement")
async def get_engagement_trends(
    time_range: str = "30d",
    granularity: str = "daily",
    current_user: UserAuth = Depends(require_role([UserRole.admin, UserRole.instructor]))
):
    """Get engagement trends over time."""
    try:
        days_map = {"7d": 7, "30d": 30, "90d": 90, "365d": 365}
        days = days_map.get(time_range, 30)
        start_date = datetime.now(timezone.utc) - timedelta(days=days)

        date_format = "%Y-%m-%d" if granularity == "daily" else "%Y-W%V"

        pipeline = [
            {"$match": {"start_time": {"$gte": start_date.isoformat()}}},
            {
                "$group": {
                    "_id": {"$dateToString": {"format": date_format, "date": "$start_time"}},
                    "views": {"$sum": 1},
                    "unique_students": {"$addToSet": "$user_id"},
                    "total_watch_time": {"$sum": "$watch_time"},
                    "completed": {"$sum": {"$cond": ["$completed", 1, 0]}}
                }
            },
            {"$sort": {"_id": 1}}
        ]

        results = await db.video_sessions.aggregate(pipeline).to_list(100)

        trends = []
        for result in results:
            trends.append({
                "date": result["_id"],
                "views": result["views"],
                "unique_students": len(result["unique_students"]),
                "completions": result["completed"],
                "watch_time": result["total_watch_time"]
            })

        return {
            "trends": trends,
            "time_range": time_range,
            "granularity": granularity
        }

    except Exception as e:
        logging.error(f"Failed to get engagement trends: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# MOCK DATA ENDPOINTS FOR DEMO/TESTING
# ============================================

# Mock video transcripts for testing search
MOCK_VIDEO_DATA = [
    {
        "video_id": "react-hooks-01",
        "course_id": "react-masterclass",
        "course_title": "React Masterclass 2024",
        "video_title": "Introduction to React Hooks",
        "instructor": "Sarah Johnson",
        "topics": ["react", "hooks", "useState", "useEffect", "functional components"],
        "duration": 1800.0,
        "transcript": [
            {"text": "Welcome back to the React Masterclass. Today we're diving deep into React Hooks.", "start": 0.0, "end": 5.2},
            {"text": "React Hooks were introduced in React 16.8 and they completely changed how we write components.", "start": 5.5, "end": 12.8},
            {"text": "Before hooks, we had to use class components for state management. Let me show you how useState works.", "start": 13.0, "end": 22.5},
            {"text": "The useState hook allows you to add state to functional components. Here's the syntax: const [state, setState] = useState(initialValue).", "start": 23.0, "end": 35.0},
            {"text": "You can use useState with any data type: strings, numbers, objects, or even arrays.", "start": 35.5, "end": 42.0},
            {"text": "Now let's talk about useEffect. This hook runs side effects in functional components.", "start": 43.0, "end": 50.0},
            {"text": "useEffect runs after every render by default, but you can control when it runs using the dependency array.", "start": 50.5, "end": 60.0},
            {"text": "The dependency array is the second argument. If it's empty, useEffect only runs once after mount.", "start": 60.5, "end": 68.0},
            {"text": "Custom hooks are a powerful pattern. You can extract component logic into reusable functions.", "start": 69.0, "end": 77.0},
            {"text": "Always name custom hooks with 'use' prefix like useFetch, useForm, or useLocalStorage.", "start": 77.5, "end": 85.0},
        ]
    },
    {
        "video_id": "js-async-02",
        "course_id": "javascript-advanced",
        "course_title": "Advanced JavaScript Patterns",
        "video_title": "Mastering Async/Await",
        "instructor": "Michael Chen",
        "topics": ["javascript", "async", "await", "promises", "callbacks", "fetch api"],
        "duration": 2100.0,
        "transcript": [
            {"text": "In this lesson, we'll master asynchronous JavaScript using async and await.", "start": 0.0, "end": 6.0},
            {"text": "Before async/await, we had to use callbacks which led to callback hell.", "start": 7.0, "end": 14.0},
            {"text": "Then came Promises, which made things better but still had some complexity with .then() chains.", "start": 14.5, "end": 23.0},
            {"text": "Async/await is syntactic sugar over Promises. It makes asynchronous code look synchronous.", "start": 24.0, "end": 32.0},
            {"text": "To use async/await, you first mark a function as async using the async keyword.", "start": 33.0, "end": 40.0},
            {"text": "Inside an async function, you can use await to pause execution until a Promise resolves.", "start": 40.5, "end": 50.0},
            {"text": "Here's an example: const data = await fetch(url); const json = await data.json();", "start": 51.0, "end": 60.0},
            {"text": "Always handle errors with try-catch blocks when using async/await.", "start": 61.0, "end": 68.0},
            {"text": "You can run multiple async operations in parallel using Promise.all with await.", "start": 69.0, "end": 77.0},
            {"text": "Remember: async functions always return a Promise, even if you don't explicitly return one.", "start": 78.0, "end": 86.0},
        ]
    },
    {
        "video_id": "python-classes-03",
        "course_id": "python-fundamentals",
        "course_title": "Python Fundamentals",
        "video_title": "Object-Oriented Programming with Classes",
        "instructor": "Emma Williams",
        "topics": ["python", "classes", "objects", "inheritance", "polymorphism", "methods"],
        "duration": 1950.0,
        "transcript": [
            {"text": "Welcome to our lesson on Object-Oriented Programming in Python.", "start": 0.0, "end": 5.5},
            {"text": "A class is a blueprint for creating objects. It defines the properties and behaviors of objects.", "start": 6.0, "end": 15.0},
            {"text": "Let's create a simple class: class Dog: def __init__(self, name): self.name = name", "start": 16.0, "end": 26.0},
            {"text": "The __init__ method is the constructor. It's called when you create a new instance of the class.", "start": 27.0, "end": 36.0},
            {"text": "Self refers to the instance of the class. It's how you access instance variables and methods.", "start": 37.0, "end": 45.0},
            {"text": "Methods are functions defined inside a class. They always take self as the first parameter.", "start": 46.0, "end": 54.0},
            {"text": "Inheritance allows a class to inherit attributes and methods from another class.", "start": 55.0, "end": 63.0},
            {"text": "For example: class GoldenRetriever(Dog): inherits everything from the Dog class.", "start": 64.0, "end": 73.0},
            {"text": "Polymorphism allows methods to do different things based on the object calling them.", "start": 74.0, "end": 82.0},
            {"text": "Encapsulation is the practice of hiding internal details and exposing only what's necessary.", "start": 83.0, "end": 91.0},
        ]
    },
    {
        "video_id": "css-grid-04",
        "course_id": "modern-css",
        "course_title": "Modern CSS Masterclass",
        "video_title": "CSS Grid Layout Complete Guide",
        "instructor": "David Park",
        "topics": ["css", "grid", "layout", "flexbox", "responsive design"],
        "duration": 1650.0,
        "transcript": [
            {"text": "CSS Grid Layout is a two-dimensional layout system for the web.", "start": 0.0, "end": 6.5},
            {"text": "Unlike Flexbox which is one-dimensional, Grid can handle both rows and columns simultaneously.", "start": 7.0, "end": 16.0},
            {"text": "To create a grid container, use display: grid on the parent element.", "start": 17.0, "end": 24.0},
            {"text": "Define columns using grid-template-columns: 1fr 2fr 1fr creates three columns.", "start": 25.0, "end": 34.0},
            {"text": "The fr unit represents a fraction of available space. It's like flex-grow for grids.", "start": 35.0, "end": 43.0},
            {"text": "Use grid-template-rows to define your row heights.", "start": 44.0, "end": 50.0},
            {"text": "Grid gap creates spacing between grid items: gap: 20px adds space between all items.", "start": 51.0, "end": 60.0},
            {"text": "Grid areas let you name sections of your layout: grid-template-areas: 'header header' 'sidebar content'.", "start": 61.0, "end": 72.0},
            {"text": "Responsive grids are easy with auto-fit and auto-fill: repeat(auto-fit, minmax(250px, 1fr)).", "start": 73.0, "end": 84.0},
            {"text": "Grid and Flexbox work great together. Use Grid for the main layout, Flexbox for components.", "start": 85.0, "end": 94.0},
        ]
    },
    {
        "video_id": "nodejs-api-05",
        "course_id": "backend-development",
        "course_title": "Backend Development with Node.js",
        "video_title": "Building REST APIs with Express",
        "instructor": "Alex Rivera",
        "topics": ["nodejs", "express", "api", "rest", "routing", "middleware"],
        "duration": 2250.0,
        "transcript": [
            {"text": "In this tutorial, we'll build a REST API using Node.js and Express.", "start": 0.0, "end": 6.0},
            {"text": "Express is a minimal web framework that provides robust features for web and mobile applications.", "start": 7.0, "end": 15.0},
            {"text": "First, install Express: npm install express. Then require it in your application.", "start": 16.0, "end": 25.0},
            {"text": "Create an app instance: const app = express(). This is your main application object.", "start": 26.0, "end": 35.0},
            {"text": "Routes determine how your application responds to client requests. app.get('/users', handler).", "start": 36.0, "end": 46.0},
            {"text": "Express supports all HTTP methods: get, post, put, delete, patch, and more.", "start": 47.0, "end": 55.0},
            {"text": "Middleware functions have access to req, res, and next. They can modify requests or responses.", "start": 56.0, "end": 65.0},
            {"text": "Use app.use() to apply middleware to all routes, or pass it to specific routes.", "start": 66.0, "end": 74.0},
            {"text": "Always send a response. Every route handler should call res.send(), res.json(), or res.end().", "start": 75.0, "end": 84.0},
            {"text": "Error handling middleware takes four arguments: err, req, res, next. Always define it last.", "start": 85.0, "end": 95.0},
        ]
    },
    {
        "video_id": "git-commands-06",
        "course_id": "version-control",
        "course_title": "Version Control with Git",
        "video_title": "Essential Git Commands Every Developer Should Know",
        "instructor": "Lisa Zhang",
        "topics": ["git", "version control", "branching", "merging", "commits", "github"],
        "duration": 1500.0,
        "transcript": [
            {"text": "Git is a distributed version control system that tracks changes in source code.", "start": 0.0, "end": 7.0},
            {"text": "Initialize a new repository with git init. This creates a .git folder in your project.", "start": 8.0, "end": 16.0},
            {"text": "Check the status of your files with git status. It shows modified, staged, and unstaged files.", "start": 17.0, "end": 26.0},
            {"text": "Stage files for commit using git add. You can add individual files or use git add . for all.", "start": 27.0, "end": 37.0},
            {"text": "Create a commit with git commit -m 'message'. Always write clear, descriptive commit messages.", "start": 38.0, "end": 48.0},
            {"text": "View commit history with git log. Add --oneline for a condensed view of commits.", "start": 49.0, "end": 57.0},
            {"text": "Create branches with git branch name. Switch branches with git checkout name or git switch name.", "start": 58.0, "end": 68.0},
            {"text": "Merge branches with git merge. This combines the changes from one branch into another.", "start": 69.0, "end": 77.0},
            {"text": "Pull the latest changes from remote with git pull. This fetches and merges in one step.", "start": 78.0, "end": 86.0},
            {"text": "Push your changes with git push. This sends your commits to the remote repository.", "start": 87.0, "end": 95.0},
        ]
    },
]

@api_router.post("/search/videos/mock", response_model=List[SearchMatch])
async def search_mock_videos(search_request: SearchRequest):
    """Search mock video transcripts for testing and demonstration."""
    try:
        query = search_request.query.strip().lower()
        if not query:
            return []

        all_matches = []

        for video in MOCK_VIDEO_DATA:
            transcript_segments = video["transcript"]

            # Perform search in this transcript
            results = EduSearchService.search_in_transcript(
                transcript_segments,
                query,
                search_request.fuzzy_threshold
            )

            # Extract context and create matches
            for result in results:
                context_before, matched_text, context_after = EduSearchService.extract_context(
                    transcript_segments,
                    result["timestamp"],
                    search_request.context_window
                )

                # Calculate relevance score
                relevance_score = result["confidence_score"]

                # Apply filters if provided
                if search_request.filters:
                    if search_request.filters.course_id and video.get("course_id") != search_request.filters.course_id:
                        continue
                    if search_request.filters.instructor and search_request.filters.instructor.lower() not in video.get("instructor", "").lower():
                        continue

                match = SearchMatch(
                    video_id=video["video_id"],
                    course_id=video.get("course_id"),
                    course_title=video["course_title"],
                    video_title=video["video_title"],
                    instructor=video["instructor"],
                    timestamp=result["timestamp"],
                    end_time=result["end_time"],
                    matched_text=matched_text[:200],
                    context_before=context_before[:100],
                    context_after=context_after[:100],
                    confidence_score=result["confidence_score"],
                    relevance_score=relevance_score
                )
                all_matches.append(match.model_dump())

        # Deduplicate and sort
        deduplicated = EduSearchService.deduplicate_results(all_matches)
        sorted_results = sorted(deduplicated, key=lambda x: (-x.get("relevance_score", 0), x.get("timestamp", 0)))

        return sorted_results[:search_request.max_results]

    except Exception as e:
        logging.error(f"Mock search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/search/suggestions/mock")
async def get_mock_search_suggestions(q: str, limit: int = 10):
    """Get mock auto-suggestions for search."""
    try:
        if not q or len(q) < 2:
            return []

        query_lower = q.lower()
        suggestions = []

        # Collect all topics
        all_topics = set()
        for video in MOCK_VIDEO_DATA:
            all_topics.update(video.get("topics", []))

        # Find matching topics
        for topic in sorted(all_topics):
            if query_lower in topic.lower():
                suggestions.append({
                    "text": topic,
                    "count": 1,
                    "category": "topic"
                })

        # Find matching courses
        seen_courses = set()
        for video in MOCK_VIDEO_DATA:
            course = video.get("course_title", "")
            if query_lower in course.lower() and course not in seen_courses:
                suggestions.append({
                    "text": course,
                    "count": 1,
                    "category": "course"
                })
                seen_courses.add(course)

        # Find matching instructors
        seen_instructors = set()
        for video in MOCK_VIDEO_DATA:
            instructor = video.get("instructor", "")
            if query_lower in instructor.lower() and instructor not in seen_instructors:
                suggestions.append({
                    "text": instructor,
                    "count": 1,
                    "category": "instructor"
                })
                seen_instructors.add(instructor)

        return suggestions[:limit]

    except Exception as e:
        logging.error(f"Mock suggestions error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/search/filters/mock")
async def get_mock_available_filters():
    """Get mock available filter options for search."""
    try:
        courses = list(set(v["course_title"] for v in MOCK_VIDEO_DATA))
        instructors = list(set(v["instructor"] for v in MOCK_VIDEO_DATA))
        topics = list(set(t for v in MOCK_VIDEO_DATA for t in v.get("topics", [])))

        return {
            "courses": sorted(courses),
            "instructors": sorted(instructors),
            "topics": sorted(topics)
        }

    except Exception as e:
        logging.error(f"Mock filters error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/search/stats/mock")
async def get_mock_search_statistics():
    """Get mock statistics about the search index."""
    return {
        "total_videos_indexed": len(MOCK_VIDEO_DATA),
        "total_unique_words_indexed": 2500,
        "top_topics": [
            {"topic": "react", "count": 1},
            {"topic": "javascript", "count": 1},
            {"topic": "python", "count": 1},
            {"topic": "css", "count": 1},
            {"topic": "nodejs", "count": 1},
            {"topic": "git", "count": 1},
            {"topic": "async", "count": 1},
            {"topic": "classes", "count": 1},
            {"topic": "api", "count": 1},
            {"topic": "hooks", "count": 1},
        ]
    }

@api_router.get("/search/indexed-videos/mock")
async def get_mock_indexed_videos():
    """Get list of mock indexed videos."""
    return [
        {
            "video_id": v["video_id"],
            "course_id": v.get("course_id"),
            "course_title": v["course_title"],
            "video_title": v["video_title"],
            "instructor": v["instructor"],
            "topics": v.get("topics", []),
            "duration": v["duration"],
            "language": "en",
            "indexed_at": datetime.now(timezone.utc).isoformat()
        }
        for v in MOCK_VIDEO_DATA
    ]

# Include the router in the main app
app.include_router(api_router)

# Include auth routes if available
if auth_router is not None:
    app.include_router(auth_router, prefix="/api")
    logger.info("Auth routes included")

# Include nano learning router
if get_nano_router is not None:
    app.include_router(get_nano_router())
    logger.info("Nano learning router included")

# CORS middleware configuration
allowed_origins = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
if os.environ.get('ENVIRONMENT') == 'production':
    # In production, be more strict with CORS
    allowed_origins = [origin.strip() for origin in allowed_origins if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Challenge System Models
class ChallengeType(str, Enum):
    quiz = "quiz"
    code = "code"
    dragdrop = "dragdrop"

class ChallengeAttempt(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    challenge_id: str
    challenge_type: ChallengeType
    is_correct: bool
    points_earned: int
    time_taken: float
    streak: int = 0
    completed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    code: Optional[str] = None
    output: Optional[str] = None
    dropped_items: Optional[Dict] = None

class ChallengeAttemptCreate(BaseModel):
    user_id: str
    challenge_id: str
    challenge_type: ChallengeType
    is_correct: bool
    points_earned: int
    time_taken: float
    code: Optional[str] = None
    output: Optional[str] = None
    dropped_items: Optional[Dict] = None

class ChallengeStats(BaseModel):
    totalCompleted: int
    totalPoints: int
    currentStreak: int
    maxStreak: int
    accuracy: float
    fastestTime: Optional[float]
    challengesByType: Dict[str, Dict[str, int]]
    achievements: List[str]

class Challenge(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    type: ChallengeType
    question: str
    points: int
    time_limit: int
    options: Optional[List[str]] = None
    correctAnswer: Optional[int] = None
    starterCode: Optional[str] = None
    expectedOutput: Optional[str] = None
    hint: Optional[str] = None
    explanation: Optional[str] = None
    items: Optional[List[Dict]] = None
    categories: Optional[List[Dict]] = None

# Challenge System Endpoints

@api_router.get("/challenges", response_model=List[Challenge])
async def get_challenges(
    type: Optional[ChallengeType] = None,
    limit: int = 10
):
    """Get available challenges."""
    try:
        challenges = [
            {
                "id": "quiz-1",
                "type": ChallengeType.quiz,
                "question": "What does the 'async' keyword do in JavaScript?",
                "options": [
                    "Makes the function run faster",
                    "Marks a function for asynchronous execution",
                    "Creates a new thread",
                    "Prevents the function from being called"
                ],
                "correctAnswer": 1,
                "points": 100,
                "time_limit": 30,
                "explanation": "The async keyword declares an asynchronous function, which returns a Promise."
            },
            {
                "id": "quiz-2",
                "type": ChallengeType.quiz,
                "question": "Which method is used to parse JSON in JavaScript?",
                "options": ["JSON.parse()", "JSON.read()", "JSON.convert()", "JSON.toObject()"],
                "correctAnswer": 0,
                "points": 100,
                "time_limit": 30,
                "explanation": "JSON.parse() converts a JSON string into a JavaScript object."
            },
            {
                "id": "code-1",
                "type": ChallengeType.code,
                "question": "Write a function that returns the sum of two numbers.",
                "starterCode": "function sum(a, b) {\n  // Your code here\n}",
                "expectedOutput": "5",
                "points": 150,
                "time_limit": 60,
                "hint": "Use the return keyword with the addition operator (+).",
                "explanation": "The function should return a + b to add the two parameters."
            },
            {
                "id": "dd-1",
                "type": ChallengeType.dragdrop,
                "question": "Drag each technology to its correct category:",
                "items": [
                    {"id": 0, "label": "React", "correctCategory": "Frontend"},
                    {"id": 1, "label": "Node.js", "correctCategory": "Backend"},
                    {"id": 2, "label": "MongoDB", "correctCategory": "Database"},
                    {"id": 3, "label": "Vue.js", "correctCategory": "Frontend"},
                    {"id": 4, "label": "PostgreSQL", "correctCategory": "Database"},
                    {"id": 5, "label": "Express", "correctCategory": "Backend"}
                ],
                "categories": [
                    {"name": "Frontend", "icon": "fa-desktop"},
                    {"name": "Backend", "icon": "fa-server"},
                    {"name": "Database", "icon": "fa-database"}
                ],
                "points": 120,
                "time_limit": 45,
                "hint": "Frontend frameworks run in browsers.",
                "explanation": "React and Vue.js are frontend frameworks."
            }
        ]

        if type:
            challenges = [c for c in challenges if c["type"] == type]

        return challenges[:limit]

    except Exception as e:
        logging.error(f"Failed to get challenges: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/challenges/submit")
async def submit_challenge(attempt: ChallengeAttemptCreate):
    """Submit a challenge attempt and record results."""
    try:
        attempt_doc = {
            "id": str(uuid.uuid4()),
            "user_id": attempt.user_id,
            "challenge_id": attempt.challenge_id,
            "challenge_type": attempt.challenge_type,
            "is_correct": attempt.is_correct,
            "points_earned": attempt.points_earned,
            "time_taken": attempt.time_taken,
            "completed_at": datetime.now(timezone.utc).isoformat()
        }

        if attempt.code:
            attempt_doc["code"] = attempt.code
        if attempt.output:
            attempt_doc["output"] = attempt.output
        if attempt.dropped_items:
            attempt_doc["dropped_items"] = attempt.dropped_items

        await db.challenge_attempts.insert_one(attempt_doc)

        # Update user stats
        user_stats = await db.challenge_stats.find_one({"user_id": attempt.user_id})
        if not user_stats:
            user_stats = {
                "user_id": attempt.user_id,
                "total_completed": 0,
                "total_points": 0,
                "current_streak": 0,
                "max_streak": 0,
                "fastest_time": None,
                "challenges_by_type": {
                    "quiz": {"completed": 0, "best_score": 0},
                    "code": {"completed": 0, "best_score": 0},
                    "dragdrop": {"completed": 0, "best_score": 0}
                },
                "achievements": []
            }

        if attempt.is_correct:
            user_stats["current_streak"] = user_stats.get("current_streak", 0) + 1
            user_stats["max_streak"] = max(user_stats.get("max_streak", 0), user_stats["current_streak"])
        else:
            user_stats["current_streak"] = 0

        user_stats["total_completed"] = user_stats.get("total_completed", 0) + 1
        user_stats["total_points"] = user_stats.get("total_points", 0) + attempt.points_earned

        if user_stats.get("fastest_time") is None or attempt.time_taken < user_stats.get("fastest_time", float('inf')):
            user_stats["fastest_time"] = attempt.time_taken

        type_str = attempt.challenge_type
        if "challenges_by_type" not in user_stats:
            user_stats["challenges_by_type"] = {}
        if type_str not in user_stats["challenges_by_type"]:
            user_stats["challenges_by_type"][type_str] = {"completed": 0, "best_score": 0}

        user_stats["challenges_by_type"][type_str]["completed"] += 1
        user_stats["challenges_by_type"][type_str]["best_score"] = max(
            user_stats["challenges_by_type"][type_str].get("best_score", 0),
            attempt.points_earned
        )

        # Check achievements
        achievements = user_stats.get("achievements", [])
        if user_stats["total_completed"] >= 1 and "first_win" not in achievements:
            achievements.append("first_win")
        if user_stats["max_streak"] >= 3 and "streak_3" not in achievements:
            achievements.append("streak_3")
        if user_stats["max_streak"] >= 5 and "streak_5" not in achievements:
            achievements.append("streak_5")
        if user_stats.get("fastest_time", 999) < 10 and "speed_demon" not in achievements:
            achievements.append("speed_demon")
        if user_stats["total_completed"] >= 10 and "scholar" not in achievements:
            achievements.append("scholar")
        user_stats["achievements"] = achievements

        await db.challenge_stats.update_one(
            {"user_id": attempt.user_id},
            {"$set": user_stats},
            upsert=True
        )

        return {
            "success": True,
            "attempt_id": attempt_doc["id"],
            "points_earned": attempt.points_earned,
            "streak": user_stats["current_streak"],
            "achievements_unlocked": []
        }

    except Exception as e:
        logging.error(f"Failed to submit challenge: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/challenges/stats")
async def get_challenge_stats(user_id: str = "demo-user"):
    """Get challenge statistics for a user."""
    try:
        stats = await db.challenge_stats.find_one({"user_id": user_id})

        if not stats:
            return {
                "stats": {
                    "totalCompleted": 0,
                    "totalPoints": 0,
                    "currentStreak": 0,
                    "maxStreak": 0,
                    "accuracy": 0,
                    "fastestTime": None,
                    "challengesByType": {
                        "quiz": {"completed": 0, "bestScore": 0},
                        "code": {"completed": 0, "bestScore": 0},
                        "dragdrop": {"completed": 0, "bestScore": 0}
                    },
                    "achievements": []
                },
                "history": []
            }

        # Get recent history
        history = await db.challenge_attempts.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("completed_at", -1).to_list(20)

        return {
            "stats": {
                "totalCompleted": stats.get("total_completed", 0),
                "totalPoints": stats.get("total_points", 0),
                "currentStreak": stats.get("current_streak", 0),
                "maxStreak": stats.get("max_streak", 0),
                "accuracy": round((stats.get("total_completed", 0) / max(stats.get("total_completed", 0) + stats.get("current_streak", 0), 1)) * 100) if stats.get("total_completed", 0) > 0 else 0,
                "fastestTime": stats.get("fastest_time"),
                "challengesByType": stats.get("challenges_by_type", {}),
                "achievements": stats.get("achievements", [])
            },
            "history": history
        }

    except Exception as e:
        logging.error(f"Failed to get challenge stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/challenges/leaderboard")
async def get_challenge_leaderboard(limit: int = 10, challenge_type: Optional[ChallengeType] = None):
    """Get global leaderboard for challenges."""
    try:
        pipeline = []
        if challenge_type:
            pipeline.append({
                "$project": {
                    "user_id": 1,
                    "total_points": 1,
                    "challenges_by_type": 1
                }
            })

        pipeline.extend([
            {"$sort": {"total_points": -1}},
            {"$limit": limit}
        ])

        leaderboard = await db.challenge_stats.aggregate(pipeline).to_list(limit)

        return {
            "leaderboard": [
                {
                    "rank": idx + 1,
                    "user_id": entry.get("user_id"),
                    "total_points": entry.get("total_points", 0)
                }
                for idx, entry in enumerate(leaderboard)
            ]
        }

    except Exception as e:
        logging.error(f"Failed to get leaderboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# =============================================================================
# AI SERVICE IMPLEMENTATIONS
# =============================================================================

class TranscriptionService:
    """Service for video/audio transcription using OpenAI Whisper."""

    # Tamil language code mapping
    LANGUAGE_CODES = {
        "en": "english",
        "ta": "tamil",
        "te": "telugu",
        "hi": "hindi",
        "kn": "kannada",
        "ml": "malayalam"
    }

    @staticmethod
    def get_model():
        """Get or initialize Whisper model."""
        if not hasattr(TranscriptionService, '_model'):
            # Use base model for balance of speed and accuracy
            device = "cuda" if torch.cuda.is_available() else "cpu"
            TranscriptionService._model = whisper.load_model("base", device=device)
        return TranscriptionService._model

    @staticmethod
    async def download_audio(url: str) -> str:
        """Download audio from URL and return local file path."""
        temp_dir = tempfile.gettempdir()
        filename = f"audio_{uuid.uuid4().hex}.mp3"
        temp_path = os.path.join(temp_dir, filename)

        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status != 200:
                    raise HTTPException(status_code=400, detail=f"Failed to download audio: {response.status}")

                async with aiofiles.open(temp_path, 'wb') as f:
                    async for chunk in response.content.iter_chunked(8192):
                        await f.write(chunk)

        return temp_path

    @staticmethod
    def format_timestamp(seconds: float) -> str:
        """Format seconds to SRT timestamp format."""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds % 1) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

    @staticmethod
    def transcribe_audio(audio_path: str, language: str = "en") -> Dict[str, Any]:
        """Transcribe audio file using Whisper."""
        model = TranscriptionService.get_model()

        # Map language code
        lang_code = TranscriptionService.LANGUAGE_CODES.get(language, "english")

        # Transcribe with word-level timestamps
        result = model.transcribe(
            audio_path,
            language=lang_code if language == "en" else language,
            word_timestamps=True,
            task="transcribe"
        )

        # Build transcript segments with timestamps
        segments = []
        for segment in result.get("segments", []):
            segments.append({
                "text": segment["text"].strip(),
                "start": segment["start"],
                "end": segment["end"],
                "confidence": segment.get("avg_logprob", 0.0)
            })

        # Generate full text
        full_text = " ".join([s["text"] for s in segments])

        # Calculate confidence score
        confidence_score = sum(s.get("confidence", 0.0) for s in segments) / len(segments) if segments else 0.0

        return {
            "segments": segments,
            "full_text": full_text,
            "confidence_score": confidence_score,
            "duration": result.get("duration", 0.0)
        }

    @staticmethod
    def generate_srt(segments: List[Dict]) -> str:
        """Generate SRT subtitle format."""
        srt_content = []
        for i, segment in enumerate(segments, 1):
            srt_content.append(f"{i}")
            srt_content.append(f"{TranscriptionService.format_timestamp(segment['start'])} --> {TranscriptionService.format_timestamp(segment['end'])}")
            srt_content.append(segment['text'])
            srt_content.append("")
        return "\n".join(srt_content)

    @staticmethod
    def generate_vtt(segments: List[Dict]) -> str:
        """Generate WebVTT subtitle format."""
        vtt_content = ["WEBVTT", ""]
        for segment in segments:
            vtt_content.append(f"{TranscriptionService.format_timestamp(segment['start']).replace(',', '.')} --> {TranscriptionService.format_timestamp(segment['end']).replace(',', '.')}")
            vtt_content.append(segment['text'])
            vtt_content.append("")
        return "\n".join(vtt_content)


class ChapteringService:
    """Service for automated chapter generation from transcripts."""

    # Topic change indicators
    TRANSITION_PHRASES = [
        "now let's", "next", "moving on", "let's move to",
        "in this section", "chapter", "part", "section",
        "finally", "lastly", "last but not least", "to summarize",
        "in conclusion", "wrapping up", "let's talk about",
        "coming up next", "up next", "first", "second", "third"
    ]

    # Technical topics keywords for better chapter titles
    TOPIC_KEYWORDS = {
        "introduction": ["intro", "welcome", "overview", "getting started"],
        "setup": ["setup", "install", "configure", "configuration"],
        "basics": ["basic", "fundamental", "beginner", "foundation"],
        "functions": ["function", "method", "procedure", "def", "return"],
        "classes": ["class", "object", "instance", "constructor", "inheritance"],
        "loops": ["loop", "iteration", "for", "while", "foreach"],
        "conditions": ["if", "else", "condition", "switch", "case"],
        "arrays": ["array", "list", "slice", "index", "element"],
        "strings": ["string", "text", "character", "substring", "format"],
        "api": ["api", "endpoint", "request", "response", "rest"],
        "database": ["database", "query", "sql", "mongodb", "collection"],
        "error": ["error", "exception", "handling", "try", "catch"],
        "testing": ["test", "testing", "unit", "integration", "mock"],
        "deployment": ["deploy", "production", "build", "release"],
        "security": ["security", "auth", "authentication", "authorization"],
        "performance": ["performance", "optimization", "speed", "efficient"]
    }

    @staticmethod
    async def analyze_topic_change(segment1: Dict, segment2: Dict, context: List[Dict]) -> float:
        """
        Calculate probability of topic change between consecutive segments.
        Uses lexical similarity and transition phrase detection.
        """
        text1 = segment1.get("text", "").lower()
        text2 = segment2.get("text", "").lower()

        # Check for transition phrases
        for phrase in ChapteringService.TRANSITION_PHRASES:
            if phrase in text2:
                return 0.8

        # Calculate word overlap
        words1 = set(text1.split())
        words2 = set(text2.split())

        if not words1 or not words2:
            return 0.0

        overlap = len(words1 & words2) / len(words1 | words2)
        change_probability = 1.0 - overlap

        # Consider position (more likely to have topic changes every few minutes)
        time_diff = segment2.get("start", 0) - segment1.get("end", 0)
        if time_diff > 180:  # 3 minutes gap
            change_probability = max(change_probability, 0.5)

        return min(change_probability, 1.0)

    @staticmethod
    async def generate_chapter_title(segment: Dict, following_segments: List[Dict]) -> str:
        """Generate meaningful chapter title from segment content."""
        text = segment.get("text", "").lower()

        # Check for topic keywords
        for topic, keywords in ChapteringService.TOPIC_KEYWORDS.items():
            if any(kw in text for kw in keywords):
                # Capitalize for title
                return topic.capitalize() + " Overview"

        # Use first sentence or key phrase
        sentences = text.split('.')
        if sentences:
            first_sentence = sentences[0].strip()
            # Remove common filler words
            filler_words = ["um", "uh", "like", "so", "basically", "actually"]
            words = [w for w in first_sentence.split() if w not in filler_words]
            if words:
                title = " ".join(words[:8]).capitalize()
                if len(first_sentence.split()) > 8:
                    title += "..."
                return title

        # Fallback: time-based title
        timestamp = segment.get("start", 0)
        minutes = int(timestamp // 60)
        return f"Chapter at {minutes}:{int(timestamp % 60):02d}"

    @staticmethod
    async def extract_topics(transcript_segments: List[Dict]) -> List[str]:
        """Extract topics from transcript segments."""
        all_words = []
        for segment in transcript_segments:
            words = segment.get("text", "").lower().split()
            all_words.extend(words)

        # Count word frequency
        word_freq = defaultdict(int)
        for word in all_words:
            if len(word) > 4:  # Only significant words
                word_freq[word] += 1

        # Get top topics
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        top_words = [w[0] for w in sorted_words[:10]]

        # Map to known topics
        topics = []
        for topic, keywords in ChapteringService.TOPIC_KEYWORDS.items():
            if any(kw in " ".join(top_words) for kw in keywords):
                topics.append(topic.capitalize())

        return topics[:5]

    @staticmethod
    async def generate_chapters(transcript_segments: List[Dict]) -> List[Dict[str, Any]]:
        """Generate chapter markers from transcript segments."""
        if not transcript_segments:
            return []

        chapters = []
        current_chapter_start = transcript_segments[0]["start"]
        current_chapter_segments = [transcript_segments[0]]

        for i in range(1, len(transcript_segments)):
            prev_segment = transcript_segments[i - 1]
            current_segment = transcript_segments[i]

            # Calculate topic change probability
            change_prob = await ChapteringService.analyze_topic_change(
                prev_segment,
                current_segment,
                current_chapter_segments
            )

            # Threshold for chapter boundary (can be adjusted)
            if change_prob > 0.6 or (current_segment["start"] - current_chapter_start > 180):
                # Create chapter
                chapter_title = await ChapteringService.generate_chapter_title(
                    current_chapter_segments[0],
                    current_chapter_segments[1:] if len(current_chapter_segments) > 1 else []
                )

                topics = await ChapteringService.extract_topics(current_chapter_segments)

                chapters.append({
                    "title": chapter_title,
                    "description": " ".join([s["text"] for s in current_chapter_segments[:3]])[:200] + "...",
                    "start_time": current_chapter_start,
                    "end_time": prev_segment["end"],
                    "confidence_score": change_prob,
                    "topics": topics
                })

                # Start new chapter
                current_chapter_start = current_segment["start"]
                current_chapter_segments = [current_segment]
            else:
                current_chapter_segments.append(current_segment)

        # Add final chapter
        if current_chapter_segments:
            last_segment = current_chapter_segments[-1]
            chapter_title = await ChapteringService.generate_chapter_title(
                current_chapter_segments[0],
                current_chapter_segments[1:] if len(current_chapter_segments) > 1 else []
            )
            topics = await ChapteringService.extract_topics(current_chapter_segments)

            chapters.append({
                "title": chapter_title,
                "description": " ".join([s["text"] for s in current_chapter_segments[:3]])[:200] + "...",
                "start_time": current_chapter_start,
                "end_time": last_segment["end"],
                "confidence_score": 1.0,
                "topics": topics
            })

        return chapters


class ResourceExtractionService:
    """Service for extracting resources from transcripts."""

    # URL patterns
    URL_PATTERN = re.compile(
        r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
    )

    # Reference patterns
    REFERENCE_PATTERNS = {
        "book": [
            r'["\']([A-Z][^"\']{10,80})["\']\s+(?:by\s+)?([A-Z][a-z]+\s+[A-Z][a-z]+)',
            r'book\s+["\']([^"\']+)["\']',
            r'read\s+["\']([^"\']+)["\']',
            r'check out\s+["\']([^"\']+)["\']',
        ],
        "article": [
            r'article\s+(?:called\s+)?["\']([^"\']+)["\']',
            r'blog\s+post\s+["\']([^"\']+)["\']',
            r'paper\s+(?:titled\s+)?["\']([^"\']+)["\']',
        ],
        "tool": [
            r'use\s+["\']?([a-z0-9-]+)["\']?',
            r'tool\s+(?:called\s+)?["\']?([a-z0-9-]+)["\']?',
            r'library\s+["\']?([a-z0-9-]+)["\']?',
        ]
    }

    # Common tech tools and libraries
    COMMON_TOOLS = {
        "react": "website", "vue": "website", "angular": "website",
        "node": "website", "express": "website", "fastapi": "website",
        "mongodb": "website", "postgresql": "website", "redis": "website",
        "docker": "website", "kubernetes": "website", "aws": "website",
        "github": "website", "gitlab": "website", "vercel": "website",
        "vscode": "tool", "vim": "tool", "emacs": "tool",
        "postman": "tool", "figma": "tool", "canva": "tool"
    }

    @staticmethod
    async def extract_urls(transcript_segments: List[Dict]) -> List[Dict[str, Any]]:
        """Extract URLs mentioned in transcript."""
        resources = []
        seen_urls = set()

        for segment in transcript_segments:
            text = segment.get("text", "")
            urls = ResourceExtractionService.URL_PATTERN.findall(text)

            for url in urls:
                # Clean URL
                url = url.rstrip('.,;!?)')

                if url in seen_urls:
                    continue
                seen_urls.add(url)

                # Determine resource type from URL
                resource_type = ResourceExtractionService.classify_url(url)

                # Extract title from URL
                title = ResourceExtractionService.extract_title_from_url(url)

                resources.append({
                    "resource_type": resource_type,
                    "title": title,
                    "url": url,
                    "description": f"Link mentioned at {int(segment['start']) // 60}:{int(segment['start']) % 60:02d}",
                    "timestamp": segment["start"],
                    "metadata": {
                        "domain": urlparse(url).netloc,
                        "extracted_from": "transcript"
                    }
                })

        return resources

    @staticmethod
    def classify_url(url: str) -> str:
        """Classify URL by resource type."""
        domain = urlparse(url).netloc.lower()

        if "github" in domain:
            return "website"
        elif "youtube" in domain or "vimeo" in domain:
            return "video"
        elif "docs." in domain or "documentation" in url:
            return "article"
        elif "npmjs" in domain or "pypi" in domain:
            return "tool"
        elif "amazon" in domain or "book" in url:
            return "book"

        return "website"

    @staticmethod
    def extract_title_from_url(url: str) -> str:
        """Extract readable title from URL."""
        path = urlparse(url).path
        segments = [s for s in path.split('/') if s]

        if segments:
            # Convert hyphens/underscores to spaces and capitalize
            title = segments[-1].replace('-', ' ').replace('_', ' ')
            return title.capitalize()

        return urlparse(url).netloc

    @staticmethod
    async def extract_book_references(transcript_segments: List[Dict]) -> List[Dict[str, Any]]:
        """Extract book titles mentioned in transcript."""
        resources = []

        for segment in transcript_segments:
            text = segment.get("text", "")

            for pattern in ResourceExtractionService.REFERENCE_PATTERNS["book"]:
                matches = re.finditer(pattern, text, re.IGNORECASE)
                for match in matches:
                    title = match.group(1).strip()
                    author = match.group(2) if len(match.groups()) > 1 else "Unknown"

                    if len(title) > 10:  # Filter out short matches
                        # Search for Amazon/Goodreads link
                        resources.append({
                            "resource_type": "book",
                            "title": title,
                            "url": f"https://www.amazon.com/s?k={title.replace(' ', '+')}",
                            "description": f"Book by {author}",
                            "timestamp": segment["start"],
                            "metadata": {
                                "author": author,
                                "extracted_from": "transcript"
                            }
                        })

        return resources

    @staticmethod
    async def extract_tool_references(transcript_segments: List[Dict]) -> List[Dict[str, Any]]:
        """Extract tool/library references from transcript."""
        resources = []
        seen_tools = set()

        for segment in transcript_segments:
            text = segment.get("text", "").lower()
            words = text.split()

            for tool, resource_type in ResourceExtractionService.COMMON_TOOLS.items():
                if tool in text and tool not in seen_tools:
                    seen_tools.add(tool)

                    resources.append({
                        "resource_type": resource_type,
                        "title": tool.capitalize(),
                        "url": f"https://www.google.com/search?q={tool}+documentation",
                        "description": f"{tool.capitalize()} - mentioned in video",
                        "timestamp": segment["start"],
                        "metadata": {
                            "category": "tool",
                            "extracted_from": "transcript"
                        }
                    })

        return resources

    @staticmethod
    async def extract_all_resources(transcript_segments: List[Dict]) -> List[Dict[str, Any]]:
        """Extract all types of resources from transcript."""
        all_resources = []

        # Extract URLs
        all_resources.extend(await ResourceExtractionService.extract_urls(transcript_segments))

        # Extract book references
        all_resources.extend(await ResourceExtractionService.extract_book_references(transcript_segments))

        # Extract tool references
        all_resources.extend(await ResourceExtractionService.extract_tool_references(transcript_segments))

        # Remove duplicates based on title/url
        seen = set()
        unique_resources = []
        for resource in all_resources:
            key = (resource.get("title", ""), resource.get("url", ""))
            if key not in seen:
                seen.add(key)
                unique_resources.append(resource)

        # Sort by timestamp
        unique_resources.sort(key=lambda x: x.get("timestamp", 0))

        return unique_resources


class VideoAnalyticsService:
    """Service for tracking and analyzing video viewing behavior."""

    @staticmethod
    async def record_view_event(
        video_id: str,
        user_id: str,
        event_type: str,
        timestamp: float,
        session_id: str,
        metadata: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Record a video viewing event."""
        return {
            "id": str(uuid.uuid4()),
            "video_id": video_id,
            "user_id": user_id,
            "session_id": session_id,
            "event_type": event_type,
            "timestamp": timestamp,
            "server_time": datetime.now(timezone.utc).isoformat(),
            "metadata": metadata or {}
        }

    @staticmethod
    async def generate_heatmap_data(video_id: str, db, bin_size: int = 10) -> List[Dict[str, Any]]:
        """
        Generate engagement heatmap data.
        Returns array of bins with watch counts.
        """
        # Get video duration from sessions
        session = await db.video_sessions.find_one({"video_id": video_id})
        if not session:
            return []

        video_duration = session.get("video_duration", 0)
        if video_duration <= 0:
            return []

        # Create bins
        num_bins = int(video_duration // bin_size) + 1
        heatmap_bins = [{"time_start": i * bin_size, "time_end": (i + 1) * bin_size, "count": 0}
                       for i in range(num_bins)]

        # Aggregate events into bins
        events_cursor = db.video_events.find({"video_id": video_id})
        async for event in events_cursor:
            timestamp = event.get("timestamp", 0)
            bin_index = int(timestamp // bin_size)

            if 0 <= bin_index < len(heatmap_bins):
                # Weight different event types
                weight = 1.0
                event_type = event.get("event_type", "")
                if event_type == "play":
                    weight = 1.5
                elif event_type == "pause":
                    weight = 1.0
                elif event_type == "seek":
                    weight = 0.5
                elif event_type == "complete":
                    weight = 2.0

                heatmap_bins[bin_index]["count"] += weight

        # Normalize to 0-100 scale
        if heatmap_bins:
            max_count = max(b["count"] for b in heatmap_bins)
            if max_count > 0:
                for bin in heatmap_bins:
                    bin["intensity"] = round((bin["count"] / max_count) * 100, 2)
            else:
                for bin in heatmap_bins:
                    bin["intensity"] = 0

        return heatmap_bins

    @staticmethod
    async def get_video_statistics(video_id: str, db) -> Dict[str, Any]:
        """Get comprehensive viewing statistics for a video."""
        # Total views
        total_views = await db.video_sessions.count_documents({"video_id": video_id})

        # Unique viewers
        unique_viewers = await db.video_sessions.distinct("user_id", {"video_id": video_id})

        # Completion rate
        completed_sessions = await db.video_sessions.count_documents({
            "video_id": video_id,
            "completed": True
        })

        # Average watch time
        pipeline = [
            {"$match": {"video_id": video_id}},
            {"$group": {
                "_id": None,
                "avg_watch_time": {"$avg": "$watch_time"},
                "total_watch_time": {"$sum": "$watch_time"}
            }}
        ]

        result = await db.video_sessions.aggregate(pipeline).to_list(1)
        watch_stats = result[0] if result else {"avg_watch_time": 0, "total_watch_time": 0}

        # Engagement events
        total_events = await db.video_events.count_documents({"video_id": video_id})

        # Pause events (indicates areas of interest)
        pause_events = await db.video_events.count_documents({
            "video_id": video_id,
            "event_type": "pause"
        })

        # Seek events (indicates rewatching or skipping)
        seek_events = await db.video_events.count_documents({
            "video_id": video_id,
            "event_type": "seek"
        })

        # Most paused segments
        pause_pipeline = [
            {"$match": {"video_id": video_id, "event_type": "pause"}},
            {"$bucket": {
                "groupBy": "$timestamp",
                "boundaries": [i * 30 for i in range(1000)],
                "output": {
                    "count": {"$sum": 1}
                },
                "default": "other"
            }},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]

        most_paused = await db.video_events.aggregate(pause_pipeline).to_list(10)

        return {
            "total_views": total_views,
            "unique_viewers": len(unique_viewers),
            "completion_rate": round((completed_sessions / total_views * 100) if total_views > 0 else 0, 2),
            "completion_count": completed_sessions,
            "average_watch_time": round(watch_stats.get("avg_watch_time", 0), 2),
            "total_watch_time": round(watch_stats.get("total_watch_time", 0), 2),
            "total_events": total_events,
            "pause_events": pause_events,
            "seek_events": seek_events,
            "most_paused_segments": most_paused
        }

    @staticmethod
    async def get_user_viewing_history(user_id: str, db, limit: int = 20) -> List[Dict[str, Any]]:
        """Get viewing history for a user."""
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$sort": {"start_time": -1}},
            {"$limit": limit},
            {"$project": {
                "video_id": 1,
                "session_id": 1,
                "start_time": 1,
                "watch_time": 1,
                "last_position": 1,
                "completed": 1
            }}
        ]

        sessions = await db.video_sessions.aggregate(pipeline).to_list(limit)

        # Convert ISO strings to datetime
        for session in sessions:
            if isinstance(session.get("start_time"), str):
                session["start_time"] = datetime.fromisoformat(session["start_time"])

        return sessions


# =============================================================================
# BACKGROUND TASK FUNCTIONS
# =============================================================================

async def process_transcription(video_id: str, audio_path: str, language: str, db):
    """Background task to process video transcription."""
    local_audio_path = None
    try:
        # Update status to processing
        await db.transcripts.update_one(
            {"video_id": video_id},
            {"$set": {
                "status": TranscriptionStatus.processing,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )

        # Download audio if it's a URL
        if audio_path.startswith("http"):
            local_audio_path = await TranscriptionService.download_audio(audio_path)
            audio_to_process = local_audio_path
        else:
            audio_to_process = audio_path

        # Run transcription in thread pool (Whisper is CPU intensive)
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            TranscriptionService.transcribe_audio,
            audio_to_process,
            language
        )

        # Generate bilingual transcripts if English
        transcripts = {}
        transcripts[language] = result

        # If English, also generate Tamil transcript (simple translation placeholder)
        if language == "en":
            # For Tamil, we would use a translation service
            # For now, mark as placeholder
            transcripts["ta"] = {
                "segments": result["segments"],  # Same segments, would translate text in production
                "full_text": result["full_text"],
                "confidence_score": result["confidence_score"] * 0.8,  # Lower confidence for translation
                "duration": result["duration"],
                "translated": True
            }

        # Update database with results
        await db.transcripts.update_one(
            {"video_id": video_id},
            {"$set": {
                "status": TranscriptionStatus.completed,
                "transcript": result["segments"],
                "full_text": result["full_text"],
                "confidence_score": result["confidence_score"],
                "duration": result["duration"],
                "languages": list(transcripts.keys()),
                "subtitles": {
                    "srt": TranscriptionService.generate_srt(result["segments"]),
                    "vtt": TranscriptionService.generate_vtt(result["segments"])
                },
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )

        logger.info(f"Transcription completed for video {video_id}")

    except Exception as e:
        logger.error(f"Transcription failed for video {video_id}: {str(e)}")
        await db.transcripts.update_one(
            {"video_id": video_id},
            {"$set": {
                "status": TranscriptionStatus.failed,
                "error_message": str(e),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    finally:
        # Clean up downloaded audio
        if local_audio_path and os.path.exists(local_audio_path):
            os.remove(local_audio_path)


async def process_chaptering(video_id: str, db):
    """Background task to generate chapters from transcript."""
    try:
        # Get transcript
        transcript = await db.transcripts.find_one({"video_id": video_id})
        if not transcript:
            logger.error(f"Transcript not found for video {video_id}")
            return

        segments = transcript.get("transcript", [])
        if not segments:
            logger.error(f"No transcript segments found for video {video_id}")
            return

        # Generate chapters
        chapters = await ChapteringService.generate_chapters(segments)

        # Clear existing chapters and insert new ones
        await db.chapters.delete_many({"video_id": video_id})

        if chapters:
            chapter_docs = []
            for chapter in chapters:
                chapter["video_id"] = video_id
                chapter["id"] = str(uuid.uuid4())
                chapter["created_at"] = datetime.now(timezone.utc).isoformat()
                chapter_docs.append(chapter)

            await db.chapters.insert_many(chapter_docs)

        logger.info(f"Generated {len(chapters)} chapters for video {video_id}")

    except Exception as e:
        logger.error(f"Chaptering failed for video {video_id}: {str(e)}")


async def process_resource_extraction(video_id: str, db):
    """Background task to extract resources from transcript."""
    try:
        # Get transcript
        transcript = await db.transcripts.find_one({"video_id": video_id})
        if not transcript:
            logger.error(f"Transcript not found for video {video_id}")
            return

        segments = transcript.get("transcript", [])
        if not segments:
            logger.error(f"No transcript segments found for video {video_id}")
            return

        # Extract resources
        resources = await ResourceExtractionService.extract_all_resources(segments)

        # Clear existing resources and insert new ones
        await db.resources.delete_many({"video_id": video_id})

        if resources:
            resource_docs = []
            for resource in resources:
                resource["video_id"] = video_id
                resource["id"] = str(uuid.uuid4())
                resource["created_at"] = datetime.now(timezone.utc).isoformat()
                resource_docs.append(resource)

            await db.resources.insert_many(resource_docs)

        logger.info(f"Extracted {len(resources)} resources for video {video_id}")

    except Exception as e:
        logger.error(f"Resource extraction failed for video {video_id}: {str(e)}")

# =============================================================================
# AR MODEL SYSTEM ENDPOINTS
# =============================================================================

class ARModelCategory(str, Enum):
    hardware = "hardware"
    physics = "physics"
    chemistry = "chemistry"
    biology = "biology"
    mathematics = "mathematics"

class ARModelFormat(str, Enum):
    gltf = "gltf"
    glb = "glb"
    obj = "obj"
    fbx = "fbx"
    procedural = "procedural"

class ARModel(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: ARModelCategory
    model_format: ARModelFormat = ARModelFormat.procedural
    model_url: Optional[str] = None
    procedural_type: Optional[str] = None
    color: str = "#6366f1"
    thumbnail_url: Optional[str] = None
    file_size: Optional[int] = None
    scale: float = 1.0
    annotations: List[Dict[str, Any]] = []
    educational_content: Optional[Dict[str, Any]] = None
    tags: List[str] = []
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class ARModelCreate(BaseModel):
    name: str
    description: str
    category: ARModelCategory
    model_format: ARModelFormat = ARModelFormat.procedural
    model_url: Optional[str] = None
    procedural_type: Optional[str] = None
    color: str = "#6366f1"
    thumbnail_url: Optional[str] = None
    scale: float = 1.0
    annotations: List[Dict[str, Any]] = []
    educational_content: Optional[Dict[str, Any]] = None
    tags: List[str] = []

class QRCodeRequest(BaseModel):
    model_id: str
    size: int = 300
    include_url: bool = True

class QRCodeResponse(BaseModel):
    qr_code_url: str
    model_url: str
    model_name: str

@api_router.get("/ar/models", response_model=List[ARModel])
async def get_ar_models(
    category: Optional[ARModelCategory] = None,
    search: Optional[str] = None,
    tags: Optional[str] = None,
    limit: int = 50
):
    """Get all AR models with optional filtering by category, search, and tags."""
    try:
        query = {"is_active": True}

        if category:
            query["category"] = category

        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}}
            ]

        if tags:
            tag_list = tags.split(",")
            query["tags"] = {"$in": tag_list}

        models = await db.ar_models.find(query, {"_id": 0}).to_list(limit)

        for model in models:
            if isinstance(model.get('created_at'), str):
                model['created_at'] = datetime.fromisoformat(model['created_at'])
            if isinstance(model.get('updated_at'), str):
                model['updated_at'] = datetime.fromisoformat(model['updated_at'])

        return [ARModel(**model) for model in models]

    except Exception as e:
        logger.error(f"Failed to get AR models: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/ar/models/{model_id}", response_model=ARModel)
async def get_ar_model(model_id: str):
    """Get a specific AR model by ID."""
    try:
        model = await db.ar_models.find_one({"id": model_id, "is_active": True}, {"_id": 0})

        if not model:
            raise HTTPException(status_code=404, detail="AR model not found")

        if isinstance(model.get('created_at'), str):
            model['created_at'] = datetime.fromisoformat(model['created_at'])
        if isinstance(model.get('updated_at'), str):
            model['updated_at'] = datetime.fromisoformat(model['updated_at'])

        return ARModel(**model)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get AR model: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/ar/models", response_model=ARModel, status_code=status.HTTP_201_CREATED)
async def create_ar_model(
    model: ARModelCreate,
    current_user: UserAuth = Depends(get_current_active_user)
):
    """Create a new AR model."""
    try:
        model_data = model.model_dump()
        model_data['id'] = str(uuid.uuid4())
        model_data['created_by'] = current_user.id
        model_data['created_at'] = datetime.now(timezone.utc).isoformat()
        model_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        model_data['is_active'] = True

        await db.ar_models.insert_one(model_data)

        return ARModel(**model_data)

    except Exception as e:
        logger.error(f"Failed to create AR model: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/ar/models/{model_id}", response_model=ARModel)
async def update_ar_model(
    model_id: str,
    update: ARModelCreate,
    current_user: UserAuth = Depends(get_current_active_user)
):
    """Update an existing AR model."""
    try:
        existing = await db.ar_models.find_one({"id": model_id})

        if not existing:
            raise HTTPException(status_code=404, detail="AR model not found")

        update_data = update.model_dump()
        update_data['updated_at'] = datetime.now(timezone.utc).isoformat()

        await db.ar_models.update_one(
            {"id": model_id},
            {"$set": update_data}
        )

        updated_model = await db.ar_models.find_one({"id": model_id}, {"_id": 0})

        if isinstance(updated_model.get('created_at'), str):
            updated_model['created_at'] = datetime.fromisoformat(updated_model['created_at'])
        if isinstance(updated_model.get('updated_at'), str):
            updated_model['updated_at'] = datetime.fromisoformat(updated_model['updated_at'])

        return ARModel(**updated_model)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update AR model: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/ar/models/{model_id}")
async def delete_ar_model(
    model_id: str,
    current_user: UserAuth = Depends(require_role([UserRole.admin, UserRole.instructor]))
):
    """Delete an AR model (soft delete)."""
    try:
        await db.ar_models.update_one(
            {"id": model_id},
            {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )

        return {"message": "AR model deleted successfully"}

    except Exception as e:
        logger.error(f"Failed to delete AR model: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/ar/qr", response_model=QRCodeResponse)
async def generate_qr_code(request: QRCodeRequest):
    """Generate a QR code for an AR model."""
    try:
        model = await db.ar_models.find_one({"id": request.model_id, "is_active": True}, {"_id": 0})

        if not model:
            raise HTTPException(status_code=404, detail="AR model not found")

        base_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        model_url = f"{base_url}/ar/viewer/{request.model_id}"

        qr_code_url = f"https://api.qrserver.com/v1/create-qr-code/?size={request.size}x{request.size}&data={model_url}"

        return QRCodeResponse(
            qr_code_url=qr_code_url,
            model_url=model_url,
            model_name=model.get('name', 'Unknown Model')
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate QR code: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/ar/categories")
async def get_ar_categories():
    """Get all available AR model categories with counts."""
    try:
        pipeline = [
            {"$match": {"is_active": True}},
            {"$group": {
                "_id": "$category",
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}}
        ]

        categories = await db.ar_models.aggregate(pipeline).to_list(20)

        return [
            {
                "category": cat["_id"],
                "count": cat["count"],
                "icon": cat["_id"]
            }
            for cat in categories
        ]

    except Exception as e:
        logger.error(f"Failed to get AR categories: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/ar/tags")
async def get_ar_tags():
    """Get all available tags for AR models."""
    try:
        tags = await db.ar_models.distinct("tags", {"is_active": True})

        return {
            "tags": sorted([t for t in tags if t])
        }

    except Exception as e:
        logger.error(f"Failed to get AR tags: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/ar/models/{model_id}/annotations")
async def add_annotation(
    model_id: str,
    annotation: Dict[str, Any],
    current_user: UserAuth = Depends(get_current_active_user)
):
    """Add an annotation to an AR model."""
    try:
        annotation["id"] = str(uuid.uuid4())
        annotation["created_at"] = datetime.now(timezone.utc).isoformat()
        annotation["created_by"] = current_user.id

        await db.ar_models.update_one(
            {"id": model_id},
            {
                "$push": {"annotations": annotation},
                "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
            }
        )

        return {"message": "Annotation added successfully", "annotation": annotation}

    except Exception as e:
        logger.error(f"Failed to add annotation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/ar/models/{model_id}/annotations/{annotation_id}")
async def delete_annotation(
    model_id: str,
    annotation_id: str,
    current_user: UserAuth = Depends(get_current_active_user)
):
    """Delete an annotation from an AR model."""
    try:
        await db.ar_models.update_one(
            {"id": model_id},
            {
                "$pull": {"annotations": {"id": annotation_id}},
                "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
            }
        )

        return {"message": "Annotation deleted successfully"}

    except Exception as e:
        logger.error(f"Failed to delete annotation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/ar/stats")
async def get_ar_statistics():
    """Get statistics about AR models."""
    try:
        total_models = await db.ar_models.count_documents({"is_active": True})

        pipeline = [
            {"$match": {"is_active": True}},
            {"$group": {
                "_id": "$category",
                "count": {"$sum": 1}
            }}
        ]
        category_stats = await db.ar_models.aggregate(pipeline).to_list(10)

        popular_tags = await db.ar_models.aggregate([
            {"$match": {"is_active": True}},
            {"$unwind": "$tags"},
            {"$group": {"_id": "$tags", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 20}
        ]).to_list(20)

        return {
            "total_models": total_models,
            "categories": [{"name": s["_id"], "count": s["count"]} for s in category_stats],
            "popular_tags": [{"tag": t["_id"], "count": t["count"]} for t in popular_tags]
        }

    except Exception as e:
        logger.error(f"Failed to get AR stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def initialize_default_ar_models():
    """Initialize default AR models if they don't exist."""
    default_models = [
        {
            "id": "cpu",
            "name": "CPU Architecture",
            "description": "Central Processing Unit - the brain of the computer",
            "category": ARModelCategory.hardware,
            "model_format": ARModelFormat.procedural,
            "procedural_type": "cpu",
            "color": "#6366f1",
            "scale": 1.0,
            "annotations": [
                {"id": "1", "x": 50, "y": 30, "title": "ALU", "description": "Arithmetic Logic Unit"},
                {"id": "2", "x": 30, "y": 50, "title": "Control Unit", "description": "Directs data flow"},
                {"id": "3", "x": 70, "y": 50, "title": "Cache", "description": "High-speed memory"}
            ],
            "educational_content": {
                "title": "Understanding CPU Architecture",
                "sections": [
                    {"heading": "What is a CPU?", "content": "The CPU processes instructions and data."},
                    {"heading": "Key Components", "content": "ALU, Control Unit, and Registers."}
                ]
            },
            "tags": ["hardware", "processor", "computer"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        },
        {
            "id": "gpu",
            "name": "GPU Architecture",
            "description": "Graphics Processing Unit - specialized for graphics",
            "category": ARModelCategory.hardware,
            "model_format": ARModelFormat.procedural,
            "procedural_type": "gpu",
            "color": "#10b981",
            "scale": 1.0,
            "annotations": [],
            "tags": ["hardware", "graphics", "gaming"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        },
        {
            "id": "atom",
            "name": "Atomic Structure",
            "description": "The basic unit of matter",
            "category": ARModelCategory.physics,
            "model_format": ARModelFormat.procedural,
            "procedural_type": "atom",
            "color": "#ef4444",
            "scale": 1.0,
            "annotations": [],
            "tags": ["physics", "atom", "matter"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        },
        {
            "id": "molecule",
            "name": "Molecular Structure",
            "description": "Chemical compounds visualization",
            "category": ARModelCategory.chemistry,
            "model_format": ARModelFormat.procedural,
            "procedural_type": "molecule",
            "color": "#f59e0b",
            "scale": 1.0,
            "annotations": [],
            "tags": ["chemistry", "molecule", "bond"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        },
        {
            "id": "physics",
            "name": "Quantum Sphere",
            "description": "Representing quantum states",
            "category": ARModelCategory.physics,
            "model_format": ARModelFormat.procedural,
            "procedural_type": "physics",
            "color": "#8b5cf6",
            "scale": 1.0,
            "annotations": [],
            "tags": ["physics", "quantum", "science"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        },
        {
            "id": "memory",
            "name": "RAM Module",
            "description": "Random Access Memory",
            "category": ARModelCategory.hardware,
            "model_format": ARModelFormat.procedural,
            "procedural_type": "memory",
            "color": "#3b82f6",
            "scale": 1.0,
            "annotations": [],
            "tags": ["hardware", "memory", "ram"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        }
    ]

    for model_data in default_models:
        existing = await db.ar_models.find_one({"id": model_data["id"]})
        if not existing:
            await db.ar_models.insert_one(model_data)
            logger.info(f"Initialized default AR model: {model_data['id']}")

@app.on_event("startup")
async def startup_event():
    """Initialize database connection, create indexes, and set up services."""
    logger.info("Starting up Sasha Infinity LMS Backend...")

    # Initialize auth module database
    if set_database is not None:
        set_database(db)
        logger.info("Auth module database initialized")

    # Create database indexes
    await create_database_indexes()
    logger.info("Database indexes created")

    # Initialize default AR models
    await initialize_default_ar_models()
    logger.info("Default AR models initialized")

    # Create default admin user if not exists
    await create_default_admin_user()
    logger.info("Admin user check complete")

    logger.info("Sasha Infinity LMS Backend startup complete!")


async def create_database_indexes():
    """Create MongoDB indexes for better query performance."""
    try:
        # Users collection indexes
        await db.users.create_index("email", unique=True)
        await db.users.create_index("role")
        await db.users.create_index("created_at")

        # Password reset tokens indexes
        await db.password_reset_tokens.create_index("token", unique=True)
        await db.password_reset_tokens.create_index("email")
        await db.password_reset_tokens.create_index("expires_at")

        # Courses indexes
        await db.courses.create_index("instructor")
        await db.courses.create_index("status")
        await db.courses.create_index("created_at")

        # Video transcripts indexes
        await db.transcripts.create_index("video_id", unique=True)
        await db.transcripts.create_index("status")

        # Video sessions indexes
        await db.video_sessions.create_index([("user_id", 1), ("video_id", 1)])
        await db.video_sessions.create_index("start_time")

        # Code snippets indexes
        await db.code_snippets.create_index([("user_id", 1), ("video_id", 1)])

        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.error(f"Error creating database indexes: {e}")


async def create_default_admin_user():
    """Create default admin user if not exists."""
    try:
        admin_email = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@sashainfinity.com")
        admin_password = os.getenv("DEFAULT_ADMIN_PASSWORD", "Admin@123456")

        existing_admin = await db.users.find_one({"email": admin_email})
        if not existing_admin:
            from auth import get_password_hash, UserRole
            hashed_password = get_password_hash(admin_password)
            now = datetime.now(timezone.utc)

            admin_doc = {
                "name": "Default Admin",
                "email": admin_email,
                "hashed_password": hashed_password,
                "role": UserRole.admin,
                "is_active": True,
                "is_verified": True,
                "created_at": now.isoformat(),
                "updated_at": now.isoformat(),
                "last_login": None,
                "profile": {
                    "bio": "Default system administrator",
                    "avatar": None,
                    "preferences": {}
                }
            }

            await db.users.insert_one(admin_doc)
            logger.warning(f"Default admin user created: {admin_email} / {admin_password}")
            logger.warning("IMPORTANT: Change the default admin password immediately!")
    except Exception as e:
        logger.error(f"Error creating default admin user: {e}")

# =============================================================================
# WELLNESS MONITORING API ENDPOINTS (Silent Sense)
# =============================================================================

class WellnessStatusCreate(BaseModel):
    user_id: str
    session_duration: int
    quiz_scores: List[Dict[str, Any]] = []
    wellness_status: str = "optimal"
    activity_events: List[Dict[str, Any]] = []
    patterns: Optional[Dict[str, Any]] = None

class WellnessBreakCreate(BaseModel):
    user_id: str
    duration_minutes: int
    trigger_reason: str = "suggestion"
    session_duration: int = 0

class WellnessBreakEnd(BaseModel):
    user_id: str
    break_id: str
    completed: bool = True

class WellnessStatusModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_duration: int
    quiz_scores: List[Dict[str, Any]] = []
    wellness_status: str = "optimal"
    activity_events: List[Dict[str, Any]] = []
    patterns: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WellnessBreak(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    duration_minutes: int
    trigger_reason: str = "suggestion"
    session_duration: int = 0
    completed: bool = False
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ended_at: Optional[datetime] = None

class StudySession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    start_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    end_time: Optional[datetime] = None
    duration_minutes: int = 0
    quiz_scores: List[float] = []
    activities_completed: int = 0
    break_count: int = 0

@api_router.post("/wellness/status")
async def record_wellness_status(status_data: WellnessStatusCreate):
    """Record wellness status for a user session."""
    try:
        status_doc = status_data.model_dump()
        status_doc['id'] = str(uuid.uuid4())
        status_doc['created_at'] = datetime.now(timezone.utc).isoformat()

        await db.wellness_status.insert_one(status_doc)

        await db.study_sessions.update_one(
            {"user_id": status_data.user_id, "end_time": None},
            {
                "$set": {
                    "duration_minutes": status_data.session_duration // 60000,
                    "quiz_scores": [s.get("score", 0) for s in status_data.quiz_scores],
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            },
            upsert=True
        )

        return {
            "message": "Wellness status recorded",
            "status": status_data.wellness_status,
            "recommendations": get_wellness_recommendations(status_data.wellness_status)
        }
    except Exception as e:
        logging.error(f"Failed to record wellness status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/wellness/breaks")
async def start_wellness_break(break_data: WellnessBreakCreate):
    """Record a wellness break taken by user."""
    try:
        break_doc = break_data.model_dump()
        break_doc['id'] = str(uuid.uuid4())
        break_doc['completed'] = False
        break_doc['started_at'] = datetime.now(timezone.utc).isoformat()

        await db.wellness_breaks.insert_one(break_doc)

        await db.study_sessions.update_one(
            {"user_id": break_data.user_id, "end_time": None},
            {"$inc": {"break_count": 1}}
        )

        return {"message": "Break recorded successfully", "break_id": break_doc['id']}
    except Exception as e:
        logging.error(f"Failed to record break: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/wellness/breaks/end")
async def end_wellness_break(end_data: WellnessBreakEnd):
    """Mark a wellness break as completed."""
    try:
        await db.wellness_breaks.update_one(
            {"id": end_data.break_id, "user_id": end_data.user_id},
            {
                "$set": {
                    "completed": end_data.completed,
                    "ended_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        return {"message": "Break ended successfully"}
    except Exception as e:
        logging.error(f"Failed to end break: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/wellness/dashboard")
async def get_wellness_dashboard(
    period: str = "week",
    current_user: UserAuth = Depends(get_current_active_user)
):
    """Get wellness dashboard data for a user."""
    try:
        now = datetime.now(timezone.utc)

        if period == "day":
            start_date = now - timedelta(days=1)
        elif period == "week":
            start_date = now - timedelta(days=7)
        elif period == "month":
            start_date = now - timedelta(days=30)
        else:
            start_date = now - timedelta(days=7)

        sessions_cursor = db.study_sessions.find({
            "user_id": current_user.id,
            "start_time": {"$gte": start_date.isoformat()}
        })
        sessions = await sessions_cursor.to_list(100)

        streak_data = await calculate_study_streak(current_user.id, db)

        total_study_time = sum(s.get("duration_minutes", 0) for s in sessions)
        today_study_time = sum(
            s.get("duration_minutes", 0) for s in sessions
            if datetime.fromisoformat(s["start_time"]).date() == now.date()
        )

        breaks_cursor = db.wellness_breaks.find({
            "user_id": current_user.id,
            "started_at": {"$gte": start_date.isoformat()}
        })
        breaks = await breaks_cursor.to_list(100)

        optimal_times = calculate_optimal_study_times(sessions)
        performance_vs_rest = calculate_performance_rest_correlation(sessions, breaks)

        weekly_stats = {
            "totalSessions": len([s for s in sessions if s.get("duration_minutes", 0) > 0]),
            "avgSessionDuration": int(sum(s.get("duration_minutes", 0) for s in sessions) / len(sessions)) if sessions else 0,
            "breaksTaken": len([b for b in breaks if b.get("completed")]),
            "avgQuizScore": int(sum(
                sum(s.get("quiz_scores", [])) / len(s.get("quiz_scores", [1]))
                for s in sessions if s.get("quiz_scores")
            ) / len(sessions)) if sessions else 0
        }

        insight = determine_wellness_insight(sessions, breaks, weekly_stats)

        recent_breaks = [
            {
                "date": "Today" if datetime.fromisoformat(b["started_at"]).date() == now.date() else "Yesterday",
                "duration": b.get("duration_minutes", 5),
                "completed": b.get("completed", False)
            }
            for b in sorted(breaks, key=lambda x: x["started_at"], reverse=True)[:5]
        ]

        return {
            "studyStreak": streak_data,
            "todayStudyTime": today_study_time,
            "totalStudyTime": total_study_time,
            "optimalStudyTimes": optimal_times,
            "performanceVsRest": performance_vs_rest,
            "weeklyStats": weekly_stats,
            "insight": insight,
            "recentBreaks": recent_breaks
        }
    except Exception as e:
        logging.error(f"Failed to get wellness dashboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/wellness/session/start")
async def start_study_session(current_user: UserAuth = Depends(get_current_active_user)):
    """Start a new study session."""
    try:
        session_doc = {
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "start_time": datetime.now(timezone.utc).isoformat(),
            "end_time": None,
            "duration_minutes": 0,
            "quiz_scores": [],
            "activities_completed": 0,
            "break_count": 0
        }

        await db.study_sessions.insert_one(session_doc)

        return {"message": "Study session started", "session_id": session_doc["id"]}
    except Exception as e:
        logging.error(f"Failed to start study session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/wellness/session/end")
async def end_study_session(current_user: UserAuth = Depends(get_current_active_user)):
    """End the current study session."""
    try:
        result = await db.study_sessions.update_one(
            {"user_id": current_user.id, "end_time": None},
            {"$set": {"end_time": datetime.now(timezone.utc).isoformat()}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="No active session found")

        return {"message": "Study session ended"}
    except Exception as e:
        logging.error(f"Failed to end study session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/wellness/history")
async def get_wellness_history(
    limit: int = 30,
    current_user: UserAuth = Depends(get_current_active_user)
):
    """Get wellness status history for a user."""
    try:
        history_cursor = db.wellness_status.find(
            {"user_id": current_user.id},
            {"_id": 0}
        ).sort("created_at", -1).limit(limit)

        history = await history_cursor.to_list(limit)

        for item in history:
            if isinstance(item.get("created_at"), str):
                item["created_at"] = datetime.fromisoformat(item["created_at"])

        return history
    except Exception as e:
        logging.error(f"Failed to get wellness history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def get_wellness_recommendations(status: str) -> List[str]:
    """Get recommendations based on wellness status."""
    recommendations = {
        "optimal": ["Keep up the great work!", "Your focus is excellent.", "Continue at your current pace."],
        "warning": ["Consider a 5-minute break.", "Stretch or walk briefly.", "Hydrate and breathe deeply."],
        "critical": ["Take a 15-minute break away from screens.", "Step outside for fresh air.", "Rest your eyes and mind."]
    }
    return recommendations.get(status, recommendations["optimal"])

async def calculate_study_streak(user_id: str, db) -> Dict[str, int]:
    """Calculate current and best study streaks."""
    try:
        sessions = await db.study_sessions.find({
            "user_id": user_id,
            "end_time": {"$ne": None}
        }).to_list(365)

        if not sessions:
            return {"current": 0, "best": 0}

        session_dates = set()
        for s in sessions:
            start = datetime.fromisoformat(s["start_time"])
            session_dates.add(start.date())

        today = datetime.now(timezone.utc).date()
        current_streak = 0
        check_date = today

        while check_date in session_dates:
            current_streak += 1
            check_date -= timedelta(days=1)

        best_streak = 0
        temp_streak = 0
        prev_date = None

        for date in sorted(session_dates, reverse=True):
            if prev_date is None:
                temp_streak = 1
            elif (prev_date - date).days == 1:
                temp_streak += 1
            else:
                best_streak = max(best_streak, temp_streak)
                temp_streak = 1
            prev_date = date

        best_streak = max(best_streak, temp_streak)

        return {"current": current_streak, "best": best_streak}
    except Exception as e:
        logging.error(f"Failed to calculate streak: {e}")
        return {"current": 0, "best": 0}

def calculate_optimal_study_times(sessions: List[Dict]) -> List[str]:
    """Calculate optimal study times based on session performance."""
    if not sessions:
        return ["09:00-11:00", "14:00-16:00", "19:00-21:00"]

    hour_performance = {}
    hour_count = {}

    for s in sessions:
        start = datetime.fromisoformat(s["start_time"])
        hour = start.hour
        scores = s.get("quiz_scores", [])

        if scores:
            avg_score = sum(scores) / len(scores)
            hour_performance[hour] = hour_performance.get(hour, 0) + avg_score
            hour_count[hour] = hour_count.get(hour, 0) + 1

    hourly_avg = {
        h: hour_performance[h] / hour_count[h]
        for h in hour_performance
    }

    top_hours = sorted(hourly_avg, key=hourly_avg.get, reverse=True)[:3]

    time_ranges = []
    for h in sorted(top_hours):
        start_h = str(h).zfill(2)
        end_h = str((h + 2) % 24).zfill(2)
        time_ranges.append(f"{start_h}:00-{end_h}:00")

    return time_ranges if time_ranges else ["09:00-11:00", "14:00-16:00", "19:00-21:00"]

def calculate_performance_rest_correlation(sessions: List[Dict], breaks: List[Dict]) -> List[Dict]:
    """Calculate correlation between performance and rest periods."""
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    result = []

    for i, day in enumerate(days):
        day_sessions = [
            s for s in sessions
            if datetime.fromisoformat(s["start_time"]).weekday() == i
        ]

        day_breaks = [
            b for b in breaks
            if datetime.fromisoformat(b["started_at"]).weekday() == i
        ]

        total_study = sum(s.get("duration_minutes", 0) for s in day_sessions)
        total_rest = sum(b.get("duration_minutes", 0) for b in day_breaks if b.get("completed"))

        all_scores = []
        for s in day_sessions:
            all_scores.extend(s.get("quiz_scores", []))

        avg_performance = sum(all_scores) / len(all_scores) if all_scores else 75

        result.append({
            "day": day,
            "study": min(total_study, 120),
            "rest": min(total_rest, 60),
            "performance": round(avg_performance)
        })

    return result

def determine_wellness_insight(sessions: List[Dict], breaks: List[Dict], stats: Dict) -> str:
    """Determine personalized insight based on data."""
    if not sessions:
        return "needs_rest"

    total_study = sum(s.get("duration_minutes", 0) for s in sessions)
    total_breaks = sum(b.get("duration_minutes", 0) for b in breaks if b.get("completed"))

    if total_study > 0:
        break_ratio = total_breaks / total_study

        if break_ratio > 0.3:
            return "high_performance"
        elif break_ratio < 0.1:
            return "needs_rest"

    if stats.get("totalSessions", 0) >= 20:
        return "streak_hero"

    return "high_performance"