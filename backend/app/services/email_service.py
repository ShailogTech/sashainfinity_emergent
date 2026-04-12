"""
Email Service - Email notifications for SashaInfinity LMS
Supports both SMTP (production) and mock mode (development)
"""

from datetime import datetime
from typing import List, Dict, Optional
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class EmailService:
    """Email service for sending notifications via SMTP or mock mode"""

    @staticmethod
    def _send_smtp_email(to_email: str, subject: str, body: str, html_body: Optional[str] = None) -> bool:
        """
        Send email via SMTP server

        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Plain text body
            html_body: Optional HTML body

        Returns:
            bool: True if sent successfully
        """
        # Check if SMTP is configured
        if not settings.SMTP_HOST or not settings.SMTP_USER:
            logger.warning("SMTP not configured, falling back to mock mode")
            return False

        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = settings.EMAIL_FROM
            msg['To'] = to_email
            msg['Subject'] = subject

            # Attach plain text
            msg.attach(MIMEText(body, 'plain'))

            # Attach HTML if provided
            if html_body:
                msg.attach(MIMEText(html_body, 'html'))

            # Connect to SMTP server
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                # Enable TLS encryption
                server.starttls()

                # Login
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)

                # Send email
                server.send_message(msg)

            logger.info(f"✅ Email sent successfully to {to_email}")
            return True

        except Exception as e:
            logger.error(f"❌ Failed to send email to {to_email}: {e}")
            return False

    @staticmethod
    def send_course_deletion_notification(
        student_email: str,
        student_name: str,
        course_title: str,
        course_id: int,
        deleted_by: str = "Administrator"
    ) -> bool:
        """
        Send notification to student about course deletion

        Args:
            student_email: Student's email address
            student_name: Student's display name
            course_title: Title of the deleted course
            course_id: ID of the deleted course
            deleted_by: Name of the admin who deleted the course

        Returns:
            bool: True if email was sent successfully
        """
        subject = f"Course Removed - {course_title}"

        # Plain text version
        text_body = f"""
Dear {student_name},

We regret to inform you that the course you were enrolled in has been removed from our platform.

Course Details:
- Title: {course_title}
- Course ID: {course_id}
- Deleted on: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
- Action taken by: {deleted_by}

What this means for you:
- Your enrollment has been terminated
- You will no longer have access to course materials
- Your progress and certificates (if any) have been archived
- If you paid for this course, please contact support for refund information

We apologize for any inconvenience this may cause. If you have any questions or concerns,
please don't hesitate to reach out to our support team.

Best regards,
SashaInfinity LMS Team
        """

        # HTML version
        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #f44336; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background-color: #f9f9f9; }}
        .details {{ background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #f44336; }}
        .footer {{ padding: 20px; text-align: center; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Course Deletion Notification</h1>
        </div>
        <div class="content">
            <p>Dear {student_name},</p>
            <p>We regret to inform you that the course you were enrolled in has been removed from our platform.</p>

            <div class="details">
                <h3>Course Details:</h3>
                <ul>
                    <li><strong>Title:</strong> {course_title}</li>
                    <li><strong>Course ID:</strong> {course_id}</li>
                    <li><strong>Deleted on:</strong> {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</li>
                    <li><strong>Action taken by:</strong> {deleted_by}</li>
                </ul>
            </div>

            <h3>What this means for you:</h3>
            <ul>
                <li>Your enrollment has been terminated</li>
                <li>You will no longer have access to course materials</li>
                <li>Your progress and certificates (if any) have been archived</li>
                <li>If you paid for this course, please contact support for refund information</li>
            </ul>

            <p>We apologize for any inconvenience this may cause. If you have any questions or concerns,
            please don't hesitate to reach out to our support team.</p>

            <p>Best regards,<br>
            <strong>SashaInfinity LMS Team</strong></p>
        </div>
        <div class="footer">
            <p>&copy; {datetime.now().year} SashaInfinity. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        """

        # Try SMTP first, fall back to mock if not configured
        if settings.SMTP_HOST and settings.SMTP_USER:
            return EmailService._send_smtp_email(student_email, subject, text_body, html_body)
        else:
            # Mock mode - log to console
            logger.info(f"📧 [MOCK EMAIL] Sending course deletion notification:")
            logger.info(f"   To: {student_email}")
            logger.info(f"   Subject: {subject}")
            logger.info(text_body)
            return True

    @staticmethod
    def send_bulk_course_deletion_notifications(
        notifications: List[Dict[str, any]]
    ) -> Dict[str, int]:
        """
        Send course deletion notifications to multiple students

        Args:
            notifications: List of dicts with keys: student_email, student_name,
                          course_title, course_id, deleted_by

        Returns:
            Dict with 'sent' and 'failed' counts
        """
        sent_count = 0
        failed_count = 0

        logger.info(f"📧 [BULK EMAIL] Sending {len(notifications)} course deletion notifications")

        for notification in notifications:
            try:
                success = EmailService.send_course_deletion_notification(
                    student_email=notification['student_email'],
                    student_name=notification['student_name'],
                    course_title=notification['course_title'],
                    course_id=notification['course_id'],
                    deleted_by=notification.get('deleted_by', 'Administrator')
                )
                if success:
                    sent_count += 1
                else:
                    failed_count += 1
            except Exception as e:
                logger.error(f"Failed to send notification to {notification.get('student_email')}: {e}")
                failed_count += 1

        logger.info(f"✅ Bulk email complete: {sent_count} sent, {failed_count} failed")

        return {
            'sent': sent_count,
            'failed': failed_count,
            'total': len(notifications)
        }

    @staticmethod
    def send_enrollment_termination_notice(
        student_email: str,
        student_name: str,
        course_title: str,
        reason: str = "Course has been removed"
    ) -> bool:
        """
        Send enrollment termination notice to student

        Args:
            student_email: Student's email
            student_name: Student's name
            course_title: Course title
            reason: Reason for termination

        Returns:
            bool: True if sent successfully
        """
        email_content = f"""
========================================
ENROLLMENT TERMINATION NOTICE
========================================

Dear {student_name},

Your enrollment in "{course_title}" has been terminated.

Reason: {reason}

If you believe this is an error or have questions, please contact our support team.

Best regards,
SashaInfinity LMS Team
========================================
        """

        logger.info(f"📧 [MOCK EMAIL] Enrollment termination notice:")
        logger.info(f"   To: {student_email}")
        logger.info(f"   Subject: Enrollment Terminated - {course_title}")
        logger.info(email_content)

        return True

    @staticmethod
    def send_certificate_issued_notification(
        student_email: str,
        student_name: str,
        course_title: str,
        course_id: int,
        certificate_url: str,
        completion_date: str
    ) -> bool:
        """
        Send certificate issued notification to student

        Args:
            student_email: Student's email address
            student_name: Student's display name
            course_title: Title of the completed course
            course_id: ID of the course
            certificate_url: URL to download the certificate
            completion_date: Date when course was completed

        Returns:
            bool: True if email was sent successfully
        """
        subject = f"🎓 Certificate Issued - {course_title}"

        # Plain text version
        text_body = f"""
Congratulations {student_name}!

You have successfully completed "{course_title}" and your certificate has been issued!

Course Details:
- Title: {course_title}
- Course ID: {course_id}
- Completion Date: {completion_date}

Your certificate is now ready for download. You can download it using the link below:

{certificate_url}

This certificate verifies your successful completion of the course and can be shared on:
- LinkedIn
- Your resume/CV
- Your professional portfolio
- Social media

We're proud of your achievement and wish you continued success in your learning journey!

Best regards,
SashaInfinity LMS Team
        """

        # HTML version
        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ padding: 30px; background-color: #f9f9f9; }}
        .certificate-box {{ background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
        .download-btn {{ display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }}
        .download-btn:hover {{ background: linear-gradient(135deg, #764ba2 0%, #667eea 100%); }}
        .achievement {{ text-align: center; font-size: 48px; margin: 20px 0; }}
        .details {{ background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }}
        .footer {{ padding: 20px; text-align: center; color: #666; font-size: 12px; }}
        .share-icons {{ text-align: center; margin: 20px 0; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="achievement">🎓</div>
            <h1>Congratulations!</h1>
            <h2>Your Certificate is Ready</h2>
        </div>
        <div class="content">
            <p>Dear {student_name},</p>
            <p style="font-size: 18px; color: #667eea;"><strong>You did it!</strong></p>
            <p>We're thrilled to inform you that you have successfully completed <strong>"{course_title}"</strong> and your certificate has been issued!</p>

            <div class="certificate-box">
                <h3>📋 Course Details:</h3>
                <ul style="list-style: none; padding: 0;">
                    <li>📚 <strong>Course:</strong> {course_title}</li>
                    <li>🆔 <strong>Course ID:</strong> {course_id}</li>
                    <li>📅 <strong>Completed on:</strong> {completion_date}</li>
                </ul>
            </div>

            <div style="text-align: center;">
                <a href="{certificate_url}" class="download-btn">📥 Download Your Certificate</a>
            </div>

            <div class="details">
                <h3>📢 Share Your Achievement:</h3>
                <p>Your certificate verifies your successful completion and can be shared on:</p>
                <ul>
                    <li>💼 LinkedIn</li>
                    <li>📄 Your resume/CV</li>
                    <li>🌐 Your professional portfolio</li>
                    <li>📱 Social media platforms</li>
                </ul>
            </div>

            <p style="margin-top: 30px;">We're incredibly proud of your dedication and achievement. Keep up the excellent work and continue your learning journey!</p>

            <p>Best regards,<br>
            <strong>SashaInfinity LMS Team</strong></p>
        </div>
        <div class="footer">
            <p>&copy; {datetime.now().year} SashaInfinity. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        """

        # Try SMTP first, fall back to mock if not configured
        if settings.SMTP_HOST and settings.SMTP_USER:
            return EmailService._send_smtp_email(student_email, subject, text_body, html_body)
        else:
            # Mock mode - log to console
            logger.info(f"📧 [MOCK EMAIL] Sending certificate notification:")
            logger.info(f"   To: {student_email}")
            logger.info(f"   Subject: {subject}")
            logger.info(text_body)
            return True

    @staticmethod
    def send_order_confirmation(
        customer_email: str,
        customer_name: str,
        order_id: int,
        order_items: List[Dict],
        total_amount: float,
        transaction_id: str
    ) -> bool:
        """
        Send order confirmation and invoice email

        Args:
            customer_email: Customer's email address
            customer_name: Customer's name
            order_id: Order ID
            order_items: List of order items with course details
            total_amount: Total order amount
            transaction_id: Payment transaction ID

        Returns:
            bool: True if email was sent successfully
        """
        subject = f"Order Confirmation #{order_id} - SashaInfinity LMS"

        # Build course list
        courses_html = ""
        courses_text = ""
        for item in order_items:
            courses_html += f"""
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">{item['title']}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹{item['price']:.2f}</td>
                </tr>
            """
            courses_text += f"\n- {item['title']}: ₹{item['price']:.2f}"

        # Plain text version
        text_body = f"""
Dear {customer_name},

Thank you for your purchase! Your order has been confirmed.

Order Details:
Order ID: #{order_id}
Transaction ID: {transaction_id}
Date: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}

Courses Purchased:{courses_text}

Total Amount: ₹{total_amount:.2f}

You can now access your courses by logging into your account at:
{settings.FRONTEND_URL}/my-courses

If you have any questions, please don't hesitate to contact our support team.

Best regards,
The SashaInfinity LMS Team
        """

        # HTML version
        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed!</h1>
        </div>

        <!-- Content -->
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                Dear {customer_name},
            </p>

            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                Thank you for your purchase! Your order has been confirmed and you now have access to your courses.
            </p>

            <!-- Order Info -->
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h2 style="color: #1f2937; font-size: 18px; margin-top: 0;">Order Details</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #6b7280;">Order ID:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold;">#{order_id}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #6b7280;">Transaction ID:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold;">{transaction_id}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #6b7280;">Date:</td>
                        <td style="padding: 8px 0; text-align: right;">{datetime.now().strftime('%B %d, %Y at %I:%M %p')}</td>
                    </tr>
                </table>
            </div>

            <!-- Courses Table -->
            <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 15px;">Courses Purchased</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                <thead>
                    <tr style="background-color: #f9fafb;">
                        <th style="padding: 12px; text-align: left; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Course</th>
                        <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    {courses_html}
                </tbody>
                <tfoot>
                    <tr>
                        <td style="padding: 15px 12px; font-weight: bold; font-size: 18px; border-top: 2px solid #e5e7eb;">Total</td>
                        <td style="padding: 15px 12px; font-weight: bold; font-size: 18px; text-align: right; color: #10b981; border-top: 2px solid #e5e7eb;">₹{total_amount:.2f}</td>
                    </tr>
                </tfoot>
            </table>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="{settings.FRONTEND_URL}/my-courses" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    Access My Courses
                </a>
            </div>

            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                If you have any questions, please contact our support team.
            </p>

            <p style="font-size: 14px; color: #374151; margin-bottom: 0;">
                Best regards,<br>
                <strong>The SashaInfinity LMS Team</strong>
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>© {datetime.now().year} SashaInfinity LMS. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        """

        # Try SMTP first, fall back to mock if not configured
        if settings.SMTP_HOST and settings.SMTP_USER:
            return EmailService._send_smtp_email(customer_email, subject, text_body, html_body)
        else:
            # Mock mode - log to console
            logger.info(f"📧 [MOCK EMAIL] Sending order confirmation:")
            logger.info(f"   To: {customer_email}")
            logger.info(f"   Subject: {subject}")
            logger.info(f"   Order ID: #{order_id}")
            logger.info(f"   Total: ₹{total_amount:.2f}")
            logger.info(text_body)
            return True
