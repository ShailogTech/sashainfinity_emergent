"""
Quiz Management Router - SashaInfinity LMS API
Handles quiz CRUD operations, questions, and attempts
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import json

from app.core.database import get_db
from app.models.user import User
from app.models.quiz import Quiz, QuizQuestion, QuizQuestionAnswer, QuizAttempt, QuizAttemptAnswer
from app.models.course import Course
from app.services.auth_service import AuthService

router = APIRouter()


@router.get("/quizzes/{quiz_id}")
async def get_quiz_basic(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get basic quiz info (just course_id for navigation)
    """
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )

    return {
        "id": quiz.id,
        "course_id": quiz.post_parent,
        "title": quiz.post_title
    }


@router.post("/courses/{course_id}/quizzes")
async def create_quiz(
    course_id: int,
    quiz_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.require_instructor)
):
    """
    Create a new quiz for a course
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
            detail="You don't have permission to add quizzes to this course"
        )

    # Create quiz
    new_quiz = Quiz(
        post_author=current_user.id,
        post_title=quiz_data.get("title", "Untitled Quiz"),
        post_content=quiz_data.get("description", ""),
        post_excerpt=quiz_data.get("description", "")[:200],
        post_status="publish",
        post_parent=course_id,
        quiz_time_limit=quiz_data.get("timeLimit", 0),
        quiz_passing_grade=quiz_data.get("passingScore", 70),
        quiz_max_attempts_allowed=quiz_data.get("maxAttempts", 0),
        quiz_questions_order=quiz_data.get("randomizeQuestions", False) and "rand" or "asc",
    )

    db.add(new_quiz)
    db.commit()
    db.refresh(new_quiz)

    # Add questions if provided
    questions_data = quiz_data.get("questions", [])
    for idx, q_data in enumerate(questions_data):
        question = QuizQuestion(
            quiz_id=new_quiz.id,
            question_title=q_data.get("question", ""),
            question_type=q_data.get("type", "multiple_choice"),
            question_mark=q_data.get("points", 1),
            question_order=idx,
            answer_explanation=q_data.get("explanation", ""),
            question_settings=json.dumps({
                "image_url": q_data.get("imageUrl", "")
            })
        )

        db.add(question)
        db.commit()
        db.refresh(question)

        # Add answer options for multiple choice
        if q_data.get("type") == "multiple_choice" and q_data.get("options"):
            for opt_idx, option_text in enumerate(q_data["options"]):
                answer = QuizQuestionAnswer(
                    belongs_question_id=question.question_id,
                    belongs_question_type="multiple_choice",
                    answer_title=option_text,
                    is_correct=(opt_idx == q_data.get("correctAnswer")),
                    answer_order=opt_idx
                )
                db.add(answer)

        # Add answer for true/false
        elif q_data.get("type") == "true_false":
            correct_answer = q_data.get("correctAnswer", "true")
            for opt_text, opt_val in [("True", "true"), ("False", "false")]:
                answer = QuizQuestionAnswer(
                    belongs_question_id=question.question_id,
                    belongs_question_type="true_false",
                    answer_title=opt_text,
                    is_correct=(opt_val == correct_answer),
                    answer_order=0 if opt_val == "true" else 1
                )
                db.add(answer)

    db.commit()

    return {
        "id": new_quiz.id,
        "message": "Quiz created successfully"
    }


@router.post("/quizzes/{quiz_id}/questions")
async def add_question_to_quiz(
    quiz_id: int,
    question_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.require_instructor)
):
    """
    Add a question to an existing quiz
    """
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )

    # Verify permission
    course = db.query(Course).filter(Course.id == quiz.post_parent).first()
    if course and course.post_author != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to modify this quiz"
        )

    # Create question
    question = QuizQuestion(
        quiz_id=quiz_id,
        question_title=question_data.get("question_title", ""),
        question_type=question_data.get("question_type", "multiple_choice"),
        question_mark=question_data.get("question_mark", 1),
        question_order=question_data.get("question_order", 0),
        answer_explanation=question_data.get("answer_explanation", ""),
        question_settings=question_data.get("question_settings", "")
    )

    db.add(question)
    db.commit()
    db.refresh(question)

    # Parse question options if provided
    options_str = question_data.get("question_options", "")
    if options_str:
        try:
            options_data = json.loads(options_str)
            options = options_data.get("options", [])
            correct_answer = options_data.get("correct_answer", 0)

            for idx, option_text in enumerate(options):
                answer = QuizQuestionAnswer(
                    belongs_question_id=question.question_id,
                    belongs_question_type=question.question_type,
                    answer_title=option_text,
                    is_correct=(idx == correct_answer),
                    answer_order=idx
                )
                db.add(answer)
            db.commit()
        except:
            pass

    return {
        "id": question.question_id,
        "message": "Question added successfully"
    }


@router.get("/courses/{course_id}/quizzes/{quiz_id}")
async def get_quiz(
    course_id: int,
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get quiz details with questions
    """
    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id,
        Quiz.post_parent == course_id
    ).first()

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )

    # Get questions with answers
    questions = db.query(QuizQuestion).filter(
        QuizQuestion.quiz_id == quiz_id
    ).order_by(QuizQuestion.question_order).all()

    questions_data = []
    for question in questions:
        answers = db.query(QuizQuestionAnswer).filter(
            QuizQuestionAnswer.belongs_question_id == question.question_id
        ).order_by(QuizQuestionAnswer.answer_order).all()

        question_dict = {
            "id": str(question.question_id),
            "type": question.question_type,
            "question": question.question_title,
            "points": float(question.question_mark),
            "explanation": question.answer_explanation,
        }

        # Parse settings
        try:
            settings = json.loads(question.question_settings) if question.question_settings else {}
            question_dict["imageUrl"] = settings.get("image_url", "")
        except:
            question_dict["imageUrl"] = ""

        # Add options for multiple choice
        if question.question_type == "multiple_choice":
            question_dict["options"] = [ans.answer_title for ans in answers]
            # Find correct answer index
            for idx, ans in enumerate(answers):
                if ans.is_correct:
                    question_dict["correctAnswer"] = idx
                    break

        # Add correct answer for true/false
        elif question.question_type == "true_false":
            for ans in answers:
                if ans.is_correct:
                    question_dict["correctAnswer"] = ans.answer_title.lower()
                    break

        elif question.question_type == "fill_in_blank":
            for ans in answers:
                if ans.is_correct:
                    question_dict["correctAnswer"] = ans.answer_title
                    break
        questions_data.append(question_dict)

    return {
        "id": quiz.id,
        "title": quiz.post_title,
        "description": quiz.post_content,
        "timeLimit": quiz.quiz_time_limit,
        "passingScore": quiz.quiz_passing_grade,
        "maxAttempts": quiz.quiz_max_attempts_allowed,
        "randomizeQuestions": quiz.quiz_questions_order == "rand",
        "showCorrectAnswers": True,
        "questions": questions_data
    }


@router.put("/courses/{course_id}/quizzes/{quiz_id}")
async def update_quiz(
    course_id: int,
    quiz_id: int,
    quiz_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.require_instructor)
):
    """
    Update an existing quiz
    """
    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id,
        Quiz.post_parent == course_id
    ).first()

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )

    # Check permission
    course = db.query(Course).filter(Course.id == course_id).first()
    if course.post_author != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to edit this quiz"
        )

    # Update quiz settings
    quiz.post_title = quiz_data.get("title", quiz.post_title)
    quiz.post_content = quiz_data.get("description", quiz.post_content)
    quiz.quiz_time_limit = quiz_data.get("timeLimit", quiz.quiz_time_limit)
    quiz.quiz_passing_grade = quiz_data.get("passingScore", quiz.quiz_passing_grade)
    quiz.quiz_max_attempts_allowed = quiz_data.get("maxAttempts", quiz.quiz_max_attempts_allowed)
    quiz.quiz_questions_order = "rand" if quiz_data.get("randomizeQuestions", False) else "asc"

    # Delete existing questions and answers
    existing_questions = db.query(QuizQuestion).filter(
        QuizQuestion.quiz_id == quiz_id
    ).all()

    for question in existing_questions:
        # Delete answers
        db.query(QuizQuestionAnswer).filter(
            QuizQuestionAnswer.belongs_question_id == question.question_id
        ).delete()
        # Delete question
        db.delete(question)

    # Add new questions
    questions_data = quiz_data.get("questions", [])
    for idx, q_data in enumerate(questions_data):
        question = QuizQuestion(
            quiz_id=quiz.id,
            question_title=q_data.get("question", ""),
            question_type=q_data.get("type", "multiple_choice"),
            question_mark=q_data.get("points", 1),
            question_order=idx,
            answer_explanation=q_data.get("explanation", ""),
            question_settings=json.dumps({
                "image_url": q_data.get("imageUrl", "")
            })
        )

        db.add(question)
        db.commit()
        db.refresh(question)

        # Add answer options for multiple choice
        if q_data.get("type") == "multiple_choice" and q_data.get("options"):
            for opt_idx, option_text in enumerate(q_data["options"]):
                answer = QuizQuestionAnswer(
                    belongs_question_id=question.question_id,
                    belongs_question_type="multiple_choice",
                    answer_title=option_text,
                    is_correct=(opt_idx == q_data.get("correctAnswer")),
                    answer_order=opt_idx
                )
                db.add(answer)

        # Add answer for true/false
        elif q_data.get("type") == "true_false":
            correct_answer = q_data.get("correctAnswer", "true")
            for opt_text, opt_val in [("True", "true"), ("False", "false")]:
                answer = QuizQuestionAnswer(
                    belongs_question_id=question.question_id,
                    belongs_question_type="true_false",
                    answer_title=opt_text,
                    is_correct=(opt_val == correct_answer),
                    answer_order=0 if opt_val == "true" else 1
                )
                db.add(answer)


        # Add answer for fill_in_blank
        elif q_data.get("type") == "fill_in_blank":
            correct_answer = str(q_data.get("correctAnswer", "")).strip()
            if correct_answer:
                answer = QuizQuestionAnswer(
                    belongs_question_id=question.question_id,
                    belongs_question_type="fill_in_blank",
                    answer_title=correct_answer,
                    is_correct=True,
                    answer_order=0
                )
                db.add(answer)
    db.commit()

    return {
        "id": quiz.id,
        "message": "Quiz updated successfully"
    }


@router.delete("/courses/{course_id}/quizzes/{quiz_id}")
async def delete_quiz(
    course_id: int,
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Delete a quiz
    """
    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id,
        Quiz.post_parent == course_id
    ).first()

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )

    # Check permission
    course = db.query(Course).filter(Course.id == course_id).first()
    if course.post_author != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this quiz"
        )

    # Delete questions and answers (cascade should handle this but let's be explicit)
    questions = db.query(QuizQuestion).filter(
        QuizQuestion.quiz_id == quiz_id
    ).all()

    for question in questions:
        db.query(QuizQuestionAnswer).filter(
            QuizQuestionAnswer.belongs_question_id == question.question_id
        ).delete()
        db.delete(question)

    db.delete(quiz)
    db.commit()

    return {"message": "Quiz deleted successfully"}


@router.post("/courses/{course_id}/quizzes/{quiz_id}/submit")
async def submit_quiz(
    course_id: int,
    quiz_id: int,
    submission_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Submit quiz answers and record attempt
    """
    from app.models.enrollment import Enrollment

    # Check if user is enrolled OR is the course author/admin
    enrollment = db.query(Enrollment).filter(
        Enrollment.course_id == course_id,
        Enrollment.user_id == current_user.id
    ).first()

    # Allow course author and admins to take quizzes without enrollment
    course_check = db.query(Course).filter(Course.id == course_id).first()
    is_owner_or_admin = course_check and (
        course_check.post_author == current_user.id or
        current_user.role == "admin"
    )

    if not enrollment and not is_owner_or_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enrolled in this course"
        )

    # Get quiz
    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id,
        Quiz.post_parent == course_id
    ).first()

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )

    # Get questions and validate answers
    questions = db.query(QuizQuestion).filter(
        QuizQuestion.quiz_id == quiz_id
    ).all()

    total_marks = 0
    earned_marks = 0
    answers_data = submission_data.get("answers", {})

    for question in questions:
        total_marks += float(question.question_mark)

        user_answer = answers_data.get(str(question.question_id))
        if user_answer is None:
            continue

        # Get correct answer
        correct_answers = db.query(QuizQuestionAnswer).filter(
            QuizQuestionAnswer.belongs_question_id == question.question_id,
            QuizQuestionAnswer.is_correct == True
        ).all()

        is_correct = False
        if question.question_type == "multiple_choice":
            # user_answer is the index
            all_answers = db.query(QuizQuestionAnswer).filter(
                QuizQuestionAnswer.belongs_question_id == question.question_id
            ).order_by(QuizQuestionAnswer.answer_order).all()

            if user_answer < len(all_answers) and all_answers[user_answer].is_correct:
                is_correct = True
        elif question.question_type == "true_false":
            # user_answer is "true" or "false"
            for ans in correct_answers:
                if ans.answer_title.lower() == str(user_answer).lower():
                    is_correct = True
                    break

        elif question.question_type in ("fill_in_blank", "short_answer"):
            for ans in correct_answers:
                if str(ans.answer_title).strip().lower() == str(user_answer).strip().lower():
                    is_correct = True
                    break
        if is_correct:
            earned_marks += float(question.question_mark)

    # Calculate percentage
    percentage = (earned_marks / total_marks * 100) if total_marks > 0 else 0

    # Create quiz attempt record
    attempt = QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz_id,
        course_id=course_id,
        total_questions=len(questions),
        total_answered_questions=len(answers_data),
        total_marks=total_marks,
        earned_marks=earned_marks,
        attempt_info=json.dumps(answers_data),
        attempt_status="attempt_ended",
        attempt_started_at=datetime.utcnow(),
        attempt_ended_at=datetime.utcnow()
    )

    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return {
        "attempt_id": attempt.attempt_id,
        "total_marks": total_marks,
        "earned_marks": earned_marks,
        "percentage": round(percentage, 2),
        "passed": percentage >= quiz.quiz_passing_grade,
        "passing_grade": quiz.quiz_passing_grade
    }


@router.get("/courses/{course_id}/quizzes/{quiz_id}/attempt")
async def get_quiz_attempt(
    course_id: int,
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_user)
):
    """
    Get the most recent quiz attempt for the current user
    """
    attempt = db.query(QuizAttempt).filter(
        QuizAttempt.quiz_id == quiz_id,
        QuizAttempt.user_id == current_user.id,
        QuizAttempt.course_id == course_id,
        QuizAttempt.attempt_status == "attempt_ended"
    ).order_by(QuizAttempt.attempt_ended_at.desc()).first()

    if not attempt:
        return None

    # Get quiz for passing grade
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()

    return {
        "attempt_id": attempt.attempt_id,
        "total_marks": float(attempt.total_marks),
        "earned_marks": float(attempt.earned_marks),
        "percentage": round((float(attempt.earned_marks) / float(attempt.total_marks) * 100) if attempt.total_marks > 0 else 0, 2),
        "passed": (float(attempt.earned_marks) / float(attempt.total_marks) * 100) >= quiz.quiz_passing_grade if attempt.total_marks > 0 else False,
        "passing_grade": quiz.quiz_passing_grade,
        "answers": json.loads(attempt.attempt_info) if attempt.attempt_info else {}
    }
