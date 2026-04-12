"""
Payment and order models - Premium SashaInfinity LMS payment structure with WooCommerce compatibility
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.types import Numeric as Decimal, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class OrderStatus(enum.Enum):
    """Order status enumeration"""
    PENDING = "pending"
    PROCESSING = "processing"
    ON_HOLD = "on-hold"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    FAILED = "failed"

class PaymentStatus(enum.Enum):
    """Payment status enumeration"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class Order(Base):
    """
    Orders - Replicated from WooCommerce wc_orders table
    """
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Order details
    order_key = Column(String(255), unique=True, nullable=False)
    order_status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    currency = Column(String(3), default="INR")

    # Pricing
    total_amount = Column(Decimal(13, 4), default=0)
    subtotal_amount = Column(Decimal(13, 4), default=0)
    tax_amount = Column(Decimal(13, 4), default=0)
    shipping_amount = Column(Decimal(13, 4), default=0)
    discount_amount = Column(Decimal(13, 4), default=0)

    # Payment details
    payment_method = Column(String(255), default="")
    payment_method_title = Column(String(255), default="")
    transaction_id = Column(String(255), default="")

    # Billing information
    billing_first_name = Column(String(255), default="")
    billing_last_name = Column(String(255), default="")
    billing_company = Column(String(255), default="")
    billing_address_1 = Column(String(255), default="")
    billing_address_2 = Column(String(255), default="")
    billing_city = Column(String(255), default="")
    billing_state = Column(String(255), default="")
    billing_postcode = Column(String(20), default="")
    billing_country = Column(String(2), default="")
    billing_email = Column(String(255), default="")
    billing_phone = Column(String(20), default="")

    # Order notes
    customer_note = Column(Text, default="")
    order_notes = Column(Text, default="")

    # Timestamps
    date_created = Column(DateTime(timezone=True), server_default=func.now())
    date_modified = Column(DateTime(timezone=True), onupdate=func.now())
    date_paid = Column(DateTime(timezone=True), nullable=True)
    date_completed = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order")
    enrollments = relationship("Enrollment", back_populates="order")

    def __repr__(self):
        return f"<Order(id={self.id}, user_id={self.user_id}, status={self.order_status}, total={self.total_amount})>"

class OrderItem(Base):
    """
    Order items - Replicated from WooCommerce wc_order_items table
    """
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)

    # Item details
    order_item_name = Column(Text, nullable=False)
    order_item_type = Column(String(200), default="line_item")

    # Pricing
    quantity = Column(Integer, default=1)
    subtotal = Column(Decimal(13, 4), default=0)
    subtotal_tax = Column(Decimal(13, 4), default=0)
    total = Column(Decimal(13, 4), default=0)
    total_tax = Column(Decimal(13, 4), default=0)

    # Meta data
    product_data = Column(JSON, default={})

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    order = relationship("Order", back_populates="order_items")
    course = relationship("Course")

    def __repr__(self):
        return f"<OrderItem(id={self.id}, order_id={self.order_id}, course_id={self.course_id})>"

class Payment(Base):
    """
    Payments - Custom table for payment tracking
    """
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Payment gateway details
    payment_method = Column(String(50), nullable=False)  # razorpay, paypal, stripe, etc.
    gateway_transaction_id = Column(String(255), default="")
    gateway_payment_id = Column(String(255), default="")
    gateway_order_id = Column(String(255), default="")

    # Payment details
    amount = Column(Decimal(13, 4), nullable=False)
    currency = Column(String(3), default="INR")
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)

    # Gateway response
    gateway_response = Column(JSON, default={})
    failure_reason = Column(Text, default="")

    # Timestamps
    payment_date = Column(DateTime(timezone=True), server_default=func.now())
    processed_date = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    order = relationship("Order", back_populates="payments")
    user = relationship("User")

    def __repr__(self):
        return f"<Payment(id={self.id}, order_id={self.order_id}, status={self.payment_status}, amount={self.amount})>"

# NOTE: Coupon model moved to app/models/coupon.py
# Old WooCommerce-style coupon model commented out in favor of new comprehensive coupon system

class Earning(Base):
    """
    Instructor earnings - Replicated from tutor_earnings table
    """
    __tablename__ = "earnings"

    earning_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)

    # Earning details
    order_status = Column(String(50), default="completed")
    course_price_total = Column(Decimal(16, 2), default=0)
    course_price_grand_total = Column(Decimal(16, 2), default=0)
    instructor_amount = Column(Decimal(16, 2), default=0)
    instructor_rate = Column(Decimal(16, 2), default=0)
    admin_amount = Column(Decimal(16, 2), default=0)
    admin_rate = Column(Decimal(16, 2), default=0)
    commission_type = Column(String(20), default="percent")
    deduct_fees_amount = Column(Decimal(16, 2), default=0)
    deduct_fees_name = Column(String(250), default="")
    deduct_fees_type = Column(String(20), default="percent")

    # Process details
    process_by = Column(String(20), default="admin")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="earnings")
    course = relationship("Course")
    order = relationship("Order")

    def __repr__(self):
        return f"<Earning(id={self.earning_id}, user_id={self.user_id}, amount={self.instructor_amount})>"

class Withdrawal(Base):
    """
    Instructor withdrawals - Replicated from tutor_withdraws table
    """
    __tablename__ = "withdrawals"

    withdraw_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Withdrawal details
    amount = Column(Decimal(16, 2), nullable=False)
    method_data = Column(JSON, default={})  # Payment method details
    status = Column(String(50), default="pending")  # pending, approved, rejected, paid
    reject_detail = Column(Text, default="")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="withdrawals")

    def __repr__(self):
        return f"<Withdrawal(id={self.withdraw_id}, user_id={self.user_id}, amount={self.amount}, status={self.status})>"