"""
Coupon Management Router - Admin coupon CRUD and validation
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from datetime import datetime, timezone
from decimal import Decimal

from app.core.database import get_db
from app.models.user import User
from app.models.coupon import Coupon, CouponCourseRestriction, CouponUsage, DiscountType, CouponApplicability
from app.models.course import Course
from app.services.auth_service import AuthService
from app.schemas.coupon import (
    CouponCreate,
    CouponUpdate,
    CouponResponse,
    CouponListResponse,
    CouponValidationRequest,
    CouponValidationResponse,
    ApplyCouponRequest,
    PaginatedCouponsResponse
)

router = APIRouter()

@router.post("/", response_model=CouponResponse)
async def create_coupon(
    coupon_data: CouponCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Create a new coupon (Admin only)
    """
    # Check if user is admin
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create coupons"
        )

    # Check if coupon code already exists
    existing_coupon = db.query(Coupon).filter(Coupon.code == coupon_data.code).first()
    if existing_coupon:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Coupon code '{coupon_data.code}' already exists"
        )

    # Validate course IDs if applicability is specific_courses
    if coupon_data.applicability == "specific_courses":
        if not coupon_data.course_ids or len(coupon_data.course_ids) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Course IDs are required for specific_courses applicability"
            )

        # Check if all courses exist
        courses = db.query(Course).filter(Course.id.in_(coupon_data.course_ids)).all()
        if len(courses) != len(coupon_data.course_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Some course IDs are invalid"
            )

    # Create coupon
    new_coupon = Coupon(
        code=coupon_data.code,
        description=coupon_data.description,
        discount_type=coupon_data.discount_type,
        discount_value=Decimal(str(coupon_data.discount_value)),
        applicability=coupon_data.applicability,
        usage_limit=coupon_data.usage_limit,
        per_user_limit=coupon_data.per_user_limit,
        minimum_purchase_amount=Decimal(str(coupon_data.minimum_purchase_amount)),
        valid_from=coupon_data.valid_from or datetime.now(timezone.utc),
        valid_until=coupon_data.valid_until,
        is_active=coupon_data.is_active,
        created_by=current_user.id
    )

    db.add(new_coupon)
    db.flush()

    # Add course restrictions if applicability is specific_courses
    if coupon_data.applicability == "specific_courses" and coupon_data.course_ids:
        for course_id in coupon_data.course_ids:
            restriction = CouponCourseRestriction(
                coupon_id=new_coupon.id,
                course_id=course_id
            )
            db.add(restriction)

    db.commit()
    db.refresh(new_coupon)

    # Get course IDs for response
    course_ids = []
    if new_coupon.applicability == 'specific_courses':
        course_ids = [r.course_id for r in new_coupon.course_restrictions]

    return CouponResponse(
        id=new_coupon.id,
        code=new_coupon.code,
        description=new_coupon.description,
        discount_type=new_coupon.discount_type,
        discount_value=float(new_coupon.discount_value),
        applicability=new_coupon.applicability,
        usage_limit=new_coupon.usage_limit,
        usage_count=new_coupon.usage_count,
        per_user_limit=new_coupon.per_user_limit,
        minimum_purchase_amount=float(new_coupon.minimum_purchase_amount),
        valid_from=new_coupon.valid_from,
        valid_until=new_coupon.valid_until,
        is_active=new_coupon.is_active,
        created_by=new_coupon.created_by,
        created_at=new_coupon.created_at,
        updated_at=new_coupon.updated_at,
        course_ids=course_ids
    )

@router.get("/", response_model=PaginatedCouponsResponse)
async def get_coupons(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get list of coupons with pagination (Admin only)
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view coupons"
        )

    query = db.query(Coupon)

    # Apply filters
    if search:
        query = query.filter(
            or_(
                Coupon.code.ilike(f"%{search}%"),
                Coupon.description.ilike(f"%{search}%")
            )
        )

    if is_active is not None:
        query = query.filter(Coupon.is_active == is_active)

    # Get total count
    total = query.count()

    # Calculate pagination
    skip = (page - 1) * page_size
    total_pages = (total + page_size - 1) // page_size

    # Get coupons
    coupons = query.order_by(Coupon.created_at.desc()).offset(skip).limit(page_size).all()

    coupons_data = [
        CouponListResponse(
            id=coupon.id,
            code=coupon.code,
            description=coupon.description,
            discount_type=coupon.discount_type,
            discount_value=float(coupon.discount_value),
            applicability=coupon.applicability,
            usage_count=coupon.usage_count,
            usage_limit=coupon.usage_limit,
            is_active=coupon.is_active,
            valid_until=coupon.valid_until,
            created_at=coupon.created_at
        )
        for coupon in coupons
    ]

    return PaginatedCouponsResponse(
        coupons=coupons_data,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/{coupon_id}", response_model=CouponResponse)
async def get_coupon(
    coupon_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get coupon details (Admin only)
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view coupons"
        )

    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found"
        )

    # Get course IDs for response
    course_ids = []
    if coupon.applicability == 'specific_courses':
        course_ids = [r.course_id for r in coupon.course_restrictions]

    return CouponResponse(
        id=coupon.id,
        code=coupon.code,
        description=coupon.description,
        discount_type=coupon.discount_type,
        discount_value=float(coupon.discount_value),
        applicability=coupon.applicability,
        usage_limit=coupon.usage_limit,
        usage_count=coupon.usage_count,
        per_user_limit=coupon.per_user_limit,
        minimum_purchase_amount=float(coupon.minimum_purchase_amount),
        valid_from=coupon.valid_from,
        valid_until=coupon.valid_until,
        is_active=coupon.is_active,
        created_by=coupon.created_by,
        created_at=coupon.created_at,
        updated_at=coupon.updated_at,
        course_ids=course_ids
    )

@router.put("/{coupon_id}", response_model=CouponResponse)
async def update_coupon(
    coupon_id: int,
    coupon_data: CouponUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Update coupon (Admin only)
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update coupons"
        )

    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found"
        )

    # Update fields
    if coupon_data.description is not None:
        coupon.description = coupon_data.description
    if coupon_data.discount_value is not None:
        coupon.discount_value = Decimal(str(coupon_data.discount_value))
    if coupon_data.applicability is not None:
        coupon.applicability = coupon_data.applicability
    if coupon_data.usage_limit is not None:
        coupon.usage_limit = coupon_data.usage_limit
    if coupon_data.per_user_limit is not None:
        coupon.per_user_limit = coupon_data.per_user_limit
    if coupon_data.minimum_purchase_amount is not None:
        coupon.minimum_purchase_amount = Decimal(str(coupon_data.minimum_purchase_amount))
    if coupon_data.valid_from is not None:
        coupon.valid_from = coupon_data.valid_from
    if coupon_data.valid_until is not None:
        coupon.valid_until = coupon_data.valid_until
    if coupon_data.is_active is not None:
        coupon.is_active = coupon_data.is_active

    # Update course restrictions if provided
    if coupon_data.course_ids is not None:
        # Delete existing restrictions
        db.query(CouponCourseRestriction).filter(
            CouponCourseRestriction.coupon_id == coupon_id
        ).delete()

        # Add new restrictions
        for course_id in coupon_data.course_ids:
            restriction = CouponCourseRestriction(
                coupon_id=coupon_id,
                course_id=course_id
            )
            db.add(restriction)

    db.commit()
    db.refresh(coupon)

    # Get course IDs for response
    course_ids = []
    if coupon.applicability == 'specific_courses':
        course_ids = [r.course_id for r in coupon.course_restrictions]

    return CouponResponse(
        id=coupon.id,
        code=coupon.code,
        description=coupon.description,
        discount_type=coupon.discount_type,
        discount_value=float(coupon.discount_value),
        applicability=coupon.applicability,
        usage_limit=coupon.usage_limit,
        usage_count=coupon.usage_count,
        per_user_limit=coupon.per_user_limit,
        minimum_purchase_amount=float(coupon.minimum_purchase_amount),
        valid_from=coupon.valid_from,
        valid_until=coupon.valid_until,
        is_active=coupon.is_active,
        created_by=coupon.created_by,
        created_at=coupon.created_at,
        updated_at=coupon.updated_at,
        course_ids=course_ids
    )

@router.delete("/{coupon_id}")
async def delete_coupon(
    coupon_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Delete coupon (Admin only)
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete coupons"
        )

    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found"
        )

    db.delete(coupon)
    db.commit()

    return {"message": "Coupon deleted successfully"}

@router.post("/validate", response_model=CouponValidationResponse)
async def validate_coupon(
    validation_data: CouponValidationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Validate a coupon code for given courses and amount
    """
    # Find coupon by code
    coupon = db.query(Coupon).filter(
        Coupon.code == validation_data.code.upper()
    ).first()

    if not coupon:
        return CouponValidationResponse(
            valid=False,
            message="Invalid coupon code"
        )

    # Check if coupon is active
    if not coupon.is_active:
        return CouponValidationResponse(
            valid=False,
            message="This coupon is no longer active"
        )

    # Check validity dates
    now = datetime.now(timezone.utc)
    valid_from = coupon.valid_from.replace(tzinfo=timezone.utc) if coupon.valid_from and coupon.valid_from.tzinfo is None else coupon.valid_from
    if valid_from and now < valid_from:
        return CouponValidationResponse(
            valid=False,
            message="This coupon is not yet valid"
        )

    if coupon.valid_until and now > coupon.valid_until:
        return CouponValidationResponse(
            valid=False,
            message="This coupon has expired"
        )

    # Check minimum purchase amount
    if validation_data.total_amount < float(coupon.minimum_purchase_amount):
        return CouponValidationResponse(
            valid=False,
            message=f"Minimum purchase amount of ₹{float(coupon.minimum_purchase_amount)} required"
        )

    # Check total usage limit
    if coupon.usage_limit and coupon.usage_count >= coupon.usage_limit:
        return CouponValidationResponse(
            valid=False,
            message="This coupon has reached its usage limit"
        )

    # Check per-user usage limit
    user_usage_count = db.query(CouponUsage).filter(
        and_(
            CouponUsage.coupon_id == coupon.id,
            CouponUsage.user_id == current_user.id
        )
    ).count()

    if user_usage_count >= coupon.per_user_limit:
        return CouponValidationResponse(
            valid=False,
            message=f"You have already used this coupon the maximum number of times ({coupon.per_user_limit})"
        )

    # Check course applicability
    if coupon.applicability == 'specific_courses':
        applicable_course_ids = [r.course_id for r in coupon.course_restrictions]
        user_course_ids = set(validation_data.course_ids)

        # Check if any of the user's courses match the applicable courses
        if not any(course_id in applicable_course_ids for course_id in user_course_ids):
            return CouponValidationResponse(
                valid=False,
                message="This coupon is not applicable to the selected courses"
            )

    # Calculate discount
    discount_amount = 0
    if coupon.discount_type == 'percentage':
        discount_amount = (validation_data.total_amount * float(coupon.discount_value)) / 100
    else:  # Fixed amount
        discount_amount = min(float(coupon.discount_value), validation_data.total_amount)

    final_amount = max(0, validation_data.total_amount - discount_amount)

    return CouponValidationResponse(
        valid=True,
        message="Coupon applied successfully",
        discount_amount=discount_amount,
        final_amount=final_amount,
        coupon_id=coupon.id,
        discount_type=coupon.discount_type,
        discount_value=float(coupon.discount_value)
    )
