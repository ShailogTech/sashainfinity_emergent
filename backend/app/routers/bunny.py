import httpx, os
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import JSONResponse
from app.services.auth_service import AuthService

router = APIRouter()

BUNNY_LIBRARY_ID = os.getenv("BUNNY_LIBRARY_ID", "618286")
BUNNY_API_KEY = os.getenv("BUNNY_API_KEY", "")
BUNNY_CDN_HOSTNAME = os.getenv("BUNNY_CDN_HOSTNAME", "vz-60dda74a-f32.b-cdn.net")


@router.post("/video")
async def upload_video_to_bunny(
    file: UploadFile = File(...),
    current_user=Depends(AuthService.get_current_user)
):
    """Upload video directly to Bunny Stream"""
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(status_code=403, detail="Only instructors can upload videos")

    if not file.content_type or not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video")

    try:
        # Step 1: Create video object in Bunny
        async with httpx.AsyncClient(timeout=30) as client:
            create_res = await client.post(
                f"https://video.bunnycdn.com/library/{BUNNY_LIBRARY_ID}/videos",
                headers={"AccessKey": BUNNY_API_KEY, "Content-Type": "application/json"},
                json={"title": file.filename or "Untitled"}
            )
            if create_res.status_code != 200:
                raise HTTPException(status_code=500, detail="Failed to create video on Bunny")
            video_data = create_res.json()
            video_id = video_data["guid"]

        # Step 2: Upload video content to Bunny
        video_content = await file.read()
        async with httpx.AsyncClient(timeout=300) as client:
            upload_res = await client.put(
                f"https://video.bunnycdn.com/library/{BUNNY_LIBRARY_ID}/videos/{video_id}",
                headers={"AccessKey": BUNNY_API_KEY, "Content-Type": "application/octet-stream"},
                content=video_content
            )
            if upload_res.status_code != 200:
                raise HTTPException(status_code=500, detail="Failed to upload video to Bunny")

        # Return HLS URL
        hls_url = f"https://{BUNNY_CDN_HOSTNAME}/{video_id}/playlist.m3u8"
        thumbnail_url = f"https://{BUNNY_CDN_HOSTNAME}/{video_id}/thumbnail.jpg"

        return JSONResponse({
            "success": True,
            "video_id": video_id,
            "file_url": hls_url,
            "thumbnail_url": thumbnail_url,
            "hls_url": hls_url,
            "filename": file.filename,
            "original_filename": file.filename,
            "size": len(video_content),
            "content_type": file.content_type
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/video/{video_id}/status")
async def get_video_status(
    video_id: str,
    current_user=Depends(AuthService.get_current_user)
):
    """Check Bunny video processing status"""
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.get(
            f"https://video.bunnycdn.com/library/{BUNNY_LIBRARY_ID}/videos/{video_id}",
            headers={"AccessKey": BUNNY_API_KEY}
        )
        data = res.json()
        # status 4 = ready, 3 = processing, 2 = queued
        return JSONResponse({
            "status": data.get("status"),
            "ready": data.get("status") == 4,
            "title": data.get("title"),
            "length": data.get("length"),
            "hls_url": f"https://{BUNNY_CDN_HOSTNAME}/{video_id}/playlist.m3u8"
        })
