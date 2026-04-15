"""
AI-powered content management services for video processing.
Includes transcription, chaptering, resource extraction, and analytics.
"""

import logging
import asyncio
from functools import partial
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from enum import Enum
import json

import re


class TranscriptionStatus(str, Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class ResourceType(str, Enum):
    website = "website"
    book = "book"
    article = "article"
    video = "video"
    tool = "tool"
    other = "other"


class TranscriptionService:
    """Service for handling video transcription using Whisper"""

    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        """Lazy load Whisper model"""
        try:
            import whisper
            # Use base model for balance between speed and accuracy
            self.model = whisper.load_model("base")
            logging.info("Whisper model loaded successfully")
        except Exception as e:
            logging.error(f"Failed to load Whisper model: {e}")
            self.model = None

    async def transcribe_audio(self, audio_file_path: str, language: str = "en") -> Dict[str, Any]:
        """Transcribe audio file using Whisper"""
        try:
            if not self.model:
                raise Exception("Whisper model not available")

            # Run in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                partial(self.model.transcribe, audio_file_path, language=language, task="transcribe")
            )

            # Process segments into our format
            transcript_segments = []
            for segment in result["segments"]:
                transcript_segments.append({
                    "text": segment["text"].strip(),
                    "start": segment["start"],
                    "end": segment["end"]
                })

            return {
                "transcript": transcript_segments,
                "full_text": result["text"],
                "language": result.get("language", language),
                "confidence": 0.95  # Whisper doesn't provide per-word confidence easily
            }
        except Exception as e:
            logging.error(f"Transcription failed: {e}")
            raise


class ChapteringService:
    """Service for automatic video chaptering"""

    def __init__(self):
        self._load_nlp_models()

    def _load_nlp_models(self):
        """Load NLP models for text analysis"""
        try:
            import spacy
            import nltk
            from nltk.tokenize import sent_tokenize

            # Download required NLTK data
            try:
                nltk.data.find('tokenizers/punkt')
            except LookupError:
                nltk.download('punkt', quiet=True)

            # Load spaCy model (use en_core_web_sm for speed)
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except OSError:
                # Fallback if model not installed
                logging.warning("spaCy model not found, chaptering will be basic")
                self.nlp = None

            logging.info("NLP models loaded for chaptering")
        except Exception as e:
            logging.error(f"Failed to load NLP models: {e}")
            self.nlp = None

    async def generate_chapters(self, transcript_segments: List[Dict[str, Any]], video_id: str) -> List[Dict[str, Any]]:
        """Generate chapters from transcript segments"""
        try:
            chapters = []

            if not transcript_segments:
                return chapters

            # Group segments into chunks (every ~2 minutes)
            chunk_duration = 120  # 2 minutes
            current_chunk = []
            current_start = transcript_segments[0]["start"]

            for segment in transcript_segments:
                current_chunk.append(segment)

                # Check if we should create a chapter
                if (segment["end"] - current_start) >= chunk_duration:
                    # Create chapter from this chunk
                    chapter_text = " ".join([s["text"] for s in current_chunk])
                    chapter_title = self._extract_chapter_title(chapter_text)
                    chapter_desc = self._generate_chapter_description(chapter_text)
                    topics = self._extract_topics(chapter_text)

                    chapters.append({
                        "video_id": video_id,
                        "title": chapter_title,
                        "description": chapter_desc,
                        "start_time": current_start,
                        "end_time": segment["end"],
                        "confidence_score": 0.75,
                        "topics": topics
                    })

                    # Start new chunk
                    current_start = segment["end"]
                    current_chunk = []

            # Handle remaining segments
            if current_chunk:
                chapter_text = " ".join([s["text"] for s in current_chunk])
                chapters.append({
                    "video_id": video_id,
                    "title": self._extract_chapter_title(chapter_text),
                    "description": self._generate_chapter_description(chapter_text),
                    "start_time": current_start,
                    "end_time": current_chunk[-1]["end"],
                    "confidence_score": 0.75,
                    "topics": self._extract_topics(chapter_text)
                })

            return chapters
        except Exception as e:
            logging.error(f"Chapter generation failed: {e}")
            raise

    def _extract_chapter_title(self, text: str) -> str:
        """Extract a meaningful title from text"""
        try:
            if self.nlp:
                doc = self.nlp(text[:500])  # Analyze first 500 chars
                # Extract key noun phrases
                noun_phrases = [chunk.text for chunk in doc.noun_chunks[:3]]
                if noun_phrases:
                    return " | ".join(noun_phrases).title()

            # Fallback: use first sentence
            first_sentence = text.split('.')[0].strip()
            return first_sentence[:50] + "..." if len(first_sentence) > 50 else first_sentence
        except:
            return "Chapter"

    def _generate_chapter_description(self, text: str) -> str:
        """Generate a brief description of the chapter content"""
        try:
            # Take first few sentences as description
            sentences = text.split('.')
            description = '. '.join(sentences[:2]).strip()
            return description[:200] + "..." if len(description) > 200 else description
        except:
            return text[:100] + "..."

    def _extract_topics(self, text: str) -> List[str]:
        """Extract key topics from text"""
        try:
            if self.nlp:
                doc = self.nlp(text)
                # Extract named entities and key terms
                entities = [ent.text for ent in doc.ents[:5]]
                return list(set(entities))
            return []
        except:
            return []


class ResourceExtractionService:
    """Service for extracting resources from video content"""

    def __init__(self):
        self.re = re

    async def extract_resources(self, transcript_segments: List[Dict[str, Any]], video_id: str) -> List[Dict[str, Any]]:
        """Extract resources from transcript"""
        try:
            resources = []
            full_text = " ".join([s["text"] for s in transcript_segments])

            # Extract URLs
            url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
            urls = self.re.findall(url_pattern, full_text)

            for url in urls:
                # Find timestamp for this URL
                timestamp = self._find_timestamp_for_text(transcript_segments, url)
                resource_type = self._classify_resource(url)

                resources.append({
                    "video_id": video_id,
                    "resource_type": resource_type,
                    "title": self._extract_title_from_url(url),
                    "url": url,
                    "description": f"Mentioned at {self._format_timestamp(timestamp)}",
                    "timestamp": timestamp,
                    "metadata": {"source": "auto_extracted"}
                })

            # Extract book mentions (basic pattern)
            book_patterns = [
                r'(?:book|called|titled|written by)\s+["\']([^"\']+)["\']',
                r'(?:read|check out)\s+["\']([^"\']+)["\']',
            ]

            for pattern in book_patterns:
                matches = self.re.findall(pattern, full_text, self.re.IGNORECASE)
                for match in matches:
                    timestamp = self._find_timestamp_for_text(transcript_segments, match)
                    resources.append({
                        "video_id": video_id,
                        "resource_type": ResourceType.book,
                        "title": match.strip(),
                        "description": "Book mentioned in video",
                        "timestamp": timestamp,
                        "metadata": {"source": "auto_extracted"}
                    })

            return resources
        except Exception as e:
            logging.error(f"Resource extraction failed: {e}")
            raise

    def _find_timestamp_for_text(self, segments: List[Dict[str, Any]], text: str) -> float:
        """Find the timestamp where a text appears"""
        for segment in segments:
            if text.lower() in segment["text"].lower():
                return segment["start"]
        return 0.0

    def _classify_resource(self, url: str) -> ResourceType:
        """Classify a URL by resource type"""
        url_lower = url.lower()
        if any(domain in url_lower for domain in ['github.com', 'gitlab.com']):
            return ResourceType.tool
        elif any(domain in url_lower for domain in ['youtube.com', 'vimeo.com']):
            return ResourceType.video
        elif any(domain in url_lower for domain in ['amazon.com', 'goodreads.com']):
            return ResourceType.book
        elif any(ext in url_lower for ext in ['.pdf', '.doc', '.docx']):
            return ResourceType.article
        return ResourceType.website

    def _extract_title_from_url(self, url: str) -> str:
        """Extract a readable title from URL"""
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            domain = parsed.netloc.replace('www.', '')
            path = parsed.path.rstrip('/')
            if path:
                return f"{domain}{path}"
            return domain
        except:
            return url

    def _format_timestamp(self, seconds: float) -> str:
        """Format timestamp as MM:SS"""
        minutes = int(seconds // 60)
        secs = int(seconds % 60)
        return f"{minutes:02d}:{secs:02d}"


class VideoAnalyticsService:
    """Service for tracking and analyzing video engagement"""

    def __init__(self):
        pass

    async def record_view_event(self, video_id: str, user_id: str, event_type: str,
                                timestamp: float, session_id: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Record a video viewing event"""
        try:
            event = {
                "video_id": video_id,
                "user_id": user_id,
                "session_id": session_id,
                "event_type": event_type,  # play, pause, seek, complete, buffer
                "timestamp": timestamp,
                "server_time": datetime.now(timezone.utc).isoformat(),
                "metadata": metadata or {}
            }
            return event
        except Exception as e:
            logging.error(f"Failed to record view event: {e}")
            raise

    async def generate_heatmap_data(self, video_id: str, db) -> Dict[str, Any]:
        """Generate heatmap data showing engagement across video timeline"""
        try:
            # Get all viewing events for this video
            events = await db.video_events.find({"video_id": video_id}).to_list(None)

            if not events:
                return {
                    "video_id": video_id,
                    "total_views": 0,
                    "unique_viewers": 0,
                    "heatmap_data": [],
                    "drop_off_points": [],
                    "most_replayed": [],
                    "average_completion_rate": 0.0
                }

            # Calculate basic statistics
            total_views = len(await db.video_sessions.find({"video_id": video_id}).to_list(None))
            unique_viewers = len(set([e["user_id"] for e in events]))

            # Generate heatmap data (group by time intervals)
            heatmap_bins = {}
            drop_off_points = {}

            for event in events:
                if event["event_type"] == "pause":
                    # Round timestamp to nearest 5 seconds
                    time_bin = int(event["timestamp"] // 5) * 5
                    heatmap_bins[time_bin] = heatmap_bins.get(time_bin, 0) + 1

                if event["event_type"] == "complete":
                    # Mark where users stopped watching
                    drop_off_points[event["timestamp"]] = drop_off_points.get(event["timestamp"], 0) + 1

            # Convert to sorted list
            heatmap_data = [
                {"timestamp": ts, "engagement_count": count}
                for ts, count in sorted(heatmap_bins.items())
            ]

            # Find drop-off points (where multiple users stopped)
            drop_off_sorted = sorted(drop_off_points.items(), key=lambda x: x[1], reverse=True)
            drop_off_points_data = [
                {"timestamp": ts, "drop_count": count}
                for ts, count in drop_off_sorted[:10]  # Top 10 drop-off points
            ]

            # Find most replayed segments (where users sought back to)
            replay_events = [e for e in events if e["event_type"] == "seek" and e.get("metadata", {}).get("direction") == "backward"]
            replay_counts = {}
            for event in replay_events:
                replay_counts[event["timestamp"]] = replay_counts.get(event["timestamp"], 0) + 1

            most_replayed = [
                {"timestamp": ts, "replay_count": count}
                for ts, count in sorted(replay_counts.items(), key=lambda x: x[1], reverse=True)[:10]
            ]

            # Calculate average completion rate
            completion_events = [e for e in events if e["event_type"] == "complete"]
            avg_completion = 0.0
            if completion_events:
                # Get video duration from first session
                sessions = await db.video_sessions.find({"video_id": video_id}).to_list(1)
                if sessions and "video_duration" in sessions[0]:
                    video_duration = sessions[0]["video_duration"]
                    if video_duration > 0:
                        total_completion = sum([e["timestamp"] for e in completion_events])
                        avg_completion = (total_completion / len(completion_events) / video_duration) * 100

            return {
                "video_id": video_id,
                "total_views": total_views,
                "unique_viewers": unique_viewers,
                "heatmap_data": heatmap_data,
                "drop_off_points": drop_off_points_data,
                "most_replayed": most_replayed,
                "average_completion_rate": round(avg_completion, 2)
            }
        except Exception as e:
            logging.error(f"Failed to generate heatmap data: {e}")
            raise

    async def get_video_statistics(self, video_id: str, db) -> Dict[str, Any]:
        """Get comprehensive viewing statistics for a video"""
        try:
            # Get all sessions for this video
            sessions = await db.video_sessions.find({"video_id": video_id}).to_list(None)

            if not sessions:
                return {
                    "video_id": video_id,
                    "total_views": 0,
                    "unique_viewers": 0,
                    "average_watch_time": 0.0,
                    "average_completion_rate": 0.0,
                    "total_watch_time": 0.0,
                    "peak_concurrent_viewers": 0
                }

            # Calculate statistics
            total_views = len(sessions)
            unique_viewers = len(set([s["user_id"] for s in sessions]))
            total_watch_time = sum([s.get("watch_time", 0.0) for s in sessions])
            average_watch_time = total_watch_time / total_views if total_views > 0 else 0.0

            # Calculate completion rate
            completed_sessions = [s for s in sessions if s.get("completed", False)]
            completion_rate = (len(completed_sessions) / total_views * 100) if total_views > 0 else 0.0

            # Find peak concurrent viewers (simplified - within same minute)
            view_intervals = []
            for session in sessions:
                if "start_time" in session and "end_time" in session:
                    view_intervals.append((
                        datetime.fromisoformat(session["start_time"]),
                        datetime.fromisoformat(session["end_time"])
                    ))

            peak_concurrent = self._calculate_peak_concurrent(view_intervals)

            return {
                "video_id": video_id,
                "total_views": total_views,
                "unique_viewers": unique_viewers,
                "average_watch_time": round(average_watch_time, 2),
                "average_completion_rate": round(completion_rate, 2),
                "total_watch_time": round(total_watch_time, 2),
                "peak_concurrent_viewers": peak_concurrent
            }
        except Exception as e:
            logging.error(f"Failed to get video statistics: {e}")
            raise

    def _calculate_peak_concurrent(self, intervals: List[tuple]) -> int:
        """Calculate peak number of concurrent viewers"""
        if not intervals:
            return 0

        events = []
        for start, end in intervals:
            events.append((start, 1))   # Viewer starts
            events.append((end, -1))    # Viewer ends

        # Sort by time, handle ties by ending first
        events.sort(key=lambda x: (x[0], x[1]))

        max_concurrent = 0
        current_concurrent = 0

        for _, change in events:
            current_concurrent += change
            max_concurrent = max(max_concurrent, current_concurrent)

        return max_concurrent

    async def get_user_viewing_history(self, user_id: str, db, limit: int = 20) -> List[Dict[str, Any]]:
        """Get viewing history for a specific user"""
        try:
            sessions = await db.video_sessions.find({"user_id": user_id}).sort("start_time", -1).limit(limit).to_list(None)

            history = []
            for session in sessions:
                history.append({
                    "video_id": session["video_id"],
                    "session_id": session["session_id"],
                    "start_time": session["start_time"],
                    "end_time": session.get("end_time"),
                    "watch_time": session.get("watch_time", 0.0),
                    "completed": session.get("completed", False),
                    "last_position": session.get("last_position", 0.0)
                })

            return history
        except Exception as e:
            logging.error(f"Failed to get user viewing history: {e}")
            raise


# Background task functions
async def process_transcription(video_id: str, audio_path: str, language: str, db):
    """Background task to process video transcription"""
    try:
        logging.info(f"Starting transcription for video {video_id}")

        # Update status to processing
        await db.transcripts.update_one(
            {"video_id": video_id},
            {"$set": {"status": TranscriptionStatus.processing, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )

        # Initialize transcription service
        service = TranscriptionService()

        # Process transcription
        result = await service.transcribe_audio(audio_path, language)

        # Update database with results
        transcript_doc = {
            "video_id": video_id,
            "language": result["language"],
            "transcript": result["transcript"],
            "full_text": result["full_text"],
            "status": TranscriptionStatus.completed,
            "confidence_score": result["confidence"],
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        await db.transcripts.update_one(
            {"video_id": video_id},
            {"$set": transcript_doc}
        )

        logging.info(f"Transcription completed for video {video_id}")

    except Exception as e:
        logging.error(f"Transcription failed for video {video_id}: {e}")
        await db.transcripts.update_one(
            {"video_id": video_id},
            {"$set": {
                "status": TranscriptionStatus.failed,
                "error_message": str(e),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )


async def process_chaptering(video_id: str, db):
    """Background task to generate video chapters"""
    try:
        logging.info(f"Starting chapter generation for video {video_id}")

        # Get transcript
        transcript = await db.transcripts.find_one({"video_id": video_id})

        if not transcript or transcript["status"] != TranscriptionStatus.completed:
            raise Exception("Transcript not available or not completed")

        # Initialize chaptering service
        service = ChapteringService()

        # Generate chapters
        chapters_data = await service.generate_chapters(
            transcript["transcript"],
            video_id
        )

        # Clear existing chapters and insert new ones
        await db.chapters.delete_many({"video_id": video_id})

        if chapters_data:
            for chapter in chapters_data:
                chapter["created_at"] = datetime.now(timezone.utc).isoformat()
                await db.chapters.insert_one(chapter)

        logging.info(f"Generated {len(chapters_data)} chapters for video {video_id}")

    except Exception as e:
        logging.error(f"Chapter generation failed for video {video_id}: {e}")
        raise


async def process_resource_extraction(video_id: str, db):
    """Background task to extract resources from video"""
    try:
        logging.info(f"Starting resource extraction for video {video_id}")

        # Get transcript
        transcript = await db.transcripts.find_one({"video_id": video_id})

        if not transcript or transcript["status"] != TranscriptionStatus.completed:
            raise Exception("Transcript not available or not completed")

        # Initialize resource extraction service
        service = ResourceExtractionService()

        # Extract resources
        resources_data = await service.extract_resources(
            transcript["transcript"],
            video_id
        )

        # Clear existing resources and insert new ones
        await db.resources.delete_many({"video_id": video_id})

        if resources_data:
            for resource in resources_data:
                resource["created_at"] = datetime.now(timezone.utc).isoformat()
                await db.resources.insert_one(resource)

        logging.info(f"Extracted {len(resources_data)} resources for video {video_id}")

    except Exception as e:
        logging.error(f"Resource extraction failed for video {video_id}: {e}")
        raise
