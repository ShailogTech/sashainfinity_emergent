"""
File Upload Router - Handle image, video, and document uploads
"""
import os
import uuid
import shutil
from typing import List
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from fastapi.responses import FileResponse
from pathlib import Path

from app.services.auth_service import AuthService
from app.models.user import User

router = APIRouter()

# Upload directory configuration
UPLOAD_DIR = Path("/www/wwwroot/sasha_lms/sasha_lms/sasha_lms/backend/uploads")
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm", "video/ogg", "video/avi", "video/mov"}
ALLOWED_DOCUMENT_TYPES = {"application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}

# Max file sizes (in bytes)
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_VIDEO_SIZE = 500 * 1024 * 1024  # 500 MB
MAX_DOCUMENT_SIZE = 20 * 1024 * 1024  # 20 MB


def get_file_extension(filename: str) -> str:
    """Extract file extension from filename"""
    return os.path.splitext(filename)[1].lower()


def generate_unique_filename(original_filename: str) -> str:
    """Generate unique filename using UUID"""
    ext = get_file_extension(original_filename)
    unique_name = f"{uuid.uuid4()}{ext}"
    return unique_name


def validate_file_type(content_type: str, allowed_types: set) -> bool:
    """Validate file MIME type"""
    return content_type in allowed_types


def validate_file_size(file_size: int, max_size: int) -> bool:
    """Validate file size"""
    return file_size <= max_size


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Upload image file
    Only authenticated users can upload
    """
    # Validate file type
    if not validate_file_type(file.content_type, ALLOWED_IMAGE_TYPES):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_IMAGE_TYPES)}"
        )

    # Read file content to check size
    contents = await file.read()
    file_size = len(contents)

    # Validate file size
    if not validate_file_size(file_size, MAX_IMAGE_SIZE):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_IMAGE_SIZE / (1024 * 1024)} MB"
        )

    # Generate unique filename
    unique_filename = generate_unique_filename(file.filename)
    file_path = UPLOAD_DIR / "images" / unique_filename

    # Ensure directory exists
    file_path.parent.mkdir(parents=True, exist_ok=True)

    # Save file
    with open(file_path, "wb") as f:
        f.write(contents)

    # Return file URL
    file_url = f"/uploads/images/{unique_filename}"
    return {
        "success": True,
        "file_url": file_url,
        "filename": unique_filename,
        "original_filename": file.filename,
        "size": file_size,
        "content_type": file.content_type
    }


@router.post("/video")
async def upload_video(
    file: UploadFile = File(...),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Upload video file
    Only authenticated instructors and admins can upload videos
    """
    # Check if user is instructor or admin
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only instructors and admins can upload videos"
        )

    # Validate file type
    if not validate_file_type(file.content_type, ALLOWED_VIDEO_TYPES):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_VIDEO_TYPES)}"
        )

    # Generate unique filename first
    unique_filename = generate_unique_filename(file.filename)
    file_path = UPLOAD_DIR / "videos" / unique_filename

    # Ensure directory exists
    file_path.parent.mkdir(parents=True, exist_ok=True)

    # Save file in chunks to handle large files
    total_size = 0
    with open(file_path, "wb") as f:
        while chunk := await file.read(1024 * 1024):  # Read 1MB at a time
            total_size += len(chunk)

            # Check size limit
            if total_size > MAX_VIDEO_SIZE:
                # Delete partial file
                os.remove(file_path)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File too large. Maximum size: {MAX_VIDEO_SIZE / (1024 * 1024)} MB"
                )

            f.write(chunk)

    # Return file URL
    file_url = f"/uploads/videos/{unique_filename}"
    return {
        "success": True,
        "file_url": file_url,
        "filename": unique_filename,
        "original_filename": file.filename,
        "size": total_size,
        "content_type": file.content_type
    }


@router.post("/document")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Upload document file
    Only authenticated instructors and admins can upload documents
    """
    # Check if user is instructor or admin
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only instructors and admins can upload documents"
        )

    # Validate file type
    if not validate_file_type(file.content_type, ALLOWED_DOCUMENT_TYPES):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: PDF, DOC, DOCX"
        )

    # Read file content to check size
    contents = await file.read()
    file_size = len(contents)

    # Validate file size
    if not validate_file_size(file_size, MAX_DOCUMENT_SIZE):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_DOCUMENT_SIZE / (1024 * 1024)} MB"
        )

    # Generate unique filename
    unique_filename = generate_unique_filename(file.filename)
    file_path = UPLOAD_DIR / "documents" / unique_filename

    # Ensure directory exists
    file_path.parent.mkdir(parents=True, exist_ok=True)

    # Save file
    with open(file_path, "wb") as f:
        f.write(contents)

    # Return file URL
    file_url = f"/uploads/documents/{unique_filename}"
    return {
        "success": True,
        "file_url": file_url,
        "filename": unique_filename,
        "original_filename": file.filename,
        "size": file_size,
        "content_type": file.content_type
    }


@router.delete("/file")
async def delete_file(
    file_url: str,
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Delete uploaded file
    Only the uploader or admin can delete files
    """
    # Check if user is admin
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )

    # Extract file path from URL
    # URL format: /uploads/images/filename.jpg
    try:
        path_parts = file_url.strip("/").split("/")
        if len(path_parts) != 3 or path_parts[0] != "uploads":
            raise ValueError("Invalid file URL format")

        file_type = path_parts[1]  # images, videos, or documents
        filename = path_parts[2]

        file_path = UPLOAD_DIR / file_type / filename

        # Check if file exists
        if not file_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )

        # Delete file
        os.remove(file_path)

        return {
            "success": True,
            "message": "File deleted successfully"
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/info")
async def get_upload_info(
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get upload configuration info
    """
    return {
        "max_image_size_mb": MAX_IMAGE_SIZE / (1024 * 1024),
        "max_video_size_mb": MAX_VIDEO_SIZE / (1024 * 1024),
        "max_document_size_mb": MAX_DOCUMENT_SIZE / (1024 * 1024),
        "allowed_image_types": list(ALLOWED_IMAGE_TYPES),
        "allowed_video_types": list(ALLOWED_VIDEO_TYPES),
        "allowed_document_types": list(ALLOWED_DOCUMENT_TYPES)
    }
