"""
Orders Router - Simple checkout endpoint for cart functionality
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone
import uuid

from app.core.database import get_db
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.payment import Payment, Order, OrderItem, OrderStatus, PaymentStatus
from app.models.coupon import Coupon, CouponUsage, DiscountType, CouponApplicability
from app.services.auth_service import AuthService
from pydantic import BaseModel
from sqlalchemy import and_

router = APIRouter()

class OrderCreate(BaseModel):
    course_ids: List[int]
    coupon_code: str = None

class OrderItemResponse(BaseModel):
    course_id: int
    price_at_purchase: float

class OrderResponse(BaseModel):
    id: int
    total_amount: float
    discount_amount: float = 0
    status: str
    created_at: datetime
    items: List[OrderItemResponse]
    coupon_code: str = None

    class Config:
        from_attributes = True

@router.post("/", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create order and enroll student in courses (mock payment)
    """
    if not order_data.course_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No courses selected"
        )

    total_amount = 0.0
    order_items = []

    # Process each course
    for course_id in order_data.course_ids:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Course with ID {course_id} not found"
            )

        # Check if already enrolled
        existing_enrollment = db.query(Enrollment).filter(
            Enrollment.course_id == course_id,
            Enrollment.user_id == current_user.id
        ).first()

        if existing_enrollment:
            continue  # Skip if already enrolled

        # Add to total
        price = course.course_sale_price if course.course_sale_price and course.course_sale_price > 0 else course.course_price
        total_amount += float(price)

        order_items.append({
            "course_id": course.id,
            "price_at_purchase": price
        })

    if not order_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already enrolled in all selected courses"
        )

    # Validate and apply coupon if provided
    coupon = None
    discount_amount = 0.0

    if order_data.coupon_code:
        coupon = db.query(Coupon).filter(
            Coupon.code == order_data.coupon_code.upper()
        ).first()

        if not coupon:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid coupon code"
            )

        # Validate coupon (same logic as validation endpoint)
        now = datetime.now(timezone.utc)

        if not coupon.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This coupon is no longer active"
            )

        if coupon.valid_from and now < coupon.valid_from:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This coupon is not yet valid"
            )

        if coupon.valid_until and now > coupon.valid_until:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This coupon has expired"
            )

        if total_amount < float(coupon.minimum_purchase_amount):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Minimum purchase amount of ₹{float(coupon.minimum_purchase_amount)} required"
            )

        if coupon.usage_limit and coupon.usage_count >= coupon.usage_limit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This coupon has reached its usage limit"
            )

        # Check per-user usage limit
        user_usage_count = db.query(CouponUsage).filter(
            and_(CouponUsage.coupon_id == coupon.id, CouponUsage.user_id == current_user.id)
        ).count()

        if user_usage_count >= coupon.per_user_limit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"You have already used this coupon the maximum number of times"
            )

        # Check course applicability
        if coupon.applicability == 'specific_courses':
            applicable_course_ids = [r.course_id for r in coupon.course_restrictions]
            if not any(course_id in applicable_course_ids for course_id in order_data.course_ids):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This coupon is not applicable to the selected courses"
                )

        # Calculate discount
        if coupon.discount_type == 'percentage':
            discount_amount = (total_amount * float(coupon.discount_value)) / 100
        else:
            discount_amount = min(float(coupon.discount_value), total_amount)

    final_amount = total_amount - discount_amount

    # Create order
    order_key = f"ORDER_{uuid.uuid4().hex[:12].upper()}"
    order = Order(
        user_id=current_user.id,
        order_key=order_key,
        total_amount=final_amount,
        subtotal_amount=total_amount,
        discount_amount=discount_amount,
        order_status=OrderStatus.COMPLETED,  # Mock payment - instant completion
        payment_method="mock",
        payment_method_title="Mock Payment",
        transaction_id=f"MOCK_{uuid.uuid4().hex[:12].upper()}",
        date_paid=datetime.now(),
        date_completed=datetime.now()
    )

    db.add(order)
    db.flush()  # Get order ID

    # Create order items
    for item in order_items:
        course = db.query(Course).filter(Course.id == item["course_id"]).first()
        order_item = OrderItem(
            order_id=order.id,
            course_id=item["course_id"],
            order_item_name=course.post_title if course else f"Course {item['course_id']}",
            order_item_type="line_item",
            quantity=1,
            subtotal=float(item["price_at_purchase"]),
            total=float(item["price_at_purchase"])
        )
        db.add(order_item)

    # Create payment record
    payment = Payment(
        user_id=current_user.id,
        order_id=order.id,
        payment_method="mock",
        gateway_transaction_id=f"MOCK_TXN_{uuid.uuid4().hex[:12].upper()}",
        gateway_payment_id=f"MOCK_PAY_{uuid.uuid4().hex[:12].upper()}",
        gateway_order_id=order_key,
        amount=float(final_amount),
        currency="INR",
        payment_status=PaymentStatus.COMPLETED,
        processed_date=datetime.now()
    )

    db.add(payment)

    # Record coupon usage if coupon was applied
    if coupon:
        coupon_usage = CouponUsage(
            coupon_id=coupon.id,
            user_id=current_user.id,
            order_id=order.id,
            discount_amount=discount_amount
        )
        db.add(coupon_usage)

        # Increment coupon usage count
        coupon.usage_count = (coupon.usage_count or 0) + 1

    # Enroll student in all courses
    for item in order_items:
        enrollment = Enrollment(
            course_id=item["course_id"],
            user_id=current_user.id,
            enrollment_status="enrolled"
        )
        db.add(enrollment)

        # Update course enrollment count
        course = db.query(Course).filter(Course.id == item["course_id"]).first()
        if course:
            course.total_enrollments = (course.total_enrollments or 0) + 1

    db.commit()
    db.refresh(order)

    # Send order confirmation email with invoice
    try:
        from app.services.email_service import EmailService

        # Prepare order items for email
        email_items = []
        for item in order_items:
            course = db.query(Course).filter(Course.id == item["course_id"]).first()
            email_items.append({
                "title": course.post_title if course else f"Course {item['course_id']}",
                "price": float(item["price_at_purchase"])
            })

        # Send email
        EmailService.send_order_confirmation(
            customer_email=current_user.email,
            customer_name=current_user.display_name or current_user.email,
            order_id=order.id,
            order_items=email_items,
            total_amount=float(final_amount),
            transaction_id=order.transaction_id
        )
    except Exception as e:
        # Log error but don't fail the order
        print(f"Failed to send order confirmation email: {e}")

    return {
        "id": order.id,
        "total_amount": final_amount,
        "discount_amount": discount_amount,
        "status": "completed",
        "created_at": order.created_at,
        "items": order_items,
        "coupon_code": order_data.coupon_code if coupon else None
    }

@router.get("/me")
async def get_my_orders(
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get user's orders
    """
    orders = db.query(Order).filter(
        Order.user_id == current_user.id
    ).order_by(Order.created_at.desc()).all()

    return orders
