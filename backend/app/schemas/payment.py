"""
Payment Schemas - Pydantic models for payment endpoints
"""

from pydantic import BaseModel, validator
from typing import Optional, Dict, Any
from datetime import datetime

class PaymentIntentRequest(BaseModel):
    course_id: int

class PaymentIntentResponse(BaseModel):
    payment_intent_id: Optional[str]
    client_secret: Optional[str]
    amount: float
    currency: str
    status: str
    enrollment_id: Optional[int]
    is_free_course: bool

class PaymentConfirmRequest(BaseModel):
    payment_intent_id: str
    payment_method_id: Optional[str] = None

class PaymentResponse(BaseModel):
    id: int
    payment_intent_id: str
    course_id: int
    student_id: int
    amount: float
    currency: str
    status: str
    enrollment_id: int
    created_at: datetime

class TransactionResponse(BaseModel):
    id: int
    course_title: str
    amount: float
    currency: str
    status: str
    payment_method: str
    transaction_date: datetime

class RefundRequest(BaseModel):
    payment_id: int
    reason: str

    @validator('reason')
    def validate_reason(cls, v):
        if len(v) < 10:
            raise ValueError('Refund reason must be at least 10 characters')
        return v