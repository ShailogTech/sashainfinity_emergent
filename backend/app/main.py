"""
SashaInfinity LMS Backend - FastAPI Application
Premium Learning Management System
"""

from fastapi import FastAPI, Request
from app.core.cors import setup_cors
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
import uvicorn
import os
from contextlib import asynccontextmanager

from app.core.config import get_settings
from app.core.database import init_db
from app.core.redis import init_redis

# Import all models to ensure they are registered with SQLAlchemy
from app.models import *
from app.core.security_middleware import (
    RateLimitMiddleware,
    SecurityHeadersMiddleware,
    IPWhitelistMiddleware,
    RequestLoggingMiddleware,
    log_security_event
)
from app.routers import auth, courses, users, payments, certificates, admin, dashboard, uploads, wishlist, instructor_reviews, quizzes, assignments, orders, blog, coupons, video, video_streaming, embed, youtube_embed
from app.routers import player, progress as progress_router, bunny
from app.api.v1 import certificate_verification
try:
    from app.routers import chunked_upload
    CHUNKED_UPLOAD_AVAILABLE = True
except ImportError as e:
    print(f"Chunked upload module not available: {e}")
    CHUNKED_UPLOAD_AVAILABLE = False

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize services on startup"""
    # Initialize database
    await init_db()

    # Initialize Redis
    await init_redis()

    print("SashaInfinity LMS Backend Started Successfully!")
    yield

    print("Shutting down SashaInfinity LMS Backend...")

# Create FastAPI application
app = FastAPI(
    title="SashaInfinity LMS API",
    description="Premium Learning Management System - Backend API",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None,
    lifespan=lifespan,
    # Fix redirect URLs to use HTTPS
    redirect_slashes=False
)

# Security Middleware (order matters - IP Whitelist first)
if settings.ENABLE_IP_WHITELISTING or settings.BLOCKED_IP_RANGES:
    app.add_middleware(IPWhitelistMiddleware)

# Rate Limiting Middleware
if settings.ENABLE_API_RATE_LIMITING:
    app.add_middleware(RateLimitMiddleware)

# Request Logging Middleware (for security monitoring)
if settings.ENABLE_REQUEST_LOGGING:
    app.add_middleware(RequestLoggingMiddleware)

# CORS Middleware (centralized)
setup_cors(app)

# Trusted Host Middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# Static Files - use relative paths based on backend directory
import pathlib
backend_dir = pathlib.Path(__file__).parent.parent
uploads_dir = backend_dir / "uploads"
certificates_dir = backend_dir / "certificates"

# Create directories if they don't exist
uploads_dir.mkdir(exist_ok=True)
certificates_dir.mkdir(exist_ok=True)

app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")
app.mount("/certificate-files", StaticFiles(directory=str(certificates_dir)), name="certificate-files")

# Placeholder Image Endpoints
@app.get("/api/placeholder/{width}/{height}")
async def get_placeholder_image(width: int, height: int):
    """Generate placeholder image"""
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=f"https://picsum.photos/{width}/{height}.jpg")

# Health Check Endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for Docker containers"""
    return {
        "status": "healthy",
        "service": "sashainfinity-lms-backend",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT
    }

# Root Endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "SashaInfinity LMS Backend API",
        "version": "1.0.0",
        "docs": "/docs" if settings.ENVIRONMENT == "development" else "disabled",
        "platform": "SashaInfinity"
    }

# Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"Validation error on {request.url}: {exc.errors()}")
    try:
        body_str = exc.body.decode('utf-8') if isinstance(exc.body, bytes) else str(exc.body)
        print(f"Request body: {body_str}")
    except Exception as e:
        print(f"Could not decode request body: {e}")
        body_str = "Unable to decode request body"

    # Format error messages in a user-friendly way
    errors = exc.errors()
    formatted_errors = []
    for error in errors:
        field = error.get('loc', [])[-1] if error.get('loc') else 'unknown'
        msg = error.get('msg', 'Validation error')
        # Extract the actual error message from Pydantic's value_error
        if 'ctx' in error and 'error' in error['ctx']:
            msg = str(error['ctx']['error'])
        formatted_errors.append(f"{field}: {msg}")

    return JSONResponse(
        status_code=422,
        content={"detail": " | ".join(formatted_errors) if formatted_errors else "Validation error"}
    )

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    print(f"ValueError on {request.url}: {str(exc)}")
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)}
    )

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": "Endpoint not found"}
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Include Routers with /api/v1 prefix
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(courses.router, prefix="/api/v1/courses", tags=["Courses"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["Payments"])
app.include_router(orders.router, prefix="/api/v1/orders", tags=["Orders"])
app.include_router(certificates.router, prefix="/api/v1/certificates", tags=["Certificates"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(uploads.router, prefix="/api/v1/upload", tags=["Uploads"])
app.include_router(wishlist.router, prefix="/api/v1/wishlist", tags=["Wishlist"])
app.include_router(instructor_reviews.router, prefix="/api/v1/instructor-reviews", tags=["Instructor Reviews"])
app.include_router(quizzes.router, prefix="/api/v1", tags=["Quizzes"])
app.include_router(assignments.router, prefix="/api/v1", tags=["Assignments"])
app.include_router(certificate_verification.router, prefix="/api/v1", tags=["Certificate Verification"])
app.include_router(blog.router, prefix="/api/v1/blog", tags=["Blog"])
app.include_router(coupons.router, prefix="/api/v1/coupons", tags=["Coupons"])
app.include_router(video.router, prefix="/api/v1/extract", tags=["Video Extraction"])
app.include_router(video_streaming.router, prefix="/api/v1/stream", tags=["Video Streaming"])
app.include_router(embed.router, prefix="/api/v1/embed", tags=["Video Embed"])
app.include_router(youtube_embed.router, prefix="/api/v1/youtube", tags=["YouTube Embed"])
app.include_router(player.router, prefix="/api/v1/video", tags=["Player"])
app.include_router(progress_router.router, prefix="/api/v1/progress", tags=["Progress"])
app.include_router(bunny.router, prefix="/api/v1/bunny", tags=["Bunny"])

# Include chunked upload router if available
if CHUNKED_UPLOAD_AVAILABLE:
    app.include_router(chunked_upload.router, prefix="/upload/chunked", tags=["Chunked Uploads"])
    print("Chunked upload endpoints enabled")
else:
    print("Chunked upload endpoints disabled - using regular uploads only")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.ENVIRONMENT == "development" else False,
        log_level="info"
    )