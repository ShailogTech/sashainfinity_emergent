"""
Payment Router - SashaInfinity LMS API
Handles payment processing, enrollment, and transaction management
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json
from datetime import datetime

from app.core.database import get_db
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.payment import Payment, Order
from app.services.auth_service import AuthService
from app.services.payment_service import PaymentService
from app.schemas.payment import (
    PaymentIntentRequest,
    PaymentIntentResponse,
    PaymentConfirmRequest,
    PaymentResponse,
    TransactionResponse,
    RefundRequest
)

router = APIRouter()

@router.post("/create-payment-intent", response_model=PaymentIntentResponse)
async def create_payment_intent(
    request: PaymentIntentRequest,
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create payment intent for course enrollment
    """
    course = db.query(Course).filter(Course.id == request.course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    if course.course_status != "published":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Course is not available for enrollment"
        )

    # Check if already enrolled
    existing_enrollment = db.query(Enrollment).filter(
        Enrollment.course_id == request.course_id,
        Enrollment.user_id == current_user.id
    ).first()

    if existing_enrollment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already enrolled in this course"
        )

    # For free courses, enroll directly
    if course.course_price == 0:
        enrollment = Enrollment(
            course_id=course.id,
            user_id=current_user.id,
            enrollment_status="enrolled"
        )
        db.add(enrollment)

        # Update course enrollment count
        course.total_enrollments = (course.total_enrollments or 0) + 1
        db.commit()

        return {
            "payment_intent_id": None,
            "client_secret": None,
            "amount": 0,
            "currency": "INR",
            "status": "succeeded",
            "enrollment_id": enrollment.id,
            "is_free_course": True
        }

    # Create payment intent for paid courses
    payment_intent = await PaymentService.create_payment_intent(
        amount=int(course.course_price * 100),  # Convert to paise
        currency="INR",
        metadata={
            "course_id": str(course.id),
            "student_id": str(current_user.id),
            "course_title": course.course_title
        }
    )

    # Store payment record
    payment = Payment(
        payment_intent_id=payment_intent["id"],
        user_id=current_user.id,
        course_id=course.id,
        student_id=current_user.id,
        amount=course.course_price,
        currency="INR",
        status="pending"
    )

    db.add(payment)
    db.commit()

    return {
        "payment_intent_id": payment_intent["id"],
        "client_secret": payment_intent["client_secret"],
        "amount": course.course_price,
        "currency": "INR",
        "status": "pending",
        "enrollment_id": None,
        "is_free_course": False
    }

@router.post("/confirm-payment", response_model=PaymentResponse)
async def confirm_payment(
    request: PaymentConfirmRequest,
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Confirm payment and complete enrollment
    """
    payment = db.query(Payment).filter(
        Payment.payment_intent_id == request.payment_intent_id,
        Payment.student_id == current_user.id
    ).first()

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )

    # Verify payment with payment provider
    payment_status = await PaymentService.verify_payment(request.payment_intent_id)

    if payment_status["status"] != "succeeded":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment not confirmed"
        )

    # Update payment status
    payment.status = "completed"
    payment.razorpay_payment_id = payment_status.get("razorpay_payment_id")

    # Create enrollment
    enrollment = Enrollment(
        course_id=payment.course_id,
        student_id=payment.student_id,
        enrollment_status="enrolled"
    )

    db.add(enrollment)

    # Update course enrollment count
    course = db.query(Course).filter(Course.id == payment.course_id).first()
    course.total_enrollments = (course.total_enrollments or 0) + 1

    # Create transaction record
    transaction = Transaction(
        payment_id=payment.id,
        transaction_type="enrollment",
        amount=payment.amount,
        status="completed",
        description=f"Enrollment in course: {course.course_title}"
    )

    db.add(transaction)
    db.commit()
    db.refresh(enrollment)

    return {
        "id": payment.id,
        "payment_intent_id": payment.payment_intent_id,
        "course_id": payment.course_id,
        "student_id": payment.student_id,
        "amount": payment.amount,
        "currency": payment.currency,
        "status": payment.status,
        "enrollment_id": enrollment.id,
        "created_at": payment.created_at
    }

@router.get("/transactions", response_model=List[TransactionResponse])
async def get_user_transactions(
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get user's payment transactions
    """
    payments = db.query(Payment).filter(
        Payment.student_id == current_user.id
    ).order_by(Payment.created_at.desc()).all()

    return [
        {
            "id": payment.id,
            "course_title": payment.course.course_title,
            "amount": payment.amount,
            "currency": payment.currency,
            "status": payment.status,
            "payment_method": "razorpay",
            "transaction_date": payment.created_at
        }
        for payment in payments
    ]

@router.post("/webhook")
async def payment_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Handle payment provider webhooks
    """
    payload = await request.body()
    headers = dict(request.headers)

    # Verify webhook signature
    if not PaymentService.verify_webhook_signature(payload, headers):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature"
        )

    # Process webhook event
    event_data = json.loads(payload)

    if event_data["event"] == "payment.captured":
        payment_intent_id = event_data["payload"]["payment"]["entity"]["id"]

        payment = db.query(Payment).filter(
            Payment.payment_intent_id == payment_intent_id
        ).first()

        if payment and payment.status == "pending":
            payment.status = "completed"
            payment.razorpay_payment_id = event_data["payload"]["payment"]["entity"]["id"]

            # Create enrollment if not exists
            existing_enrollment = db.query(Enrollment).filter(
                Enrollment.course_id == payment.course_id,
                Enrollment.student_id == payment.student_id
            ).first()

            if not existing_enrollment:
                enrollment = Enrollment(
                    course_id=payment.course_id,
                    student_id=payment.student_id,
                    enrollment_status="enrolled"
                )
                db.add(enrollment)

                # Update course enrollment count
                course = db.query(Course).filter(Course.id == payment.course_id).first()
                course.total_enrollments = (course.total_enrollments or 0) + 1

            db.commit()

    elif event_data["event"] == "payment.failed":
        payment_intent_id = event_data["payload"]["payment"]["entity"]["id"]

        payment = db.query(Payment).filter(
            Payment.payment_intent_id == payment_intent_id
        ).first()

        if payment:
            payment.status = "failed"
            db.commit()

    return {"status": "success"}

@router.post("/refund")
async def request_refund(
    request: RefundRequest,
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Request refund for a course enrollment
    """
    payment = db.query(Payment).filter(
        Payment.id == request.payment_id,
        Payment.student_id == current_user.id,
        Payment.status == "completed"
    ).first()

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found or not eligible for refund"
        )

    # Check refund eligibility (e.g., within 30 days, less than 30% course completion)
    enrollment = db.query(Enrollment).filter(
        Enrollment.course_id == payment.course_id,
        Enrollment.student_id == payment.student_id
    ).first()

    if not PaymentService.is_refund_eligible(payment, enrollment):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not eligible for refund"
        )

    # Process refund
    refund_result = await PaymentService.process_refund(
        payment.razorpay_payment_id,
        int(payment.amount * 100),  # Convert to paise
        request.reason
    )

    if refund_result["status"] == "processed":
        # Update payment status
        payment.status = "refunded"

        # Cancel enrollment
        enrollment.enrollment_status = "cancelled"

        # Create refund transaction
        transaction = Transaction(
            payment_id=payment.id,
            transaction_type="refund",
            amount=-payment.amount,  # Negative amount for refund
            status="completed",
            description=f"Refund for course: {payment.course.course_title}"
        )

        db.add(transaction)
        db.commit()

    return {
        "status": refund_result["status"],
        "refund_id": refund_result["refund_id"],
        "message": "Refund processed successfully"
    }

@router.get("/earnings")
async def get_instructor_earnings(
    current_user: User = Depends(AuthService.require_instructor),
    db: Session = Depends(get_db)
):
    """
    Get instructor earnings summary
    """
    courses = db.query(Course).filter(
        Course.instructor_id == current_user.id
    ).all()

    total_earnings = 0
    course_earnings = []

    for course in courses:
        course_payments = db.query(Payment).filter(
            Payment.course_id == course.id,
            Payment.status == "completed"
        ).all()

        course_total = sum([p.amount for p in course_payments])
        total_earnings += course_total

        course_earnings.append({
            "course_id": course.id,
            "course_title": course.course_title,
            "total_sales": len(course_payments),
            "total_earnings": course_total,
            "course_price": course.course_price
        })

    return {
        "total_earnings": total_earnings,
        "total_sales": sum([len(db.query(Payment).filter(
            Payment.course_id == c.id,
            Payment.status == "completed"
        ).all()) for c in courses]),
        "course_earnings": course_earnings
    }

@router.post("/create-order")
async def create_razorpay_order(
    request: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """Create Razorpay order for course purchase"""
    import razorpay
    import os
    course_id = request.get("course_id")
    amount = request.get("amount", 0)
    
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    key_id = os.getenv("RAZORPAY_KEY_ID", "")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET", "")
    
    client = razorpay.Client(auth=(key_id, key_secret))
    order_amount = max(int(float(amount) * 100), 100)  # Convert to paise, minimum 100 paise
    
    order = client.order.create({
        "amount": order_amount,
        "currency": "INR",
        "receipt": f"course_{course_id}_user_{current_user.id}",
        "notes": {
            "course_id": str(course_id),
            "user_id": str(current_user.id)
        }
    })
    
    return {
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "key_id": key_id
    }


@router.post("/verify")
async def verify_razorpay_payment(
    request: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """Verify Razorpay payment and enroll user"""
    import razorpay
    import hmac
    import hashlib
    import os
    
    razorpay_order_id = request.get("razorpay_order_id")
    razorpay_payment_id = request.get("razorpay_payment_id")
    razorpay_signature = request.get("razorpay_signature")
    course_id = request.get("course_id")
    
    # Verify signature
    key_secret = os.getenv("RAZORPAY_KEY_SECRET", "")
    msg = f"{razorpay_order_id}|{razorpay_payment_id}"
    generated_signature = hmac.new(
        key_secret.encode(),
        msg.encode(),
        hashlib.sha256
    ).hexdigest()
    
    if generated_signature != razorpay_signature:
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    
    # Enroll user in course
    from app.models.enrollment import Enrollment
    existing = db.query(Enrollment).filter(
        Enrollment.course_id == course_id,
        Enrollment.user_id == current_user.id
    ).first()

    if existing:
        # Reactivate cancelled/suspended enrollment
        existing.enrollment_status = "enrolled"
        db.commit()
    else:
        enrollment = Enrollment(
            course_id=int(course_id),
            user_id=current_user.id,
            enrollment_status="enrolled"
        )
        db.add(enrollment)
        # Update course enrollment count
        course = db.query(Course).filter(Course.id == int(course_id)).first()
        if course:
            course.total_enrollments = (course.total_enrollments or 0) + 1
        db.commit()
    
    return {"success": True, "message": "Payment verified and enrolled successfully"}
