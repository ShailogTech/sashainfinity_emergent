"""
Comprehensive Security Middleware for SashaInfinity LMS
Provides multiple layers of security protection
"""

import time
import redis
import hashlib
import ipaddress
import logging
from typing import Dict, List, Optional, Set
from datetime import datetime, timedelta
from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.core.config import get_settings
import secrets
import re
import json

settings = get_settings()

# Configure security logger
security_logger = logging.getLogger("security")
security_logger.setLevel(getattr(logging, settings.SECURITY_LOG_LEVEL))

# File handler for security logs
try:
    import os
    os.makedirs(settings.LOG_FILE_PATH, exist_ok=True)
    file_handler = logging.FileHandler(f"{settings.LOG_FILE_PATH}/security.log")
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    ))
    security_logger.addHandler(file_handler)
except Exception:
    # Fallback to console logging if file creation fails
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter(
        '%(asctime)s - SECURITY - %(levelname)s - %(message)s'
    ))
    security_logger.addHandler(console_handler)

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Advanced Rate Limiting with Redis Backend"""

    def __init__(self, app):
        super().__init__(app)
        self.redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

    async def dispatch(self, request: Request, call_next):
        client_ip = self._get_client_ip(request)
        path = request.url.path

        # Skip rate limiting for health checks and static files
        if self._should_skip_rate_limit(path):
            return await call_next(request)

        # Skip rate limiting for public endpoints that should be freely accessible
        public_endpoints = [
            '/courses/',
            '/categories',
            '/tags',
            '/instructors',
            '/health',
            '/placeholder/',
            '/uploads/',
            '/images/',
            '/videos/'
        ]

        # Check if this is a public endpoint
        is_public_endpoint = any(path.startswith(endpoint) for endpoint in public_endpoints)

        # Different rate limits for different endpoints
        if path.startswith('/auth/login'):
            await self._check_login_rate_limit(client_ip)
        elif path.startswith('/certificate-verification/') or path.startswith('/api/v1/certificates/verify'):
            await self._check_certificate_verification_rate_limit(client_ip)
        elif not is_public_endpoint:
            await self._check_general_rate_limit(client_ip)

        return await call_next(request)

    def _get_client_ip(self, request: Request) -> str:
        """Extract real client IP from request"""
        # Check for forwarded headers
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()

        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip

        return request.client.host if request.client else "unknown"

    def _should_skip_rate_limit(self, path: str) -> bool:
        """Skip rate limiting for certain endpoints"""
        skip_paths = [
            "/health",
            "/metrics",
            "/favicon.ico",
            "/robots.txt",
            "/static/",
            "/api/v1/payments/",
            "/api/v1/courses/",
            "/api/v1/enrollments/",
        ]
        return any(path.startswith(skip_path) for skip_path in skip_paths)

    async def _check_login_rate_limit(self, client_ip: str):
        """Strict rate limiting for login attempts"""
        key = f"rate_limit:login:{client_ip}"

        try:
            current_count = self.redis_client.get(key) or 0
            current_count = int(current_count)

            if current_count >= settings.RATE_LIMIT_LOGIN_ATTEMPTS:
                security_logger.warning(f"Login rate limit exceeded for IP: {client_ip}")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many login attempts. Please try again later."
                )

            # Increment counter
            pipe = self.redis_client.pipeline()
            pipe.incr(key)
            pipe.expire(key, 300)  # 5 minutes
            pipe.execute()

        except redis.RedisError as e:
            security_logger.error(f"Redis error in rate limiting: {e}")

    async def _check_certificate_verification_rate_limit(self, client_ip: str):
        """Strict rate limiting for certificate verification attempts to prevent brute force attacks"""
        key = f"rate_limit:cert_verify:{client_ip}"

        try:
            current_count = self.redis_client.get(key) or 0
            current_count = int(current_count)

            # Allow 5 verifications per minute, 20 per hour
            minute_key = f"rate_limit:cert_verify:minute:{client_ip}"
            hour_key = f"rate_limit:cert_verify:hour:{client_ip}"

            current_minute = self.redis_client.get(minute_key) or 0
            current_minute = int(current_minute)

            current_hour = self.redis_client.get(hour_key) or 0
            current_hour = int(current_hour)

            if current_minute >= 5:
                security_logger.warning(f"Certificate verification minute rate limit exceeded for IP: {client_ip}")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many certificate verification attempts. Please try again in a minute."
                )

            if current_hour >= 20:
                security_logger.warning(f"Certificate verification hour rate limit exceeded for IP: {client_ip}")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many certificate verification attempts. Please try again later."
                )

            # Increment counters
            pipe = self.redis_client.pipeline()
            pipe.incr(minute_key)
            pipe.expire(minute_key, 60)  # 1 minute
            pipe.incr(hour_key)
            pipe.expire(hour_key, 3600)  # 1 hour
            pipe.execute()

            security_logger.info(f"Certificate verification attempt from IP: {client_ip} (minute: {current_minute + 1}, hour: {current_hour + 1})")

        except redis.RedisError as e:
            security_logger.error(f"Redis error in certificate verification rate limiting: {e}")

    async def _check_general_rate_limit(self, client_ip: str):
        """General rate limiting for all endpoints"""
        minute_key = f"rate_limit:minute:{client_ip}"
        hour_key = f"rate_limit:hour:{client_ip}"

        try:
            # Check per-minute limit
            current_minute = self.redis_client.get(minute_key) or 0
            current_minute = int(current_minute)

            # Check per-hour limit
            current_hour = self.redis_client.get(hour_key) or 0
            current_hour = int(current_hour)

            if current_minute >= settings.RATE_LIMIT_REQUESTS_PER_MINUTE:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded. Please try again in a minute."
                )

            if current_hour >= settings.RATE_LIMIT_REQUESTS_PER_HOUR:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Hourly rate limit exceeded. Please try again later."
                )

            # Increment counters
            pipe = self.redis_client.pipeline()
            pipe.incr(minute_key)
            pipe.expire(minute_key, 60)
            pipe.incr(hour_key)
            pipe.expire(hour_key, 3600)
            pipe.execute()

        except redis.RedisError as e:
            security_logger.error(f"Redis error in rate limiting: {e}")

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Security Headers Middleware"""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        if not settings.ENABLE_SECURITY_HEADERS:
            return response

        # Content Security Policy
        if settings.SECURITY_ENABLE_CSP:
            csp_policy = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://ajax.googleapis.com https://unpkg.com; "
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
                "font-src 'self' https://fonts.gstatic.com; "
                "img-src 'self' data: https:; media-src 'self' https://sashainfinity.com blob:; "
                "connect-src 'self' https://api.razorpay.com https://lms.sashainfinity.com https://backend.sashainfinity.com https://sashainfinity.com; "
                "frame-src 'none'; "
                "object-src 'none'; "
                "base-uri 'self'; "
                "form-action 'self'; "
                "frame-ancestors 'none'; "
                "upgrade-insecure-requests;"
            )
            response.headers["Content-Security-Policy"] = csp_policy

        # HSTS (HTTPS Strict Transport Security)
        if settings.SECURITY_ENABLE_HSTS and not settings.DEBUG:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

        # X-Frame-Options
        response.headers["X-Frame-Options"] = settings.SECURITY_FRAME_OPTIONS

        # X-Content-Type-Options
        if settings.SECURITY_CONTENT_TYPE_NOSNIFF:
            response.headers["X-Content-Type-Options"] = "nosniff"

        # X-XSS-Protection
        if settings.SECURITY_XSS_PROTECTION:
            response.headers["X-XSS-Protection"] = "1; mode=block"

        # Referrer Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Permissions Policy
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=(), "
            "magnetometer=(), gyroscope=(), speaker=(), "
            "autoplay=(), encrypted-media=(), fullscreen=(self)"
        )

        # Remove server information
        response.headers["Server"] = "SashaInfinity"

        return response

class IPWhitelistMiddleware(BaseHTTPMiddleware):
    """IP-based access control"""

    def __init__(self, app):
        super().__init__(app)
        self.allowed_ips: Set[str] = set(settings.ALLOWED_IP_RANGES)
        self.blocked_ips: Set[str] = set(settings.BLOCKED_IP_RANGES)

    async def dispatch(self, request: Request, call_next):
        if not settings.ENABLE_IP_WHITELISTING:
            return await call_next(request)

        client_ip = self._get_client_ip(request)
        path = request.url.path

        # Skip IP check for public endpoints
        if self._is_public_endpoint(path):
            return await call_next(request)

        # Check if IP is blocked
        if self._is_ip_blocked(client_ip):
            security_logger.warning(f"Blocked IP attempted access: {client_ip} to {path}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

        # Check if IP is whitelisted (if whitelist is enabled)
        if self.allowed_ips and not self._is_ip_allowed(client_ip):
            security_logger.warning(f"Unauthorized IP attempted access: {client_ip} to {path}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

        return await call_next(request)

    def _get_client_ip(self, request: Request) -> str:
        """Extract real client IP from request"""
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()

        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip

        return request.client.host if request.client else "unknown"

    def _is_public_endpoint(self, path: str) -> bool:
        """Check if endpoint is public"""
        public_paths = [
            "/health",
            "/auth/login",
            "/auth/register",
            "/auth/verify-email",
            "/auth/forgot-password",
            "/auth/reset-password",
            "/docs",
            "/redoc",
            "/courses",
            "/courses/",
            "/static/",
            "/favicon.ico",
        ]
        return any(path.startswith(public_path) for public_path in public_paths)

    def _is_ip_blocked(self, ip: str) -> bool:
        """Check if IP is in blocked list"""
        client_ip = ipaddress.ip_address(ip)

        for blocked_range in self.blocked_ips:
            try:
                if client_ip in ipaddress.ip_network(blocked_range):
                    return True
            except ValueError:
                # Invalid IP range format
                continue

        return False

    def _is_ip_allowed(self, ip: str) -> bool:
        """Check if IP is in allowed list"""
        client_ip = ipaddress.ip_address(ip)

        for allowed_range in self.allowed_ips:
            try:
                if client_ip in ipaddress.ip_network(allowed_range):
                    return True
            except ValueError:
                # Invalid IP range format
                continue

        return False

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Security-focused request logging"""

    def __init__(self, app):
        super().__init__(app)
        self.suspicious_patterns = [
            r'<script[^>]*>',
            r'javascript:',
            r'on\w+\s*=',
            r'union\s+select',
            r'drop\s+table',
            r'insert\s+into',
            r'delete\s+from',
            r'update\s+set',
            r'\.\./',
            r'%2e%2e%2f',
            r'cmd\.exe',
            r'powershell',
            r'/etc/passwd',
            r'/proc/version',
        ]

        self.compiled_patterns = [re.compile(pattern, re.IGNORECASE) for pattern in self.suspicious_patterns]

    async def dispatch(self, request: Request, call_next):
        if not settings.ENABLE_REQUEST_LOGGING:
            return await call_next(request)

        start_time = time.time()
        client_ip = self._get_client_ip(request)
        user_agent = request.headers.get("User-Agent", "")
        path = request.url.path
        method = request.method

        # Log the request
        security_logger.info(
            f"Request: {method} {path} from {client_ip} - UA: {user_agent[:100]}"
        )

        # Check for suspicious activity
        await self._check_suspicious_request(request, client_ip)

        response = await call_next(request)

        # Calculate response time
        process_time = time.time() - start_time

        # Log the response
        security_logger.info(
            f"Response: {method} {path} - Status: {response.status_code} - "
            f"Time: {process_time:.3f}s - IP: {client_ip}"
        )

        return response

    def _get_client_ip(self, request: Request) -> str:
        """Extract real client IP from request"""
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()

        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip

        return request.client.host if request.client else "unknown"

    async def _check_suspicious_request(self, request: Request, client_ip: str):
        """Check for suspicious patterns in request"""
        path = request.url.path
        query_string = str(request.query_params)
        user_agent = request.headers.get("User-Agent", "")

        # Check URL path and query parameters
        url_content = f"{path} {query_string}"

        for pattern in self.compiled_patterns:
            if pattern.search(url_content):
                security_logger.warning(
                    f"Suspicious pattern detected from {client_ip}: {pattern.pattern} in {url_content}"
                )
                await self._log_security_event(
                    "SUSPICIOUS_PATTERN",
                    client_ip,
                    {"pattern": pattern.pattern, "url": url_content}
                )
                break

        # Check user agent for suspicious patterns
        suspicious_uas = [
            "sqlmap", "nikto", "nmap", "dirb", "gobuster", "burp",
            "nessus", "openvas", "acunetix", "appscan"
        ]

        for suspicious_ua in suspicious_uas:
            if suspicious_ua.lower() in user_agent.lower():
                security_logger.warning(
                    f"Suspicious User-Agent detected from {client_ip}: {user_agent}"
                )
                await self._log_security_event(
                    "SUSPICIOUS_USER_AGENT",
                    client_ip,
                    {"user_agent": user_agent}
                )
                break

    async def _log_security_event(self, event_type: str, client_ip: str, details: dict):
        """Log security event for monitoring"""
        event_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "client_ip": client_ip,
            "details": details
        }

        security_logger.warning(f"SECURITY_EVENT: {json.dumps(event_data)}")

# Security monitoring functions
async def log_security_event(event_type: str, user_id: Optional[int] = None,
                           client_ip: Optional[str] = None, details: Optional[dict] = None):
    """Log security event"""
    event_data = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": event_type,
        "user_id": user_id,
        "client_ip": client_ip,
        "details": details or {}
    }

    security_logger.warning(f"SECURITY_EVENT: {json.dumps(event_data)}")

    # TODO: Send email alert if configured
    if settings.ALERT_ON_SECURITY_EVENTS and settings.SECURITY_ALERT_EMAIL:
        # Implement email alerting
        pass

def generate_secure_token(length: int = 32) -> str:
    """Generate cryptographically secure random token"""
    return secrets.token_urlsafe(length)

def hash_sensitive_data(data: str) -> str:
    """Hash sensitive data for logging"""
    return hashlib.sha256(data.encode()).hexdigest()[:16]

def validate_password_strength(password: str) -> tuple[bool, str]:
    """Validate password strength according to security requirements"""
    if len(password) < settings.MIN_PASSWORD_LENGTH:
        return False, f"Password must be at least {settings.MIN_PASSWORD_LENGTH} characters long"

    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"

    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"

    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"

    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character"

    # Check for common patterns
    if re.search(r'(password|123456|qwerty|admin)', password.lower()):
        return False, "Password cannot contain common patterns"

    return True, "Password meets security requirements"

def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent directory traversal"""
    # Remove path separators
    filename = filename.replace("..", "").replace("/", "").replace("\\", "")

    # Remove control characters
    filename = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', filename)

    # Limit length
    if len(filename) > 255:
        name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
        filename = name[:255-len(ext)-1] + '.' + ext

    return filename.strip()