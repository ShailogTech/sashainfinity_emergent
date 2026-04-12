"""
Chunked Upload Router
Handles large file uploads by splitting them into chunks
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import Optional
import os
import shutil
from pathlib import Path
import uuid
import json
from datetime import datetime, timedelta

from app.core.database import get_db
from app.services.auth_service import AuthService
from app.models.user import User
from app.core.config import get_settings

router = APIRouter()
settings = get_settings()

# Storage for upload sessions
UPLOAD_SESSIONS = {}
CHUNK_TIMEOUT = timedelta(hours=2)  # Cleanup incomplete uploads after 2 hours


class UploadSession:
    """Represents a chunked upload session"""

    def __init__(self, upload_id: str, filename: str, file_size: int,
                 content_type: str, total_chunks: int, upload_type: str, user_id: int):
        self.upload_id = upload_id
        self.filename = filename
        self.file_size = file_size
        self.content_type = content_type
        self.total_chunks = total_chunks
        self.upload_type = upload_type
        self.user_id = user_id
        self.received_chunks = set()
        # Use UPLOAD_DIR from settings or default to /app/uploads
        upload_dir = getattr(settings, 'UPLOAD_DIR', '/app/uploads')
        self.temp_dir = Path(upload_dir) / "temp" / upload_id
        self.created_at = datetime.now()

        # Create temp directory
        self.temp_dir.mkdir(parents=True, exist_ok=True)

    def is_expired(self) -> bool:
        """Check if upload session has expired"""
        return datetime.now() - self.created_at > CHUNK_TIMEOUT

    def is_complete(self) -> bool:
        """Check if all chunks have been received"""
        return len(self.received_chunks) == self.total_chunks

    def get_chunk_path(self, chunk_number: int) -> Path:
        """Get path for a chunk file"""
        return self.temp_dir / f"chunk_{chunk_number:05d}"

    def cleanup(self):
        """Remove temporary directory"""
        if self.temp_dir.exists():
            shutil.rmtree(self.temp_dir)


def cleanup_expired_sessions():
    """Remove expired upload sessions"""
    expired = [
        upload_id for upload_id, session in UPLOAD_SESSIONS.items()
        if session.is_expired()
    ]
    for upload_id in expired:
        UPLOAD_SESSIONS[upload_id].cleanup()
        del UPLOAD_SESSIONS[upload_id]


@router.post("/init")
async def initialize_chunked_upload(
    filename: str = Form(...),
    file_size: int = Form(...),
    content_type: str = Form(...),
    total_chunks: int = Form(...),
    upload_type: str = Form(...),  # 'image', 'video', or 'document'
    current_user: User = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Initialize a chunked upload session
    """
    # Cleanup expired sessions
    cleanup_expired_sessions()

    # Validate upload type
    if upload_type not in ['image', 'video', 'document']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid upload type"
        )

    # Validate file size limits (use defaults if not in settings)
    max_sizes = {
        'image': getattr(settings, 'MAX_IMAGE_SIZE_MB', 10) * 1024 * 1024,
        'video': getattr(settings, 'MAX_VIDEO_SIZE_MB', 500) * 1024 * 1024,
        'document': getattr(settings, 'MAX_DOCUMENT_SIZE_MB', 50) * 1024 * 1024
    }

    if file_size > max_sizes.get(upload_type, 10 * 1024 * 1024):
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum allowed for {upload_type}"
        )

    # Generate upload ID
    upload_id = str(uuid.uuid4())

    # Create upload session
    session = UploadSession(
        upload_id=upload_id,
        filename=filename,
        file_size=file_size,
        content_type=content_type,
        total_chunks=total_chunks,
        upload_type=upload_type,
        user_id=current_user.id
    )

    UPLOAD_SESSIONS[upload_id] = session

    return {
        "upload_id": upload_id,
        "message": "Upload session initialized"
    }


@router.post("/chunk")
async def upload_chunk(
    upload_id: str = Form(...),
    chunk_number: int = Form(...),
    total_chunks: int = Form(...),
    chunk: UploadFile = File(...),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Upload a single chunk
    """
    # Get upload session
    session = UPLOAD_SESSIONS.get(upload_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upload session not found or expired"
        )

    # Verify user
    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized for this upload"
        )

    # Verify chunk number
    if chunk_number < 0 or chunk_number >= total_chunks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid chunk number"
        )

    # Save chunk to temp file
    chunk_path = session.get_chunk_path(chunk_number)
    with chunk_path.open("wb") as buffer:
        shutil.copyfileobj(chunk.file, buffer)

    # Mark chunk as received
    session.received_chunks.add(chunk_number)

    return {
        "chunk_id": f"{upload_id}_{chunk_number}",
        "chunk_number": chunk_number,
        "received": True,
        "total_received": len(session.received_chunks),
        "total_chunks": session.total_chunks
    }


@router.post("/complete")
async def complete_chunked_upload(
    upload_id: str = Form(...),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Complete upload and assemble chunks into final file
    """
    # Get upload session
    session = UPLOAD_SESSIONS.get(upload_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upload session not found"
        )

    # Verify user
    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized for this upload"
        )

    # Verify all chunks received
    if not session.is_complete():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Not all chunks received. Got {len(session.received_chunks)}/{session.total_chunks}"
        )

    # Generate unique filename
    file_ext = os.path.splitext(session.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"

    # Determine final path based on upload type
    type_dir_map = {
        'image': 'images',
        'video': 'videos',
        'document': 'documents'
    }
    upload_subdir = type_dir_map.get(session.upload_type, 'files')
    upload_dir = getattr(settings, 'UPLOAD_DIR', '/app/uploads')
    final_dir = Path(upload_dir) / upload_subdir
    final_dir.mkdir(parents=True, exist_ok=True)
    final_path = final_dir / unique_filename

    try:
        # Assemble chunks into final file
        with final_path.open("wb") as final_file:
            for chunk_num in sorted(session.received_chunks):
                chunk_path = session.get_chunk_path(chunk_num)
                with chunk_path.open("rb") as chunk_file:
                    shutil.copyfileobj(chunk_file, final_file)

        # Verify file size
        actual_size = final_path.stat().st_size
        if actual_size != session.file_size:
            final_path.unlink()  # Delete corrupted file
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"File assembly failed. Expected {session.file_size} bytes, got {actual_size}"
            )

        # Generate file URL
        file_url = f"/uploads/{upload_subdir}/{unique_filename}"

        # Cleanup session
        session.cleanup()
        del UPLOAD_SESSIONS[upload_id]

        return {
            "success": True,
            "upload_id": upload_id,
            "file_url": file_url,
            "filename": unique_filename,
            "original_filename": session.filename,
            "size": session.file_size,
            "content_type": session.content_type
        }

    except Exception as e:
        # Cleanup on error
        if final_path.exists():
            final_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assemble file: {str(e)}"
        )


@router.post("/cancel")
async def cancel_chunked_upload(
    upload_id: str = Form(...),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Cancel upload and cleanup
    """
    # Get upload session
    session = UPLOAD_SESSIONS.get(upload_id)
    if not session:
        return {"success": True, "message": "Upload session not found or already cancelled"}

    # Verify user
    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized for this upload"
        )

    # Cleanup
    session.cleanup()
    del UPLOAD_SESSIONS[upload_id]

    return {
        "success": True,
        "message": "Upload cancelled and cleaned up"
    }


@router.get("/status/{upload_id}")
async def get_upload_status(
    upload_id: str,
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get status of chunked upload
    """
    session = UPLOAD_SESSIONS.get(upload_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upload session not found"
        )

    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized for this upload"
        )

    return {
        "upload_id": upload_id,
        "filename": session.filename,
        "file_size": session.file_size,
        "total_chunks": session.total_chunks,
        "received_chunks": len(session.received_chunks),
        "is_complete": session.is_complete(),
        "created_at": session.created_at.isoformat()
    }
