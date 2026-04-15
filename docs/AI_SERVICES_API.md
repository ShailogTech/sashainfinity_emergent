# AI-Powered Backend Services API Documentation

Complete API documentation for AI-powered backend services including auto-transcription, automated chaptering, resource extraction, and video analytics.

## Base URL

All endpoints are prefixed with `/api`, so the full base URL is:
```
http://localhost:8000/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Services Overview

### 1. Auto-Transcription Service
Convert video/audio to text with multi-language support (English, Tamil, etc.)

### 2. Automated Chaptering
Generate intelligent chapter markers with topic detection and meaningful titles

### 3. Resource Extraction
Extract mentioned websites, books, and learning materials from transcripts

### 4. Video Analytics
Track engagement, generate heatmaps, and analyze viewing patterns

---

## 1. TRANSCRIPTION ENDPOINTS

### Start Video Transcription

**Endpoint:** `POST /admin/videos/transcribe`

**Authentication:** Required (Admin/Instructor)

**Request Body:**
```json
{
  "video_id": "video_123",
  "audio_url": "https://example.com/audio.mp3",
  "language": "en"
}
```

**Parameters:**
- `video_id` (string, required): Unique identifier for the video
- `audio_url` (string, required): URL to the audio file
- `language` (string, optional): Language code (default: "en")
  - Supported: "en" (English), "ta" (Tamil), and more

**Response:**
```json
{
  "message": "Transcription job started",
  "video_id": "video_123",
  "status": "pending"
}
```

**Notes:**
- Runs asynchronously in background
- Processes audio using OpenAI Whisper
- Generates timestamp-aligned transcript segments

---

### Get Video Transcript

**Endpoint:** `GET /admin/videos/{video_id}/transcript`

**Authentication:** Required (Admin/Instructor)

**Parameters:**
- `video_id` (path parameter): Video identifier

**Response:**
```json
{
  "video_id": "video_123",
  "language": "en",
  "transcript": [
    {
      "text": "Welcome to this course",
      "start": 0.0,
      "end": 2.5
    },
    {
      "text": "We'll learn Python basics",
      "start": 2.5,
      "end": 5.0
    }
  ],
  "full_text": "Welcome to this course. We'll learn Python basics.",
  "status": "completed",
  "confidence_score": 0.95,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:35:00Z"
}
```

---

## 2. CHAPTERING ENDPOINTS

### Generate Video Chapters

**Endpoint:** `POST /admin/videos/chapter`

**Authentication:** Required (Admin/Instructor)

**Request Body:**
```json
{
  "video_id": "video_123"
}
```

**Parameters:**
- `video_id` (string, required): Video identifier

**Response:**
```json
{
  "message": "Chapter generation started",
  "video_id": "video_123"
}
```

**Notes:**
- Requires completed transcript
- Uses NLP to detect topic changes
- Generates meaningful chapter titles
- Runs asynchronously in background

---

### Get Video Chapters

**Endpoint:** `GET /admin/videos/{video_id}/chapters`

**Authentication:** Required (Admin/Instructor)

**Parameters:**
- `video_id` (path parameter): Video identifier

**Response:**
```json
[
  {
    "id": "chapter_1",
    "video_id": "video_123",
    "title": "Course Introduction | Python Basics",
    "description": "Welcome to this course. We'll learn Python basics.",
    "start_time": 0.0,
    "end_time": 120.0,
    "confidence_score": 0.75,
    "topics": ["Python", "programming", "introduction"],
    "created_at": "2024-01-15T10:35:00Z"
  }
]
```

---

## 3. RESOURCE EXTRACTION ENDPOINTS

### Extract Resources

**Endpoint:** `POST /admin/videos/extract-resources`

**Authentication:** Required (Admin/Instructor)

**Request Body:**
```json
{
  "video_id": "video_123"
}
```

**Parameters:**
- `video_id` (string, required): Video identifier

**Response:**
```json
{
  "message": "Resource extraction started",
  "video_id": "video_123"
}
```

**Notes:**
- Requires completed transcript
- Extracts URLs, books, and resources
- Auto-classifies resource types
- Runs asynchronously in background

---

### Get Video Resources

**Endpoint:** `GET /admin/videos/{video_id}/resources`

**Authentication:** Required (Admin/Instructor)

**Parameters:**
- `video_id` (path parameter): Video identifier

**Response:**
```json
[
  {
    "id": "resource_1",
    "video_id": "video_123",
    "resource_type": "website",
    "title": "docs.python.org",
    "url": "https://docs.python.org",
    "description": "Mentioned at 00:19",
    "timestamp": 19.0,
    "metadata": {
      "source": "auto_extracted"
    },
    "created_at": "2024-01-15T10:35:00Z"
  },
  {
    "id": "resource_2",
    "video_id": "video_123",
    "resource_type": "book",
    "title": "Clean Python",
    "description": "Book mentioned in video",
    "timestamp": 15.0,
    "metadata": {
      "source": "auto_extracted"
    },
    "created_at": "2024-01-15T10:35:00Z"
  }
]
```

**Resource Types:**
- `website`: General websites
- `book`: Books and publications
- `article`: Articles and papers
- `video`: Other videos
- `tool`: Development tools
- `other`: Other resources

---

## 4. VIDEO ANALYTICS ENDPOINTS

### Track Video Event

**Endpoint:** `POST /videos/track-event`

**Authentication:** Not required (client-side tracking)

**Request Body:**
```json
{
  "video_id": "video_123",
  "user_id": "user_456",
  "session_id": "session_789",
  "event_type": "play",
  "timestamp": 45.5,
  "metadata": {
    "quality": "1080p",
    "playback_rate": 1.0
  }
}
```

**Parameters:**
- `video_id` (string, required): Video identifier
- `user_id` (string, required): User identifier
- `session_id` (string, required): Session identifier
- `event_type` (string, required): Event type
  - `play`: User started/resumed playing
  - `pause`: User paused the video
  - `seek`: User seeked to different position
  - `complete`: User finished watching
  - `buffer`: Video buffering event
- `timestamp` (number, required): Video position in seconds
- `metadata` (object, optional): Additional event data

**Response:**
```json
{
  "message": "Event tracked successfully",
  "event_id": "event_123"
}
```

---

### Start Video Session

**Endpoint:** `POST /videos/session/start`

**Authentication:** Not required (client-side tracking)

**Request Body:**
```json
{
  "video_id": "video_123",
  "user_id": "user_456",
  "video_duration": 300.0
}
```

**Response:**
```json
{
  "message": "Session started successfully",
  "session_id": "session_abc123",
  "video_id": "video_123"
}
```

---

### Update Video Session

**Endpoint:** `PUT /videos/session/{session_id}`

**Authentication:** Not required (client-side tracking)

**Request Body:**
```json
{
  "end_time": "2024-01-15T11:00:00Z",
  "watch_time": 250.5,
  "last_position": 295.0,
  "completed": true
}
```

**Parameters:**
- `end_time` (datetime, optional): Session end time
- `watch_time` (number, optional): Total time watched in seconds
- `last_position` (number, optional): Last video position
- `completed` (boolean, optional): Whether video was completed

**Response:**
```json
{
  "message": "Session updated successfully"
}
```

---

### Get Video Analytics

**Endpoint:** `GET /videos/{video_id}/analytics`

**Authentication:** Required (Admin/Instructor)

**Parameters:**
- `video_id` (path parameter): Video identifier

**Response:**
```json
{
  "video_id": "video_123",
  "heatmap": {
    "video_id": "video_123",
    "total_views": 150,
    "unique_viewers": 120,
    "heatmap_data": [
      {
        "timestamp": 0,
        "engagement_count": 150
      },
      {
        "timestamp": 30,
        "engagement_count": 45
      }
    ],
    "drop_off_points": [
      {
        "timestamp": 120.0,
        "drop_count": 25
      }
    ],
    "most_replayed": [
      {
        "timestamp": 45.0,
        "replay_count": 30
      }
    ],
    "average_completion_rate": 85.5
  },
  "statistics": {
    "video_id": "video_123",
    "total_views": 150,
    "unique_viewers": 120,
    "average_watch_time": 245.5,
    "average_completion_rate": 85.5,
    "total_watch_time": 36825.0,
    "peak_concurrent_viewers": 15
  }
}
```

---

### Get Video Heatmap

**Endpoint:** `GET /videos/{video_id}/heatmap`

**Authentication:** Required (Admin/Instructor)

**Parameters:**
- `video_id` (path parameter): Video identifier

**Response:**
```json
{
  "video_id": "video_123",
  "total_views": 150,
  "unique_viewers": 120,
  "heatmap_data": [
    {
      "timestamp": 0,
      "engagement_count": 150
    }
  ],
  "drop_off_points": [
    {
      "timestamp": 120.0,
      "drop_count": 25
    }
  ],
  "most_replayed": [
    {
      "timestamp": 45.0,
      "replay_count": 30
    }
  ],
  "average_completion_rate": 85.5
}
```

---

### Get Video Statistics

**Endpoint:** `GET /videos/{video_id}/statistics`

**Authentication:** Required (Admin/Instructor)

**Parameters:**
- `video_id` (path parameter): Video identifier

**Response:**
```json
{
  "video_id": "video_123",
  "total_views": 150,
  "unique_viewers": 120,
  "average_watch_time": 245.5,
  "average_completion_rate": 85.5,
  "total_watch_time": 36825.0,
  "peak_concurrent_viewers": 15
}
```

---

### Get User Viewing History

**Endpoint:** `GET /users/{user_id}/viewing-history`

**Authentication:** Required

**Parameters:**
- `user_id` (path parameter): User identifier
- `limit` (query parameter, optional): Number of records (default: 20)

**Response:**
```json
[
  {
    "video_id": "video_123",
    "session_id": "session_abc",
    "start_time": "2024-01-15T10:00:00Z",
    "end_time": "2024-01-15T10:05:00Z",
    "watch_time": 250.5,
    "completed": true,
    "last_position": 295.0
  }
]
```

---

### Get Analytics Dashboard

**Endpoint:** `GET /admin/analytics/dashboard`

**Authentication:** Required (Admin/Instructor)

**Response:**
```json
{
  "total_sessions": 5000,
  "total_events": 45000,
  "top_performing_videos": [
    {
      "video_id": "video_123",
      "total_views": 500,
      "unique_viewers": 450
    }
  ],
  "generated_at": "2024-01-15T10:30:00Z"
}
```

---

## 5. COMBINED ANALYSIS ENDPOINTS

### Get Complete Video Analysis

**Endpoint:** `GET /videos/{video_id}/analysis`

**Authentication:** Required

**Parameters:**
- `video_id` (path parameter): Video identifier

**Response:**
```json
{
  "video_id": "video_123",
  "has_transcript": true,
  "has_chapters": true,
  "has_resources": true,
  "transcript_status": "completed",
  "chapters_count": 5,
  "resources_count": 3,
  "last_updated": "2024-01-15T10:35:00Z"
}
```

---

### Analyze Video (Complete Pipeline)

**Endpoint:** `POST /admin/videos/analyze`

**Authentication:** Required (Admin/Instructor)

**Request Body:**
```json
{
  "video_id": "video_123",
  "perform_transcription": true,
  "audio_url": "https://example.com/audio.mp3",
  "generate_chapters": true,
  "extract_resources": true
}
```

**Parameters:**
- `video_id` (string, required): Video identifier
- `perform_transcription` (boolean, optional): Start transcription job
- `audio_url` (string, optional): Audio URL (required if perform_transcription is true)
- `generate_chapters` (boolean, optional): Generate chapters (default: true)
- `extract_resources` (boolean, optional): Extract resources (default: true)

**Response:**
```json
{
  "message": "Video analysis jobs started",
  "video_id": "video_123",
  "jobs": {
    "transcription": "started",
    "chaptering": "started",
    "resource_extraction": "started"
  }
}
```

**Notes:**
- Orchestrates complete analysis pipeline
- All jobs run asynchronously in background
- Can skip transcription if already completed

---

## ERROR RESPONSES

All endpoints may return error responses:

```json
{
  "detail": "Error message description"
}
```

**Common HTTP Status Codes:**
- `400`: Bad Request - Invalid parameters
- `401`: Unauthorized - Missing or invalid authentication
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource doesn't exist
- `500`: Internal Server Error - Server-side error

---

## RATE LIMITING

Current implementation doesn't include rate limiting, but it's recommended for production:
- Transcription endpoints: 10 requests/minute per user
- Analytics endpoints: 100 requests/minute per user
- Other endpoints: Standard rate limits

---

## DATA MODELS

### Transcription Status
- `pending`: Job queued
- `processing`: Actively processing
- `completed`: Successfully completed
- `failed`: Failed with error

### Resource Types
- `website`: General websites
- `book`: Books and publications
- `article`: Articles and papers
- `video`: Other video resources
- `tool`: Development tools and repositories
- `other`: Uncategorized resources

### Event Types
- `play`: Video started/resumed
- `pause`: Video paused
- `seek`: User seeked to position
- `complete`: Video finished
- `buffer`: Buffering event

---

## TESTING

Run the comprehensive test suite:

```bash
cd backend
python test_ai_backend.py
```

This will test all AI services with mock data to verify functionality.

---

## DEPLOYMENT NOTES

### Prerequisites
1. MongoDB connection configured in `.env`
2. Sufficient disk space for audio processing
3. Python 3.8+ with required dependencies

### Environment Variables
```bash
MONGO_URL=mongodb://localhost:27017
DB_NAME=sashainfinity_lms
JWT_SECRET_KEY=your-secret-key
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Performance Considerations
- Transcription is CPU-intensive; consider dedicated workers
- Background tasks use FastAPI's BackgroundTasks
- For high-volume production, consider Celery + Redis
- Analytics queries can be optimized with database indexing

### Scaling Recommendations
1. Use separate worker processes for CPU-intensive tasks
2. Implement caching for frequently accessed analytics
3. Consider CDN for audio file distribution
4. Monitor database performance and optimize queries

---

## SUPPORT

For issues or questions:
- Check logs in the backend console
- Review MongoDB collections for data issues
- Test individual services using the test suite
- API documentation available at `/docs` when running