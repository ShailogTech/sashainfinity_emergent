import time, httpx, asyncio, os
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.auth_service import AuthService
import jwt

router = APIRouter()

VIDEO_SECRET = os.getenv("VIDEO_SECRET", "sasha-video-secret-change-this")
TOKEN_TTL = 3600

YTDLP = "/www/wwwroot/sasha_lms/sasha_lms/sasha_lms/backend/venv/bin/yt-dlp"
COOKIES = "/www/wwwroot/sasha_lms/sasha_lms/sasha_lms/backend/youtube_cookies.txt"

url_cache = {}


def make_token(user_id: int, lesson_id: int) -> str:
    payload = {"uid": user_id, "lid": lesson_id, "exp": time.time() + TOKEN_TTL}
    return jwt.encode(payload, VIDEO_SECRET, algorithm="HS256")


def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, VIDEO_SECRET, algorithms=["HS256"])
    except Exception:
        raise HTTPException(status_code=403, detail="Invalid or expired video token")


async def get_stream_url(youtube_url: str) -> str:
    cmd = [YTDLP, "--cookies", COOKIES, "--js-runtimes", "node",
           "-f", "best[height<=720][ext=mp4]/best[ext=mp4]/best",
           "--get-url", "--no-playlist", "--quiet", youtube_url]
    proc = await asyncio.create_subprocess_exec(*cmd,
        stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
    stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=90)
    if proc.returncode != 0:
        raise HTTPException(status_code=500, detail="Could not extract video URL")
    return stdout.decode().strip()


@router.get("/token")
async def get_video_token(
    lesson_id: int = Query(...),
    current_user=Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    token = make_token(current_user.id, lesson_id)
    return JSONResponse({"token": token, "expires_in": TOKEN_TTL})


@router.get("/stream-url")
async def get_stream_url_endpoint(
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    payload = verify_token(token)
    lesson_id = payload["lid"]

    from app.models.lesson import Lesson
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson or not lesson.video_url:
        raise HTTPException(status_code=404, detail="Lesson video not found")

    cached = url_cache.get(lesson_id)
    if cached and cached["expires"] > time.time():
        return JSONResponse({"url": cached["url"], "cached": True})

    stream_url = await get_stream_url(lesson.video_url)
    url_cache[lesson_id] = {"url": stream_url, "expires": time.time() + 14400}
    return JSONResponse({"url": stream_url, "cached": False})
