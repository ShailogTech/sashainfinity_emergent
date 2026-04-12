"""
Enhanced Security Configuration for SashaInfinity LMS
"""
from pydantic_settings import BaseSettings
from pydantic import Field, validator
from typing import List, Optional
import os
import secrets

class Settings(BaseSettings):
    """Enhanced security-aware application settings"""

    # Environment
    ENVIRONMENT: str = Field(default="production", env="ENVIRONMENT")
    DEBUG: bool = Field(default=False, env="DEBUG")

    # Generate secure secrets if not provided
    @validator('SECRET_KEY', pre=True)
    def generate_secret_key(cls, v):
        if v == "your-secret-key-change-in-production-min-32-chars" or not v:
            return secrets.token_urlsafe(64)
        return v

    @validator('JWT_SECRET', pre=True)
    def generate_jwt_secret(cls, v):
        if v == "your-jwt-secret-change-in-production" or not v:
            return secrets.token_urlsafe(64)
        return v

    # Database
    DATABASE_URL: str = Field(env="DATABASE_URL")

    # Redis
    REDIS_URL: str = Field(env="REDIS_URL")

    # Enhanced Security Settings
    SECRET_KEY: str = Field(env="SECRET_KEY")
    JWT_SECRET: str = Field(env="JWT_SECRET")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=15, env="ACCESS_TOKEN_EXPIRE_MINUTES")  # Shorter for security
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=3, env="REFRESH_TOKEN_EXPIRE_DAYS")  # Shorter for security

    # Password Security
    MIN_PASSWORD_LENGTH: int = Field(default=12, env="MIN_PASSWORD_LENGTH")
    MAX_LOGIN_ATTEMPTS: int = Field(default=5, env="MAX_LOGIN_ATTEMPTS")
    LOCKOUT_DURATION_MINUTES: int = Field(default=15, env="LOCKOUT_DURATION_MINUTES")
    PASSWORD_CHANGE_FREQUENCY_DAYS: int = Field(default=90, env="PASSWORD_CHANGE_FREQUENCY_DAYS")

    # Session Security
    SESSION_TIMEOUT_MINUTES: int = Field(default=30, env="SESSION_TIMEOUT_MINUTES")
    MAX_CONCURRENT_SESSIONS: int = Field(default=3, env="MAX_CONCURRENT_SESSIONS")

    # Rate Limiting
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = Field(default=60, env="RATE_LIMIT_REQUESTS_PER_MINUTE")
    RATE_LIMIT_REQUESTS_PER_HOUR: int = Field(default=1000, env="RATE_LIMIT_REQUESTS_PER_HOUR")
    RATE_LIMIT_LOGIN_ATTEMPTS: int = Field(default=5, env="RATE_LIMIT_LOGIN_ATTEMPTS")

    # Security Headers
    SECURITY_ENABLE_CSP: bool = Field(default=True, env="SECURITY_ENABLE_CSP")
    SECURITY_ENABLE_HSTS: bool = Field(default=True, env="SECURITY_ENABLE_HSTS")
    SECURITY_FRAME_OPTIONS: str = Field(default="DENY", env="SECURITY_FRAME_OPTIONS")
    SECURITY_CONTENT_TYPE_NOSNIFF: bool = Field(default=True, env="SECURITY_CONTENT_TYPE_NOSNIFF")
    SECURITY_XSS_PROTECTION: bool = Field(default=True, env="SECURITY_XSS_PROTECTION")

    # CORS Configuration (Strict)
    CORS_ORIGINS: List[str] = Field(
        default=["https://lms.sashainfinity.com", "https://sashainfinity.com", "https://backend.sashainfinity.com", "http://localhost:3100", "http://127.0.0.1:3100", "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000", "http://127.0.0.1:8000"],
        env="CORS_ORIGINS"
    )
    ALLOWED_HOSTS: List[str] = Field(
        default=["lms.sashainfinity.com", "backend.sashainfinity.com", "localhost", "127.0.0.1"],
        env="ALLOWED_HOSTS"
    )

    # API Security
    API_KEY_HEADER: str = Field(default="X-API-Key", env="API_KEY_HEADER")
    ENABLE_API_RATE_LIMITING: bool = Field(default=True, env="ENABLE_API_RATE_LIMITING")
    ENABLE_REQUEST_LOGGING: bool = Field(default=True, env="ENABLE_REQUEST_LOGGING")
    ENABLE_SECURITY_HEADERS: bool = Field(default=True, env="ENABLE_SECURITY_HEADERS")

    # File Upload Security
    UPLOAD_PATH: str = Field(default="./uploads", env="UPLOAD_PATH")
    MAX_FILE_SIZE: int = Field(default=10485760, env="MAX_FILE_SIZE")  # 10MB instead of 100MB
    ALLOWED_EXTENSIONS: List[str] = Field(
        default=["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "txt"],
        env="ALLOWED_EXTENSIONS"
    )
    SCAN_UPLOADED_FILES: bool = Field(default=True, env="SCAN_UPLOADED_FILES")
    QUARANTINE_INFECTED_FILES: bool = Field(default=True, env="QUARANTINE_INFECTED_FILES")

    # IP Security
    ALLOWED_IP_RANGES: List[str] = Field(
        default=[],  # Empty means allow all, specify ranges for admin access
        env="ALLOWED_IP_RANGES"
    )
    BLOCKED_IP_RANGES: List[str] = Field(
        default=[],
        env="BLOCKED_IP_RANGES"
    )
    ENABLE_IP_WHITELISTING: bool = Field(default=False, env="ENABLE_IP_WHITELISTING")

    # Monitoring and Logging
    ENABLE_SECURITY_MONITORING: bool = Field(default=True, env="ENABLE_SECURITY_MONITORING")
    LOG_FAILED_LOGIN_ATTEMPTS: bool = Field(default=True, env="LOG_FAILED_LOGIN_ATTEMPTS")
    LOG_SUSPICIOUS_ACTIVITIES: bool = Field(default=True, env="LOG_SUSPICIOUS_ACTIVITIES")
    ALERT_ON_SECURITY_EVENTS: bool = Field(default=True, env="ALERT_ON_SECURITY_EVENTS")
    SECURITY_ALERT_EMAIL: str = Field(default="admin@sashainfinity.com", env="SECURITY_ALERT_EMAIL")

    # Payment (Razorpay)
    RAZORPAY_KEY_ID: str = Field(default="", env="RAZORPAY_KEY_ID")
    RAZORPAY_KEY_SECRET: str = Field(default="", env="RAZORPAY_KEY_SECRET")
    RAZORPAY_WEBHOOK_SECRET: str = Field(default="", env="RAZORPAY_WEBHOOK_SECRET")

    # Email
    SMTP_HOST: str = Field(default="", env="SMTP_HOST")
    SMTP_PORT: int = Field(default=587, env="SMTP_PORT")
    SMTP_USER: str = Field(default="", env="SMTP_USER")
    SMTP_PASSWORD: str = Field(default="", env="SMTP_PASSWORD")
    EMAIL_FROM: str = Field(default="noreply@sashainfinity.com", env="EMAIL_FROM")

    # URLs
    FRONTEND_URL: str = Field(default="https://lms.sashainfinity.com", env="FRONTEND_URL")
    BACKEND_URL: str = Field(default="https://backend.sashainfinity.com", env="BACKEND_URL")
    DOMAIN: str = Field(default="sashainfinity.com", env="DOMAIN")

    # Logging
    LOG_LEVEL: str = Field(default="WARNING", env="LOG_LEVEL")
    SECURITY_LOG_LEVEL: str = Field(default="INFO", env="SECURITY_LOG_LEVEL")
    LOG_FILE_PATH: str = Field(default="/var/log/sasha_lms", env="LOG_FILE_PATH")

    # Bunny CDN
    BUNNY_LIBRARY_ID: str = Field(default="618286", env="BUNNY_LIBRARY_ID")
    BUNNY_API_KEY: str = Field(default="", env="BUNNY_API_KEY")
    BUNNY_CDN_HOSTNAME: str = Field(default="vz-60dda74a-f32.b-cdn.net", env="BUNNY_CDN_HOSTNAME")

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = 'ignore'

# Global settings instance
_settings = None

def get_settings() -> Settings:
    """Get settings instance (singleton)"""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings