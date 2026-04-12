"""
Certificate Router - SashaInfinity LMS API
Handles certificate generation and management
"""

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from typing import List, Optional
import io
import base64

from app.core.database import get_db
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.certificate import Certificate, IssuedCertificate, CertificateElementTemplate
from app.services.auth_service import AuthService
from app.services.certificate_service import CertificateService
from app.schemas.certificate import (
    CertificateResponse,
    CertificateTemplateCreate,
    CertificateTemplateResponse
)

router = APIRouter()

@router.get("/", response_model=List[CertificateResponse])
async def get_user_certificates(
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all certificates earned by the user
    """
    certificates = db.query(IssuedCertificate).filter(
        IssuedCertificate.user_id == current_user.id
    ).all()

    return [
        {
            "id": cert.id,
            "course_id": cert.course_id,
            "course_title": cert.course.post_title,
            "student_name": current_user.display_name,
            "instructor_name": cert.course.instructor.display_name,
            "completion_date": cert.completion_date,
            "certificate_url": cert.certificate_download_url,
            "verification_code": cert.certificate_hash,
            "issued_at": cert.created_at
        }
        for cert in certificates
    ]

@router.get("/course/{course_id}")
async def get_certificate_by_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_active_user)
):
    """Get certificate for a specific course"""
    cert = db.query(IssuedCertificate).filter(
        IssuedCertificate.course_id == course_id,
        IssuedCertificate.user_id == current_user.id
    ).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    course = db.query(Course).filter(Course.id == course_id).first()
    student = db.query(User).filter(User.id == current_user.id).first()
    return {
        "id": cert.id,
        "course_id": cert.course_id,
        "course_title": course.post_title if course else cert.certificate_title,
        "student_name": student.display_name or student.user_login if student else "Student",
        "instructor_name": "Sashainfinity",
        "issue_date": cert.issue_date,
        "verification_code": cert.certificate_hash,
        "secure_certificate_id": cert.secure_certificate_id,
        "certificate_hash": cert.certificate_hash
    }

@router.post("/generate/{course_id}")
async def generate_certificate(
    course_id: int,
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Generate certificate for completed course
    """
    # Check if user completed the course
    enrollment = db.query(Enrollment).filter(
        Enrollment.course_id == course_id,
        Enrollment.user_id == current_user.id,
        Enrollment.completion_date.isnot(None)
    ).first()

    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Course not completed or not enrolled"
        )

    # Check if certificate already exists
    existing_certificate = db.query(IssuedCertificate).filter(
        IssuedCertificate.course_id == course_id,
        IssuedCertificate.user_id == current_user.id
    ).first()

    if existing_certificate:
        return {
            "certificate_id": existing_certificate.id,
            "message": "Certificate already generated",
            "certificate_url": existing_certificate.certificate_download_url
        }

    # Generate certificate
    course = enrollment.course
    certificate_hash = CertificateService.generate_verification_code()

    # Generate secure, unrecognizable certificate ID
    secure_certificate_id = CertificateService.generate_secure_certificate_id(
        user_id=current_user.id,
        course_id=course_id,
        issue_date=enrollment.completion_date
    )

    # Create certificate record first to get ID
    new_certificate = IssuedCertificate(
        certificate_id=1,  # Default template ID
        course_id=course_id,
        user_id=current_user.id,
        certificate_hash=certificate_hash,
        secure_certificate_id=secure_certificate_id,
        certificate_title=f"Certificate of Completion - {course.post_title}",
        certificate_content="",
        completion_date=enrollment.completion_date,
        course_completion_percentage=enrollment.course_progress_percentage or 100,
        certificate_download_url=""  # Will be updated after generation
    )

    db.add(new_certificate)
    db.commit()
    db.refresh(new_certificate)

    # Now generate certificate with the ID and hash - wrapped in try/except
    try:
        from app.core.config import get_settings
        settings = get_settings()

        certificate_data = {
            "student_name": current_user.display_name,
            "course_title": course.post_title,
            "instructor_name": course.instructor.display_name,
            "completion_date": enrollment.completion_date,
            "course_duration": course.course_duration,
            "certificate_id": str(new_certificate.id),  # Use actual DB ID
            "certificate_hash": certificate_hash,
            "base_url": settings.FRONTEND_URL  # Frontend URL from config
        }

        certificate_url = await CertificateService.generate_certificate(certificate_data)

        # Update certificate with generated URL
        new_certificate.certificate_download_url = certificate_url
        db.commit()
        db.refresh(new_certificate)
    except Exception as e:
        # If certificate generation fails, delete the database record
        db.delete(new_certificate)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate certificate: {str(e)}"
        )

    # Update enrollment with certificate information
    enrollment.certificate_id = str(new_certificate.id)
    enrollment.certificate_url = certificate_url
    db.commit()

    return {
        "certificate_id": new_certificate.id,
        "message": "Certificate generated successfully",
        "certificate_url": certificate_url
    }

@router.post("/regenerate/{course_id}")
async def regenerate_certificate(
    course_id: int,
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Regenerate certificate for completed course (deletes old one and creates new)
    """
    # Check if user completed the course
    enrollment = db.query(Enrollment).filter(
        Enrollment.course_id == course_id,
        Enrollment.user_id == current_user.id,
        Enrollment.completion_date.isnot(None)
    ).first()

    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Course not completed or not enrolled"
        )

    # Delete existing certificate if any
    existing_certificate = db.query(IssuedCertificate).filter(
        IssuedCertificate.course_id == course_id,
        IssuedCertificate.user_id == current_user.id
    ).first()

    if existing_certificate:
        # Delete the old certificate file if it exists
        import os
        if existing_certificate.certificate_download_url:
            file_path = existing_certificate.certificate_download_url.replace('/certificate-files/', 'certificates/')
            if os.path.exists(file_path):
                os.remove(file_path)

        db.delete(existing_certificate)
        db.commit()

    # Generate new certificate
    course = enrollment.course
    certificate_hash = CertificateService.generate_verification_code()

    # Generate new secure, unrecognizable certificate ID
    secure_certificate_id = CertificateService.generate_secure_certificate_id(
        user_id=current_user.id,
        course_id=course_id,
        issue_date=enrollment.completion_date
    )

    # Save new certificate record first to get ID
    new_certificate = IssuedCertificate(
        certificate_id=1,  # Default template ID
        course_id=course_id,
        user_id=current_user.id,
        certificate_hash=certificate_hash,
        secure_certificate_id=secure_certificate_id,
        certificate_title=f"Certificate of Completion - {course.post_title}",
        certificate_content="",
        completion_date=enrollment.completion_date,
        course_completion_percentage=enrollment.course_progress_percentage or 100,
        certificate_download_url=""  # Will be updated after generation
    )

    db.add(new_certificate)
    db.commit()
    db.refresh(new_certificate)

    # Generate certificate with actual ID - wrapped in try/except
    try:
        from app.core.config import get_settings
        settings = get_settings()

        certificate_data = {
            "student_name": current_user.display_name,
            "course_title": course.post_title,
            "instructor_name": course.instructor.display_name,
            "completion_date": enrollment.completion_date,
            "course_duration": course.course_duration,
            "certificate_id": str(new_certificate.id),  # Use actual DB ID
            "certificate_hash": certificate_hash,
            "base_url": settings.FRONTEND_URL  # Frontend URL from config
        }

        certificate_url = await CertificateService.generate_certificate(certificate_data)

        # Update with generated URL
        new_certificate.certificate_download_url = certificate_url
        db.commit()
        db.refresh(new_certificate)
    except Exception as e:
        # If certificate generation fails, delete the database record
        db.delete(new_certificate)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to regenerate certificate: {str(e)}"
        )

    return {
        "certificate_id": new_certificate.id,
        "message": "Certificate regenerated successfully",
        "certificate_url": certificate_url
    }

@router.get("/{certificate_id}", response_model=CertificateResponse)
async def get_certificate(
    certificate_id: int,
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get specific certificate details
    """
    certificate = db.query(IssuedCertificate).filter(
        IssuedCertificate.id == certificate_id,
        IssuedCertificate.user_id == current_user.id
    ).first()

    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )

    return {
        "id": certificate.id,
        "course_id": certificate.course_id,
        "course_title": certificate.course.post_title,
        "student_name": current_user.display_name,
        "instructor_name": certificate.course.instructor.display_name,
        "completion_date": certificate.completion_date,
        "certificate_url": certificate.certificate_download_url,
        "verification_code": certificate.certificate_hash,
        "issued_at": certificate.created_at
    }

@router.get("/download/{certificate_id}")
async def download_certificate(
    certificate_id: int,
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Download certificate as PDF
    """
    certificate = db.query(IssuedCertificate).filter(
        IssuedCertificate.id == certificate_id,
        IssuedCertificate.user_id == current_user.id
    ).first()

    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )

    # Generate PDF
    pdf_content = await CertificateService.generate_pdf_certificate(certificate)

    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=certificate_{certificate_id}.pdf"
        }
    )

@router.get("/verify/{verification_code}")
async def verify_certificate(
    verification_code: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Verify certificate authenticity (public endpoint)
    Logs all verification attempts for security and audit purposes
    """
    from app.models.certificate import CertificateVerification
    from datetime import datetime

    # Get client info for logging
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")

    certificate = db.query(IssuedCertificate).filter(
        IssuedCertificate.certificate_hash == verification_code
    ).first()

    if not certificate:
        # Log failed verification attempt
        failed_verification = CertificateVerification(
            certificate_id=None,  # Unknown certificate
            certificate_hash=verification_code,
            verified_by_ip=client_ip,
            verified_by_user_agent=user_agent,
            verification_result="invalid"
        )
        db.add(failed_verification)
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found or invalid verification code"
        )

    # Log successful verification
    verification_log = CertificateVerification(
        certificate_id=certificate.id,
        certificate_hash=verification_code,
        verified_by_ip=client_ip,
        verified_by_user_agent=user_agent,
        verification_result="valid"
    )
    db.add(verification_log)
    db.commit()

    return {
        "valid": True,
        "certificate_id": certificate.certificate_hash,
        "student_name": certificate.student.display_name,
        "student_email": certificate.student.user_email,
        "course_title": certificate.course.post_title,
        "course_description": certificate.course.post_content[:200] if certificate.course.post_content else "",
        "instructor_name": certificate.course.instructor.display_name,
        "completion_date": certificate.completion_date,
        "issue_date": certificate.created_at,
        "progress": float(certificate.course_completion_percentage),
        "course_level": "intermediate",  # TODO: Get from course metadata
        "verified_at": datetime.utcnow(),
        "certificate_url": certificate.certificate_download_url,
        "verification_message": f"This certificate was issued to {certificate.student.display_name} upon successful completion of {certificate.course.post_title}."
    }

# Certificate Template Management (Instructor/Admin)

@router.get("/templates/", response_model=List[CertificateTemplateResponse])
async def get_certificate_templates(
    current_user: User = Depends(AuthService.require_instructor),
    db: Session = Depends(get_db)
):
    """
    Get certificate templates (instructor/admin only)
    """
    if current_user.role == "admin":
        templates = db.query(CertificateTemplate).all()
    else:
        templates = db.query(CertificateTemplate).filter(
            CertificateTemplate.created_by == current_user.id
        ).all()

    return [
        {
            "id": template.id,
            "name": template.name,
            "description": template.description,
            "template_data": template.template_data,
            "is_default": template.is_default,
            "created_by": template.created_by,
            "created_at": template.created_at
        }
        for template in templates
    ]

@router.post("/templates/", response_model=CertificateTemplateResponse)
async def create_certificate_template(
    template_data: CertificateTemplateCreate,
    current_user: User = Depends(AuthService.require_instructor),
    db: Session = Depends(get_db)
):
    """
    Create new certificate template
    """
    new_template = CertificateTemplate(
        name=template_data.name,
        description=template_data.description,
        template_data=template_data.template_data,
        is_default=False,
        created_by=current_user.id
    )

    db.add(new_template)
    db.commit()
    db.refresh(new_template)

    return {
        "id": new_template.id,
        "name": new_template.name,
        "description": new_template.description,
        "template_data": new_template.template_data,
        "is_default": new_template.is_default,
        "created_by": new_template.created_by,
        "created_at": new_template.created_at
    }

@router.put("/templates/{template_id}")
async def update_certificate_template(
    template_id: int,
    template_data: CertificateTemplateCreate,
    current_user: User = Depends(AuthService.require_instructor),
    db: Session = Depends(get_db)
):
    """
    Update certificate template
    """
    template = db.query(CertificateTemplate).filter(
        CertificateTemplate.id == template_id
    ).first()

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )

    # Check permissions
    if current_user.role != "admin" and template.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this template"
        )

    # Update template
    template.name = template_data.name
    template.description = template_data.description
    template.template_data = template_data.template_data

    db.commit()

    return {"message": "Template updated successfully"}

@router.delete("/templates/{template_id}")
async def delete_certificate_template(
    template_id: int,
    current_user: User = Depends(AuthService.require_instructor),
    db: Session = Depends(get_db)
):
    """
    Delete certificate template
    """
    template = db.query(CertificateTemplate).filter(
        CertificateTemplate.id == template_id
    ).first()

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )

    # Check permissions
    if current_user.role != "admin" and template.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this template"
        )

    # Cannot delete default template
    if template.is_default:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete default template"
        )

    db.delete(template)
    db.commit()

    return {"message": "Template deleted successfully"}
@router.get("/templates/list")
async def list_certificate_templates(
    db: Session = Depends(get_db)
):
    """Get all certificate templates - public for course selection"""
    from sqlalchemy import text
    rows = db.execute(text("""
        SELECT id, post_title, background_color, title_font_color, title_font_family,
               body_font_family, certificate_orientation
        FROM certificates WHERE post_status='publish' ORDER BY id
    """)).fetchall()
    return [{"id": r.id, "name": r.post_title, "bg_color": r.background_color,
             "title_color": r.title_font_color, "font": r.title_font_family,
             "orientation": r.certificate_orientation} for r in rows]
