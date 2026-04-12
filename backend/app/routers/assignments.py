"""
Assignment Management Router - SashaInfinity LMS API
Handles assignment CRUD operations and submissions
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import json

from app.core.database import get_db
from app.models.user import User
from app.models.assignment import Assignment, AssignmentSubmission, SubmissionStatus, AssignmentStatus
from app.models.course import Course
from app.services.auth_service import AuthService

router = APIRouter()


@router.get("/assignments/{assignment_id}")
async def get_assignment_basic(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get basic assignment info (just course_id for navigation)
    """
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )

    return {
        "id": assignment.id,
        "course_id": assignment.course_id,
        "title": assignment.title
    }


@router.get("/courses/{course_id}/assignments")
async def get_course_assignments(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get all assignments for a course
    """
    # Verify course exists
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Get all assignments for this course
    assignments = db.query(Assignment).filter(
        Assignment.course_id == course_id
    ).order_by(Assignment.created_at.desc()).all()

    # Parse and return assignments
    result = []
    for assignment in assignments:
        try:
            allowed_file_types = json.loads(assignment.allowed_file_types) if assignment.allowed_file_types else []
        except (json.JSONDecodeError, TypeError) as e:
            print(f"Error parsing allowed_file_types for assignment {assignment.id}: {e}")
            allowed_file_types = []

        try:
            attachments = json.loads(assignment.attachments) if assignment.attachments else []
        except (json.JSONDecodeError, TypeError) as e:
            print(f"Error parsing attachments for assignment {assignment.id}: {e}")
            attachments = []

        result.append({
            "id": assignment.id,
            "title": assignment.title,
            "description": assignment.description,
            "instructions": assignment.instructions,
            "attachments": attachments,
            "dueDate": assignment.due_date.isoformat() if assignment.due_date else None,
            "totalPoints": assignment.total_points,
            "allowedFileTypes": allowed_file_types,
            "maxFileSize": assignment.max_file_size,
            "maxFiles": assignment.max_files,
            "submissionType": assignment.submission_type,
            "status": assignment.status.value if isinstance(assignment.status, AssignmentStatus) else assignment.status,
            "created_at": assignment.created_at.isoformat()
        })

    return result


@router.post("/courses/{course_id}/assignments")
async def create_assignment(
    course_id: int,
    assignment_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.require_instructor)
):
    """
    Create a new assignment for a course
    """
    # Verify course exists and user has permission
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    if course.post_author != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to add assignments to this course"
        )

    # Parse due date
    due_date = None
    if assignment_data.get("dueDate"):
        try:
            due_date = datetime.fromisoformat(assignment_data["dueDate"].replace('Z', '+00:00'))
        except:
            pass

    # Create assignment
    new_assignment = Assignment(
        course_id=course_id,
        created_by=current_user.id,
        title=assignment_data.get("title", "Untitled Assignment"),
        description=assignment_data.get("description", ""),
        instructions=assignment_data.get("instructions", ""),
        due_date=due_date,
        total_points=assignment_data.get("totalPoints", 100),
        allowed_file_types=json.dumps(assignment_data.get("allowedFileTypes", [])),
        max_file_size=assignment_data.get("maxFileSize", 10),
        max_files=assignment_data.get("maxFiles", 5),
        submission_type=assignment_data.get("submissionType", "both"),
        attachments=json.dumps(assignment_data.get("attachments", [])),
        status="published"
    )

    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)

    return {
        "id": new_assignment.id,
        "message": "Assignment created successfully"
    }


@router.get("/courses/{course_id}/assignments/{assignment_id}")
async def get_assignment(
    course_id: int,
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get assignment details
    """
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.course_id == course_id
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )

    # Parse allowed file types
    try:
        allowed_file_types = json.loads(assignment.allowed_file_types) if assignment.allowed_file_types else []
    except (json.JSONDecodeError, TypeError) as e:
        print(f"Error parsing allowed_file_types for assignment {assignment_id}: {e}")
        allowed_file_types = []

    # Parse attachments (instructor reference files)
    try:
        attachments = json.loads(assignment.attachments) if assignment.attachments else []
    except (json.JSONDecodeError, TypeError) as e:
        print(f"Error parsing attachments for assignment {assignment_id}: {e}")
        attachments = []

    # Check if student has submitted
    submission = None
    if current_user.role == "student":
        submission = db.query(AssignmentSubmission).filter(
            AssignmentSubmission.assignment_id == assignment_id,
            AssignmentSubmission.user_id == current_user.id
        ).first()

    return {
        "id": assignment.id,
        "title": assignment.title,
        "description": assignment.description,
        "instructions": assignment.instructions,
        "attachments": attachments,
        "dueDate": assignment.due_date.isoformat() if assignment.due_date else None,
        "totalPoints": assignment.total_points,
        "allowedFileTypes": allowed_file_types,
        "maxFileSize": assignment.max_file_size,
        "maxFiles": assignment.max_files,
        "submissionType": assignment.submission_type,
        "isSubmitted": submission is not None,
        "submission": {
            "id": submission.id,
            "textContent": submission.text_content,
            "files": json.loads(submission.files) if submission.files else [],
            "submittedAt": submission.submitted_at.isoformat() if submission.submitted_at else None,
            "grade": float(submission.grade) if submission.grade else None,
            "feedback": submission.feedback,
            "status": submission.status.value if isinstance(submission.status, SubmissionStatus) else submission.status
        } if submission else None
    }


@router.put("/courses/{course_id}/assignments/{assignment_id}")
async def update_assignment(
    course_id: int,
    assignment_id: int,
    assignment_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.require_instructor)
):
    """
    Update an existing assignment
    """
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.course_id == course_id
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )

    # Check permission
    course = db.query(Course).filter(Course.id == course_id).first()
    if course.post_author != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to edit this assignment"
        )

    # Parse due date
    if assignment_data.get("dueDate"):
        try:
            assignment.due_date = datetime.fromisoformat(assignment_data["dueDate"].replace('Z', '+00:00'))
        except:
            pass

    # Update fields
    assignment.title = assignment_data.get("title", assignment.title)
    assignment.description = assignment_data.get("description", assignment.description)
    assignment.instructions = assignment_data.get("instructions", assignment.instructions)
    assignment.total_points = assignment_data.get("totalPoints", assignment.total_points)
    assignment.max_file_size = assignment_data.get("maxFileSize", assignment.max_file_size)
    assignment.max_files = assignment_data.get("maxFiles", assignment.max_files)
    assignment.submission_type = assignment_data.get("submissionType", assignment.submission_type)

    if "allowedFileTypes" in assignment_data:
        assignment.allowed_file_types = json.dumps(assignment_data["allowedFileTypes"])

    if "attachments" in assignment_data:
        assignment.attachments = json.dumps(assignment_data["attachments"])

    db.commit()

    return {
        "id": assignment.id,
        "message": "Assignment updated successfully"
    }


@router.delete("/courses/{course_id}/assignments/{assignment_id}")
async def delete_assignment(
    course_id: int,
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.require_instructor)
):
    """
    Delete an assignment
    """
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.course_id == course_id
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )

    # Check permission
    course = db.query(Course).filter(Course.id == course_id).first()
    if course.post_author != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this assignment"
        )

    db.delete(assignment)
    db.commit()

    return {"message": "Assignment deleted successfully"}


@router.post("/assignments/{assignment_id}/submit")
async def submit_assignment(
    assignment_id: int,
    submission_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Submit an assignment (student only)
    """
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )

    # Check if already submitted
    existing = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id == assignment_id,
        AssignmentSubmission.user_id == current_user.id
    ).first()

    if existing:
        # Only allow resubmission if status is "returned"
        # Prevent overwriting graded or submitted assignments
        if existing.status == SubmissionStatus.GRADED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot resubmit a graded assignment. This assignment has already been graded."
            )

        if existing.status == SubmissionStatus.SUBMITTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assignment is already submitted and pending review. Cannot resubmit until instructor returns it."
            )

        # Allow resubmission only if status is "returned"
        if existing.status == SubmissionStatus.RETURNED:
            existing.text_content = submission_data.get("textContent", "")
            existing.files = json.dumps(submission_data.get("files", []))
            existing.submitted_at = datetime.utcnow()
            existing.status = SubmissionStatus.SUBMITTED
            existing.grade = None  # Clear any previous grade
            existing.feedback = ""  # Clear previous feedback
            db.commit()
            return {"message": "Assignment resubmitted successfully", "id": existing.id}

        # For any other status, reject
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot resubmit assignment with status: {existing.status.value}"
        )
    else:
        # Create new submission
        new_submission = AssignmentSubmission(
            assignment_id=assignment_id,
            user_id=current_user.id,
            text_content=submission_data.get("textContent", ""),
            files=json.dumps(submission_data.get("files", [])),
            status=SubmissionStatus.SUBMITTED
        )
        db.add(new_submission)
        db.commit()
        db.refresh(new_submission)
        return {"message": "Assignment submitted successfully", "id": new_submission.id}


@router.get("/assignments/{assignment_id}/submissions")
async def get_submissions(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.require_instructor)
):
    """
    Get all submissions for an assignment (instructor only)
    """
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )

    # Check permission
    course = db.query(Course).filter(Course.id == assignment.course_id).first()
    if course.post_author != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view submissions"
        )

    submissions = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id == assignment_id
    ).all()

    return {
        "submissions": [
            {
                "id": sub.id,
                "studentId": sub.user_id,
                "studentName": sub.student.display_name if sub.student else "Unknown",
                "studentEmail": sub.student.user_email if sub.student else "N/A",
                "submittedAt": sub.submitted_at.isoformat() if sub.submitted_at else None,
                "textContent": sub.text_content,
                "files": json.loads(sub.files) if sub.files else [],
                "grade": float(sub.grade) if sub.grade else None,
                "feedback": sub.feedback,
                "status": sub.status.value if isinstance(sub.status, SubmissionStatus) else sub.status
            }
            for sub in submissions
        ]
    }


@router.post("/submissions/{submission_id}/return")
async def return_submission(
    submission_id: int,
    return_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.require_instructor)
):
    """
    Return a submission as invalid (instructor only)
    """
    submission = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.id == submission_id
    ).first()

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )

    # Check permission
    assignment = db.query(Assignment).filter(Assignment.id == submission.assignment_id).first()
    course = db.query(Course).filter(Course.id == assignment.course_id).first()

    if course.post_author != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to return this submission"
        )

    # Store previous grade if it existed (for logging/audit purposes)
    previous_grade = submission.grade if submission.grade else None
    previous_status = submission.status

    # Update submission status to returned
    submission.status = SubmissionStatus.RETURNED
    submission.feedback = return_data.get("feedback", "")
    submission.grade = None  # Clear grade if any

    db.commit()
    db.refresh(submission)

    # Include warning if grade was cleared
    message = "Submission returned to student"
    if previous_grade is not None:
        message += f" (previous grade of {previous_grade} was cleared)"

    return {
        "message": message,
        "submission": {
            "id": submission.id,
            "status": submission.status.value if isinstance(submission.status, SubmissionStatus) else submission.status,
            "feedback": submission.feedback,
            "previous_status": previous_status.value if isinstance(previous_status, SubmissionStatus) else previous_status,
            "previous_grade": float(previous_grade) if previous_grade else None
        }
    }


@router.post("/submissions/{submission_id}/grade")
async def grade_submission(
    submission_id: int,
    grade_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.require_instructor)
):
    """
    Grade an assignment submission (instructor only)
    """
    from app.models.enrollment import Enrollment
    from app.services.certificate_service import CertificateService

    submission = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.id == submission_id
    ).first()

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )

    # Check permission
    assignment = db.query(Assignment).filter(
        Assignment.id == submission.assignment_id
    ).first()
    course = db.query(Course).filter(Course.id == assignment.course_id).first()

    if course.post_author != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to grade this submission"
        )

    # Update grade
    submission.grade = grade_data.get("grade")
    submission.feedback = grade_data.get("feedback", "")
    submission.status = SubmissionStatus.GRADED
    submission.graded_at = datetime.utcnow()

    db.commit()

    # Check if all assignments for this student are graded
    student_id = submission.user_id
    course_id = assignment.course_id

    # Recalculate course progress after grading
    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == student_id,
        Enrollment.course_id == course_id
    ).first()

    if enrollment:
        from app.services.course_service import CourseService
        CourseService.calculate_course_progress(db, enrollment)

    # Get all assignments for this course
    all_assignments = db.query(Assignment).filter(
        Assignment.course_id == course_id
    ).all()

    # Get all submissions by this student for this course
    student_submissions = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.user_id == student_id,
        AssignmentSubmission.assignment_id.in_([a.id for a in all_assignments])
    ).all()

    # Check if all assignments are graded
    all_graded = len(student_submissions) == len(all_assignments) and all(
        s.status == SubmissionStatus.GRADED for s in student_submissions
    )

    certificate_issued = False
    certificate_error = None
    if all_graded and enrollment:
        # Refresh enrollment to get updated progress
        db.refresh(enrollment)

        if enrollment.course_progress_percentage == 100:
            # All assignments graded and course completed - issue certificate
            try:
                from app.services.email_service import EmailService

                student = db.query(User).filter(User.id == student_id).first()
                course = db.query(Course).filter(Course.id == course_id).first()

                certificate_service = CertificateService()
                certificate = certificate_service.generate_certificate(
                    db=db,
                    user_id=student_id,
                    course_id=course_id
                )
                certificate_issued = True

                # Send certificate notification email
                if student and course and certificate:
                    certificate_url = f"{certificate.get('certificate_url', '')}"
                    completion_date = enrollment.completion_date.strftime('%B %d, %Y') if enrollment.completion_date else datetime.utcnow().strftime('%B %d, %Y')

                    EmailService.send_certificate_issued_notification(
                        student_email=student.user_email,
                        student_name=student.display_name,
                        course_title=course.post_title,
                        course_id=course_id,
                        certificate_url=certificate_url,
                        completion_date=completion_date
                    )
            except Exception as e:
                error_msg = f"Failed to generate certificate or send email: {str(e)}"
                print(error_msg)
                certificate_error = str(e)

    response = {
        "message": "Submission graded successfully",
        "all_assignments_graded": all_graded,
        "certificate_issued": certificate_issued
    }

    # Include warning if certificate generation failed
    if certificate_error:
        response["warning"] = f"Grading succeeded but certificate generation failed: {certificate_error}"

    return response
