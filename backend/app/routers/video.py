import re, time, json, asyncio
from typing import Dict, Optional
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

router = APIRouter()
YTDLP = '/www/wwwroot/sasha_lms/sasha_lms/sasha_lms/backend/venv/bin/yt-dlp'
COOKIES = '/www/wwwroot/sasha_lms/sasha_lms/sasha_lms/backend/youtube_cookies.txt'
cache: Dict[str, Dict] = {}

def get_video_id(url: str) -> Optional[str]:
    for p in [r"(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([^&\n?#]+)", r"youtube\.com/shorts/([^&\n?#]+)"]:
        m = re.search(p, url)
        if m: return m.group(1)
    return None

async def extract(url: str, quality: str) -> dict:
    cmd = [YTDLP, "--cookies", COOKIES, "--js-runtimes", "node",
           "-f", f"best[height<={quality}][ext=mp4]/best[ext=mp4]/best",
           "--dump-json", "--no-playlist", "--quiet", url]
    proc = await asyncio.create_subprocess_exec(*cmd,
        stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
    stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=90)
    if proc.returncode != 0:
        raise Exception(stderr.decode().strip().split("\n")[-1])
    return json.loads(stdout.decode())

@router.get("/video")
async def get_video(url: str = Query(...), quality: str = Query("720")) -> JSONResponse:
    try:
        vid = get_video_id(url)
        if not vid:
            return JSONResponse({"success": False, "error": "Invalid URL"}, status_code=400)
        key = f"{vid}:{quality}"
        if key in cache and cache[key]["expires"] > time.time():
            return JSONResponse({"success": True, "data": {**cache[key], "cached": True}})
        info = await extract(url, quality)
        result = {"videoId": vid, "title": info.get("title"), "url": info.get("url"),
            "duration": info.get("duration"), "quality": f"{info.get('height','unknown')}p",
            "thumbnail": info.get("thumbnail"), "author": info.get("uploader"),
            "expires": time.time() + 14400, "cached": False}
        cache[key] = result
        return JSONResponse({"success": True, "data": result})
    except asyncio.TimeoutError:
        return JSONResponse({"success": False, "error": "Timed out"}, status_code=504)
    except Exception as e:
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)

@router.get("/video/cache/status")
async def cache_status():
    active = {k: v for k, v in cache.items() if v["expires"] > time.time()}
    return JSONResponse({"success": True, "cache_size": len(active)})

# Alias for backward compatibility
extract_video_id = get_video_id
