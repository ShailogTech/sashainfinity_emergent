# AI-Powered Content Management Services

This document describes the AI-powered content management services for the Learning Management System backend.

## Overview

The AI services provide automated content analysis and enhancement for video content:

1. **Auto-Transcription** - Generate subtitles from video audio using OpenAI Whisper
2. **Automated Chaptering** - Analyze video content to create intelligent chapters
3. **Resource Extraction** - Detect and categorize mentioned websites, books, and resources

## Installation

### Prerequisites

- Python 3.8+
- MongoDB
- ffmpeg (for audio processing)

### Setup

#### Windows
```bash
cd backend
setup_ai.bat
```

#### Linux/Mac
```bash
cd backend
chmod +x setup_ai.sh
./setup_ai.sh
```

### Manual Installation

If the setup scripts don't work, install dependencies manually:

```bash
# Install Python dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Download NLTK data
python -c "import nltk; nltk.download('punkt')"

# Install ffmpeg
# Ubuntu/Debian: sudo apt-get install ffmpeg
# Mac: brew install ffmpeg
# Windows: Download from https://ffmpeg.org/download.html
```

## API Endpoints

### 1. Start Transcription

**Endpoint:** `POST /api/admin/videos/transcribe`

**Description:** Start background transcription job for a video

**Request Body:**
```json
{
  "video_id": "video-123",
  "audio_url": "/path/to/audio.mp3",
  "language": "en"
}
```

**Supported Languages:**
- `en` - English
- `ta` - Tamil
- `es` - Spanish
- `fr` - French
- `de` - German
- And more (see Whisper documentation)

**Response:**
```json
{
  "message": "Transcription job started",
  "video_id": "video-123",
  "status": "pending"
}
```

### 2. Get Transcript

**Endpoint:** `GET /api/admin/videos/{video_id}/transcript`

**Description:** Get transcript for a specific video

**Response:**
```json
{
  "video_id": "video-123",
  "language": "en",
  "status": "completed",
  "transcript": [
    {
      "text": "Hello and welcome to this course",
      "start": 0.0,
      "end": 2.5
    },
    {
      "text": "Today we will learn about React",
      "start": 2.5,
      "end": 5.0
    }
  ],
  "full_text": "Hello and welcome to this course. Today we will learn about React.",
  "confidence_score": 0.95,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:35:00Z"
}
```

### 3. Generate Chapters

**Endpoint:** `POST /api/admin/videos/chapter`

**Description:** Automatically generate chapters from video transcript

**Request Body:**
```json
{
  "video_id": "video-123"
}
```

**Response:**
```json
{
  "message": "Chapter generation started",
  "video_id": "video-123"
}
```

### 4. Get Chapters

**Endpoint:** `GET /api/admin/videos/{video_id}/chapters`

**Description:** Get generated chapters for a video

**Response:**
```json
[
  {
    "video_id": "video-123",
    "title": "Introduction | React Course",
    "description": "Hello and welcome to this course. Today we will learn about React.",
    "start_time": 0.0,
    "end_time": 120.0,
    "confidence_score": 0.75,
    "topics": ["React"],
    "created_at": "2024-01-15T10:35:00Z"
  },
  {
    "video_id": "video-123",
    "title": "Setup | Installation Process",
    "description": "First, let's set up our development environment...",
    "start_time": 120.0,
    "end_time": 240.0,
    "confidence_score": 0.75,
    "topics": ["development", "environment"],
    "created_at": "2024-01-15T10:35:00Z"
  }
]
```

### 5. Extract Resources

**Endpoint:** `POST /api/admin/videos/extract-resources`

**Description:** Extract resources (URLs, books, etc.) from video content

**Request Body:**
```json
{
  "video_id": "video-123"
}
```

**Response:**
```json
{
  "message": "Resource extraction started",
  "video_id": "video-123"
}
```

### 6. Get Resources

**Endpoint:** `GET /api/admin/videos/{video_id}/resources`

**Description:** Get extracted resources for a video

**Response:**
```json
[
  {
    "video_id": "video-123",
    "resource_type": "website",
    "title": "react.dev",
    "url": "https://react.dev",
    "description": "Mentioned at 02:15",
    "timestamp": 135.0,
    "metadata": {
      "source": "auto_extracted"
    },
    "created_at": "2024-01-15T10:35:00Z"
  },
  {
    "video_id": "video-123",
    "resource_type": "book",
    "title": "React Quickly",
    "description": "Book mentioned in video",
    "timestamp": 45.0,
    "metadata": {
      "source": "auto_extracted"
    },
    "created_at": "2024-01-15T10:35:00Z"
  }
]
```

### 7. Get Video Analysis

**Endpoint:** `GET /api/videos/{video_id}/analysis`

**Description:** Get complete analysis overview for a video

**Response:**
```json
{
  "video_id": "video-123",
  "has_transcript": true,
  "has_chapters": true,
  "has_resources": true,
  "transcript_status": "completed",
  "chapters_count": 5,
  "resources_count": 3,
  "last_updated": "2024-01-15T10:35:00Z"
}
```

### 8. Complete Video Analysis

**Endpoint:** `POST /api/admin/videos/analyze`

**Description:** Perform complete analysis (transcription, chaptering, resource extraction) in one call

**Request Body:**
```json
{
  "video_id": "video-123",
  "perform_transcription": true,
  "audio_url": "/path/to/audio.mp3",
  "generate_chapters": true,
  "extract_resources": true
}
```

**Response:**
```json
{
  "message": "Video analysis jobs started",
  "video_id": "video-123",
  "jobs": {
    "transcription": "started",
    "chaptering": "started",
    "resource_extraction": "started"
  }
}
```

## Database Models

### Transcripts Collection
```javascript
{
  video_id: String,
  audio_url: String,
  language: String,
  status: String, // pending, processing, completed, failed
  transcript: Array of {
    text: String,
    start: Float,
    end: Float
  },
  full_text: String,
  confidence_score: Float,
  created_at: ISODate,
  updated_at: ISODate,
  error_message: String (optional)
}
```

### Chapters Collection
```javascript
{
  video_id: String,
  title: String,
  description: String,
  start_time: Float,
  end_time: Float,
  confidence_score: Float,
  topics: Array of Strings,
  created_at: ISODate
}
```

### Resources Collection
```javascript
{
  video_id: String,
  resource_type: String, // website, book, article, video, tool, other
  title: String,
  url: String (optional),
  description: String (optional),
  timestamp: Float (optional),
  metadata: Object,
  created_at: ISODate
}
```

## Usage Examples

### Example 1: Complete Workflow

```python
import requests

BASE_URL = "http://localhost:8000/api"

# 1. Start transcription
response = requests.post(f"{BASE_URL}/admin/videos/transcribe", json={
    "video_id": "intro-to-react",
    "audio_url": "/videos/intro-to-react.mp3",
    "language": "en"
})
print(response.json())

# 2. Wait for transcription to complete, then generate chapters
response = requests.post(f"{BASE_URL}/admin/videos/chapter", json={
    "video_id": "intro-to-react"
})
print(response.json())

# 3. Extract resources
response = requests.post(f"{BASE_URL}/admin/videos/extract-resources", json={
    "video_id": "intro-to-react"
})
print(response.json())

# 4. Get complete analysis
response = requests.get(f"{BASE_URL}/videos/intro-to-react/analysis")
print(response.json())
```

### Example 2: One-Click Analysis

```python
import requests

BASE_URL = "http://localhost:8000/api"

# Perform complete analysis in one call
response = requests.post(f"{BASE_URL}/admin/videos/analyze", json={
    "video_id": "advanced-python",
    "perform_transcription": True,
    "audio_url": "/videos/advanced-python.mp3",
    "generate_chapters": True,
    "extract_resources": True
})
print(response.json())
```

## Performance Considerations

### Transcription
- **Whisper Base Model**: ~1-2 minutes per 10 minutes of audio
- **Memory Usage**: ~1-2GB RAM
- **First Run**: Downloads model (~150MB)

### Chaptering
- **Processing Time**: ~10-30 seconds for most videos
- **Memory Usage**: ~500MB RAM
- **Accuracy**: Improves with better transcripts

### Resource Extraction
- **Processing Time**: ~5-15 seconds
- **Memory Usage**: ~200MB RAM
- **Accuracy**: Depends on transcript quality

## Troubleshooting

### Issue: "Whisper model not available"
**Solution**: The model downloads automatically on first use. Check your internet connection and available disk space (~150MB).

### Issue: "spaCy model not found"
**Solution**: Run `python -m spacy download en_core_web_sm`

### Issue: "Transcription failed"
**Solution**:
- Ensure ffmpeg is installed
- Check audio file format (mp3, wav, m4a supported)
- Verify audio file is not corrupted

### Issue: "Chapter generation failed"
**Solution**:
- Ensure transcript is completed first
- Check that transcript has content
- Verify NLP models are installed

### Issue: "Resource extraction returns empty"
**Solution**:
- Check if video contains URLs or resource mentions
- Verify transcript quality
- Check transcript language support

## Language Support

### Transcription
Supports 99 languages via Whisper, including:
- English (en)
- Tamil (ta)
- Hindi (hi)
- Spanish (es)
- French (fr)
- German (de)
- Chinese (zh)
- Japanese (ja)
- And 90+ more

### Chaptering & Resource Extraction
Currently optimized for English. Other languages may have reduced accuracy.

## Future Enhancements

- [ ] Support for video upload and processing
- [ ] Real-time transcription streaming
- [ ] Custom vocabulary for technical terms
- [ ] Multi-speaker detection
- [ ] Sentiment analysis
- [ ] Keyword extraction
- [ ] Quiz generation from content
- [ ] Summary generation
- [ ] Translation services

## Contributing

When adding new AI features:
1. Create service class in `ai_services.py`
2. Add background task function
3. Create API endpoint in `server.py`
4. Update this documentation
5. Add error handling and logging

## License

This implementation uses open-source AI libraries:
- OpenAI Whisper (MIT License)
- spaCy (MIT License)
- NLTK (Apache License 2.0)
