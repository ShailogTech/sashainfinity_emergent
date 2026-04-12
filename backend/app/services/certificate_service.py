"""
Certificate Service - PDF generation using ReportLab
Matches the orange Certificate of Completion template
"""
import os, uuid, secrets, base64, io
from datetime import datetime
from typing import Dict, Any
from PIL import Image
import qrcode
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

class CertificateService:

    @staticmethod
    def _generate_qr_code_img(data: str):
        qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=8, border=2)
        qr.add_data(data)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        return buf

    @staticmethod
    def generate_verification_code() -> str:
        return secrets.token_hex(16)

    @staticmethod
    def generate_secure_certificate_id(user_id: int, course_id: int, issue_date) -> str:
        import hashlib
        data = f"{user_id}-{course_id}-{issue_date}-{secrets.token_hex(8)}"
        return hashlib.sha256(data.encode()).hexdigest()[:20].upper()

    @staticmethod
    def generate_secure_verification_url(base_url: str, certificate_hash: str, certificate_id: str) -> str:
        return f"{base_url}/verify-certificate?id={certificate_id}&hash={certificate_hash}"

    @staticmethod
    async def generate_certificate(certificate_data: Dict[str, Any]) -> str:
        cert_dir = "certificates"
        os.makedirs(cert_dir, exist_ok=True)
        filename = f"certificate_{uuid.uuid4().hex}.pdf"
        file_path = os.path.join(cert_dir, filename)
        CertificateService._generate_pdf(certificate_data, file_path)
        return f"/certificate-files/{filename}"

    @staticmethod
    def _generate_pdf(data: Dict[str, Any], file_path: str):
        from app.core.config import get_settings
        settings = get_settings()

        student_name = data.get("student_name", "Student Name")
        course_title = data.get("course_title", "Course Title")
        instructor_name = data.get("instructor_name", "Instructor")
        completion_date = data.get("completion_date", datetime.now())
        certificate_id = data.get("certificate_id", "0")
        certificate_hash = data.get("certificate_hash", "")
        base_url = data.get("base_url", getattr(settings, "FRONTEND_URL", "https://lms.sashainfinity.com"))

        if isinstance(completion_date, str):
            date_text = completion_date
        else:
            date_text = completion_date.strftime("%B %d, %Y")

        verification_url = f"{base_url}/verify-certificate?id={certificate_id}&hash={certificate_hash}"

        # Page setup - landscape A4
        W, H = landscape(A4)  # 841.89 x 595.28 pts
        c = canvas.Canvas(file_path, pagesize=landscape(A4))

        # ── LEFT PANEL (orange) ──────────────────────────────
        panel_w = W * 0.32
        c.setFillColor(colors.HexColor("#E8701A"))
        c.rect(0, 0, panel_w, H, fill=1, stroke=0)

        # Left panel teal accent strip
        c.setFillColor(colors.HexColor("#1A7A8A"))
        c.rect(panel_w - 8, 0, 8, H, fill=1, stroke=0)

        # "Certificate" text on left
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 28)
        c.drawCentredString(panel_w / 2, H - 120, "Certificate")
        c.setFont("Helvetica", 20)
        c.drawCentredString(panel_w / 2, H - 150, "of")
        c.setFont("Helvetica-Bold", 24)
        c.drawCentredString(panel_w / 2, H - 178, "Completion")

        # QR code on left panel
        qr_buf = CertificateService._generate_qr_code_img(verification_url)
        qr_img = Image.open(qr_buf)
        qr_path = f"/tmp/qr_{uuid.uuid4().hex}.png"
        qr_img.save(qr_path)
        qr_size = 90
        c.drawImage(qr_path, (panel_w - qr_size) / 2, 80, qr_size, qr_size)
        os.remove(qr_path)

        # Decorative circles on left
        c.setFillColor(colors.HexColor("#1A7A8A"))
        c.circle(panel_w / 2, H * 0.45, 55, fill=1, stroke=0)
        c.setFillColor(colors.HexColor("#E8701A"))
        c.circle(panel_w / 2, H * 0.45, 48, fill=1, stroke=0)
        c.setStrokeColor(colors.white)
        c.setLineWidth(2)
        c.circle(panel_w / 2, H * 0.45, 52, fill=0, stroke=1)
        # SI text in circle
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 22)
        c.drawCentredString(panel_w / 2, H * 0.45 - 8, "SI")

        # ── RIGHT PANEL (cream/white) ─────────────────────────
        rx = panel_w + 10  # right area x start

        # Top logo area - company name
        c.setFillColor(colors.HexColor("#E8701A"))
        c.setFont("Helvetica-Bold", 14)
        c.drawString(rx + 20, H - 50, "SashaInfinity")
        c.setFillColor(colors.HexColor("#666666"))
        c.setFont("Helvetica", 9)
        c.drawString(rx + 20, H - 64, "Premium Technology Education")

        # Orange seal circle top right
        c.setFillColor(colors.HexColor("#E8701A"))
        c.circle(W - 60, H - 55, 38, fill=1, stroke=0)
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(W - 60, H - 52, "VERIFIED")
        c.setFont("Helvetica", 7)
        c.drawCentredString(W - 60, H - 63, "CERTIFICATE")

        # Divider line
        c.setStrokeColor(colors.HexColor("#DDDDDD"))
        c.setLineWidth(1)
        c.line(rx + 20, H - 80, W - 20, H - 80)

        # "This is to certify that" 
        c.setFillColor(colors.HexColor("#888888"))
        c.setFont("Helvetica", 10)
        c.drawString(rx + 20, H - 110, "This is to certify that")

        # Student name - large
        c.setFillColor(colors.HexColor("#222222"))
        c.setFont("Helvetica-Bold", 32)
        c.drawString(rx + 20, H - 155, student_name)

        # Underline for student name
        name_w = c.stringWidth(student_name, "Helvetica-Bold", 32)
        c.setStrokeColor(colors.HexColor("#E8701A"))
        c.setLineWidth(2)
        c.line(rx + 20, H - 165, rx + 20 + min(name_w, W - rx - 60), H - 165)

        # "has successfully completed the course"
        c.setFillColor(colors.HexColor("#666666"))
        c.setFont("Helvetica", 11)
        c.drawString(rx + 20, H - 195, "has successfully completed the course")

        # Course title
        c.setFillColor(colors.HexColor("#333333"))
        c.setFont("Helvetica-Bold", 16)
        # Wrap long course titles
        max_w = W - rx - 60
        if c.stringWidth(course_title, "Helvetica-Bold", 16) > max_w:
            words = course_title.split()
            line1, line2 = "", ""
            for w in words:
                test = line1 + " " + w if line1 else w
                if c.stringWidth(test, "Helvetica-Bold", 16) < max_w:
                    line1 = test
                else:
                    line2 = (line2 + " " + w).strip()
            c.drawString(rx + 20, H - 225, line1)
            if line2:
                c.drawString(rx + 20, H - 245, line2)
                bottom_y = H - 245
            else:
                bottom_y = H - 225
        else:
            c.drawString(rx + 20, H - 225, course_title)
            bottom_y = H - 225

        # Date
        c.setFillColor(colors.HexColor("#888888"))
        c.setFont("Helvetica", 9)
        c.drawString(rx + 20, bottom_y - 30, f"Completed on: {date_text}")

        # ── SIGNATURE SECTION ──────────────────────────────────
        sig_y = 100

        # Instructor name
        c.setFillColor(colors.HexColor("#333333"))
        c.setFont("Helvetica-Bold", 12)
        c.drawString(rx + 20, sig_y + 30, instructor_name)
        c.setStrokeColor(colors.HexColor("#333333"))
        c.setLineWidth(1)
        c.line(rx + 20, sig_y + 22, rx + 180, sig_y + 22)
        c.setFillColor(colors.HexColor("#888888"))
        c.setFont("Helvetica", 9)
        c.drawString(rx + 20, sig_y + 8, "Instructor, SashaInfinity")

        # Verification ID bottom right
        cert_short = str(certificate_id).zfill(6)
        c.setFillColor(colors.HexColor("#888888"))
        c.setFont("Helvetica", 8)
        c.drawRightString(W - 20, sig_y + 8, f"Certificate ID: CERT-{datetime.now().year}-{cert_short}")
        c.drawRightString(W - 20, sig_y - 5, verification_url[:60] + "..." if len(verification_url) > 60 else verification_url)

        # Bottom border line
        c.setStrokeColor(colors.HexColor("#E8701A"))
        c.setLineWidth(3)
        c.line(panel_w + 8, 15, W - 15, 15)

        c.save()

    @staticmethod
    async def generate_pdf_certificate(certificate) -> bytes:
        """Generate PDF bytes for download"""
        import tempfile
        data = {
            "student_name": certificate.user.display_name if hasattr(certificate, "user") else "Student",
            "course_title": certificate.course.post_title if hasattr(certificate, "course") else "Course",
            "instructor_name": "SashaInfinity",
            "completion_date": certificate.completion_date,
            "certificate_id": str(certificate.id),
            "certificate_hash": certificate.certificate_hash,
        }
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
            path = f.name
        CertificateService._generate_pdf(data, path)
        with open(path, "rb") as f:
            content = f.read()
        os.remove(path)
        return content
