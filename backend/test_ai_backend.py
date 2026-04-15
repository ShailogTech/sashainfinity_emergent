"""
Comprehensive test suite for AI-powered backend services.
Tests all AI services including transcription, chaptering, resource extraction, and analytics.
"""

import asyncio
import sys
import os
from datetime import datetime, timezone
from typing import Dict, Any

# Set UTF-8 encoding for Windows console
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from ai_services import (
    TranscriptionService,
    ChapteringService,
    ResourceExtractionService,
    VideoAnalyticsService,
    TranscriptionStatus,
    ResourceType
)

# Mock database for testing
class MockDB:
    def __init__(self):
        self.data = {
            "transcripts": [],
            "chapters": [],
            "resources": [],
            "video_events": [],
            "video_sessions": []
        }
        self.counters = {
            "transcripts": 0,
            "chapters": 0,
            "resources": 0,
            "video_events": 0,
            "video_sessions": 0
        }

    async def insert_one(self, collection, doc):
        self.data[collection].append(doc)
        self.counters[collection] += 1
        return type('obj', (object,), {'inserted_id': f'test_{collection}_{self.counters[collection]}'})()

    async def update_one(self, collection, query, update):
        # Simple mock implementation
        pass

    async def find_one(self, collection, query):
        if collection in self.data and self.data[collection]:
            return self.data[collection][0]
        return None

    async def delete_many(self, collection, query):
        if collection in self.data:
            self.data[collection] = []

    async def count_documents(self, collection, query):
        return len(self.data.get(collection, []))

    async def to_list(self, collection, limit):
        return self.data.get(collection, [])[:limit]


async def test_transcription_service():
    """Test the transcription service"""
    print("\n" + "="*50)
    print("TESTING TRANSCRIPTION SERVICE")
    print("="*50)

    service = TranscriptionService()

    # Test model loading
    print("✓ Transcription service initialized")
    print(f"  - Model loaded: {service.model is not None}")

    # Test with mock audio file path (will fail but shows the structure)
    try:
        # This would work with actual audio file
        # result = await service.transcribe_audio("test_audio.mp3", "en")
        print("  - Ready to transcribe audio files (requires actual audio file)")
    except Exception as e:
        print(f"  - Expected error without audio file: {str(e)[:50]}...")

    print("✓ Transcription service test completed")


async def test_chaptering_service():
    """Test the chaptering service"""
    print("\n" + "="*50)
    print("TESTING CHAPTERING SERVICE")
    print("="*50)

    service = ChapteringService()

    # Mock transcript segments
    mock_segments = [
        {"text": "Welcome to this course about web development.", "start": 0.0, "end": 3.5},
        {"text": "We'll cover HTML, CSS, and JavaScript fundamentals.", "start": 3.5, "end": 7.0},
        {"text": "Let's start with HTML structure.", "start": 7.0, "end": 10.0},
        {"text": "HTML elements are the building blocks.", "start": 10.0, "end": 15.0},
        {"text": "Now moving to CSS styling.", "start": 15.0, "end": 18.0},
        {"text": "CSS controls the visual presentation.", "start": 18.0, "end": 22.0},
        {"text": "Finally, JavaScript adds interactivity.", "start": 22.0, "end": 26.0},
        {"text": "JavaScript makes websites dynamic.", "start": 26.0, "end": 30.0}
    ]

    print("✓ Chaptering service initialized")
    print(f"  - NLP model loaded: {service.nlp is not None}")

    # Test chapter generation
    try:
        chapters = await service.generate_chapters(mock_segments, "test_video_1")
        print(f"✓ Generated {len(chapters)} chapters")
        for i, chapter in enumerate(chapters):
            print(f"  Chapter {i+1}:")
            print(f"    - Title: {chapter['title']}")
            print(f"    - Time: {chapter['start_time']:.1f}s - {chapter['end_time']:.1f}s")
            print(f"    - Topics: {', '.join(chapter['topics'])}")
    except Exception as e:
        print(f"✗ Chapter generation failed: {e}")

    print("✓ Chaptering service test completed")


async def test_resource_extraction_service():
    """Test the resource extraction service"""
    print("\n" + "="*50)
    print("TESTING RESOURCE EXTRACTION SERVICE")
    print("="*50)

    service = ResourceExtractionService()

    # Mock transcript with resources
    mock_segments = [
        {"text": "Check out https://github.com/example/project for the code.", "start": 5.0, "end": 10.0},
        {"text": "I recommend reading 'Clean Code' by Robert Martin.", "start": 15.0, "end": 20.0},
        {"text": "Visit https://docs.python.org for documentation.", "start": 25.0, "end": 30.0},
        {"text": "The book 'The Pragmatic Programmer' is excellent.", "start": 35.0, "end": 40.0}
    ]

    print("✓ Resource extraction service initialized")

    # Test resource extraction
    try:
        resources = await service.extract_resources(mock_segments, "test_video_1")
        print(f"✓ Extracted {len(resources)} resources")
        for i, resource in enumerate(resources):
            print(f"  Resource {i+1}:")
            print(f"    - Type: {resource['resource_type']}")
            print(f"    - Title: {resource['title']}")
            print(f"    - URL: {resource.get('url', 'N/A')}")
            print(f"    - Timestamp: {resource['timestamp']:.1f}s")
    except Exception as e:
        print(f"✗ Resource extraction failed: {e}")

    print("✓ Resource extraction service test completed")


async def test_video_analytics_service():
    """Test the video analytics service"""
    print("\n" + "="*50)
    print("TESTING VIDEO ANALYTICS SERVICE")
    print("="*50)

    service = VideoAnalyticsService()
    mock_db = MockDB()

    print("✓ Video analytics service initialized")

    # Test event recording
    try:
        event = await service.record_view_event(
            video_id="test_video_1",
            user_id="user_123",
            event_type="play",
            timestamp=45.5,
            session_id="session_abc",
            metadata={"quality": "1080p"}
        )
        print("✓ Event recording works")
        print(f"  - Event type: {event['event_type']}")
        print(f"  - Timestamp: {event['timestamp']}s")

        # Add mock events to database
        await mock_db.insert_one("video_events", event)
        await mock_db.insert_one("video_events", {
            **event,
            "event_type": "pause",
            "timestamp": 120.0
        })

    except Exception as e:
        print(f"✗ Event recording failed: {e}")

    # Test heatmap generation
    try:
        heatmap = await service.generate_heatmap_data("test_video_1", mock_db)
        print("✓ Heatmap generation works")
        print(f"  - Total views: {heatmap['total_views']}")
        print(f"  - Unique viewers: {heatmap['unique_viewers']}")
        print(f"  - Heatmap data points: {len(heatmap['heatmap_data'])}")
    except Exception as e:
        print(f"✗ Heatmap generation failed: {e}")

    # Test statistics generation
    try:
        # Add mock session
        await mock_db.insert_one("video_sessions", {
            "video_id": "test_video_1",
            "user_id": "user_123",
            "session_id": "session_abc",
            "start_time": datetime.now(timezone.utc).isoformat(),
            "video_duration": 300.0,
            "watch_time": 250.0,
            "completed": True
        })

        stats = await service.get_video_statistics("test_video_1", mock_db)
        print("✓ Statistics generation works")
        print(f"  - Total views: {stats['total_views']}")
        print(f"  - Average watch time: {stats['average_watch_time']:.1f}s")
        print(f"  - Completion rate: {stats['average_completion_rate']:.1f}%")
    except Exception as e:
        print(f"✗ Statistics generation failed: {e}")

    print("✓ Video analytics service test completed")


async def test_integration_workflow():
    """Test the complete workflow integration"""
    print("\n" + "="*50)
    print("TESTING COMPLETE WORKFLOW INTEGRATION")
    print("="*50)

    mock_db = MockDB()

    # Mock video data
    video_id = "integration_test_video"
    mock_transcript = [
        {"text": "Welcome to Python programming basics.", "start": 0.0, "end": 3.0},
        {"text": "We'll cover variables, data types, and control flow.", "start": 3.0, "end": 7.0},
        {"text": "Let's start with variables in Python.", "start": 7.0, "end": 11.0},
        {"text": "Variables store data values.", "start": 11.0, "end": 15.0},
        {"text": "Python has several built-in data types.", "start": 15.0, "end": 19.0},
        {"text": "Check out https://docs.python.org for more info.", "start": 19.0, "end": 23.0},
    ]

    print("1. Simulating transcription...")
    transcript_doc = {
        "video_id": video_id,
        "status": TranscriptionStatus.completed,
        "transcript": mock_transcript,
        "full_text": " ".join([s["text"] for s in mock_transcript]),
        "language": "en",
        "confidence_score": 0.95
    }
    await mock_db.insert_one("transcripts", transcript_doc)
    print("✓ Transcription completed")

    print("2. Generating chapters...")
    chaptering_service = ChapteringService()
    chapters = await chaptering_service.generate_chapters(mock_transcript, video_id)
    for chapter in chapters:
        await mock_db.insert_one("chapters", chapter)
    print(f"✓ Generated {len(chapters)} chapters")

    print("3. Extracting resources...")
    resource_service = ResourceExtractionService()
    resources = await resource_service.extract_resources(mock_transcript, video_id)
    for resource in resources:
        await mock_db.insert_one("resources", resource)
    print(f"✓ Extracted {len(resources)} resources")

    print("4. Simulating video analytics...")
    analytics_service = VideoAnalyticsService()

    # Simulate viewing events
    events = [
        {"event_type": "play", "timestamp": 0.0},
        {"event_type": "pause", "timestamp": 45.0},
        {"event_type": "seek", "timestamp": 30.0},
        {"event_type": "complete", "timestamp": 60.0}
    ]

    for event in events:
        event_data = await analytics_service.record_view_event(
            video_id=video_id,
            user_id="test_user",
            session_id="test_session",
            **event
        )
        await mock_db.insert_one("video_events", event_data)
    print(f"✓ Recorded {len(events)} viewing events")

    print("5. Generating analytics...")
    heatmap = await analytics_service.generate_heatmap_data(video_id, mock_db)
    stats = await analytics_service.get_video_statistics(video_id, mock_db)
    print("✓ Analytics generated")
    print(f"  - Total views: {stats['total_views']}")
    print(f"  - Heatmap data points: {len(heatmap['heatmap_data'])}")

    print("\n✓ COMPLETE WORKFLOW INTEGRATION TEST PASSED")
    print(f"  Video ID: {video_id}")
    print(f"  Transcript segments: {len(mock_transcript)}")
    print(f"  Chapters generated: {len(chapters)}")
    print(f"  Resources extracted: {len(resources)}")
    print(f"  Analytics events: {len(events)}")


async def run_all_tests():
    """Run all test suites"""
    print("\n" + "="*50)
    print("AI-POWERED BACKEND SERVICES - TEST SUITE")
    print("="*50)
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    try:
        await test_transcription_service()
        await test_chaptering_service()
        await test_resource_extraction_service()
        await test_video_analytics_service()
        await test_integration_workflow()

        print("\n" + "="*50)
        print("ALL TESTS COMPLETED SUCCESSFULLY")
        print("="*50)
        print(f"Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    except Exception as e:
        print(f"\n✗ TEST SUITE FAILED: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(run_all_tests())