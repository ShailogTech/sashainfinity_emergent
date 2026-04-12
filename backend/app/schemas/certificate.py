"""
Certificate Schemas - Pydantic models for certificate endpoints
"""

from pydantic import BaseModel, validator
from typing import Dict, Any, Optional
from datetime import datetime

class CertificateResponse(BaseModel):
    id: int
    course_id: int
    course_title: str
    student_name: str
    instructor_name: str
    completion_date: datetime
    certificate_url: str
    verification_code: str
    issued_at: datetime

class CertificateTemplateCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    template_data: Dict[str, Any]

    @validator('name')
    def validate_name(cls, v):
        if len(v) < 3:
            raise ValueError('Template name must be at least 3 characters')
        return v

    @validator('template_data')
    def validate_template_data(cls, v):
        required_fields = ['background', 'text_elements', 'dimensions']
        for field in required_fields:
            if field not in v:
                raise ValueError(f'Template data must include {field}')
        return v

class CertificateTemplateResponse(BaseModel):
    id: int
    name: str
    description: str
    template_data: Dict[str, Any]
    is_default: bool
    created_by: int
    created_at: datetime