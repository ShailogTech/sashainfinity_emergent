from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from app.core.database import get_db
from app.services.auth_service import AuthService

router = APIRouter()

class ProgressUpdate(BaseModel):
    lesson_id: int
    course_id: int
    watched_seconds: float
    total_seconds: float

@router.post("/save")
async def save_progress(
    data: ProgressUpdate,
    current_user=Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    is_completed = data.total_seconds > 0 and (data.watched_seconds / data.total_seconds) >= 0.9
    db.execute(text("""
        INSERT INTO video_progress (user_id, course_id, lesson_id, watched_seconds, total_seconds, is_completed, last_watched_at)
        VALUES (:uid, :cid, :lid, :ws, :ts, :done, NOW())
        ON CONFLICT (user_id, lesson_id) DO UPDATE SET
            watched_seconds = GREATEST(video_progress.watched_seconds, :ws),
            total_seconds = :ts,
            is_completed = :done,
            last_watched_at = NOW()
    """), {"uid": current_user.id, "cid": data.course_id, "lid": data.lesson_id,
           "ws": data.watched_seconds, "ts": data.total_seconds, "done": is_completed})
    db.commit()
    return JSONResponse({"success": True, "completed": is_completed})

@router.get("/get/{lesson_id}")
async def get_progress(
    lesson_id: int,
    current_user=Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    row = db.execute(text("""
        SELECT watched_seconds, total_seconds, is_completed
        FROM video_progress WHERE user_id=:uid AND lesson_id=:lid
    """), {"uid": current_user.id, "lid": lesson_id}).fetchone()
    if not row:
        return JSONResponse({"watched_seconds": 0, "is_completed": False})
    return JSONResponse({
        "watched_seconds": float(row.watched_seconds),
        "total_seconds": float(row.total_seconds) if row.total_seconds else 0,
        "is_completed": row.is_completed
    })

@router.get("/course/{course_id}")
async def get_course_progress(
    course_id: int,
    current_user=Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    rows = db.execute(text("""
        SELECT lesson_id, watched_seconds, total_seconds, is_completed
        FROM video_progress WHERE user_id=:uid AND course_id=:cid
    """), {"uid": current_user.id, "cid": course_id}).fetchall()
    return JSONResponse({
        "progress": {r.lesson_id: {
            "watched_seconds": float(r.watched_seconds),
            "is_completed": r.is_completed
        } for r in rows}
    })
