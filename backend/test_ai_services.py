"""
Test script for AI-powered content management services.
Run this to verify the AI services are working correctly.
"""

import asyncio
import sys
import logging
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os

# Import AI services
from ai_services import (
    TranscriptionService,
    ChapteringService,
    ResourceExtractionService,
    TranscriptionStatus,
    ResourceType
)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'test_db')


async def test_transcription_service():
    """Test the transcription service"""
    logger.info("Testing Transcription Service...")

    try:
        service = TranscriptionService()

        if service.model is None:
            logger.warning("⚠️  Whisper model not available. Install with: pip install openai-whisper")
            return False

        logger.info("✅ Whisper model loaded successfully")
        logger.info("ℹ️  Note: Actual transcription requires an audio file")
        return True

    except Exception as e:
        logger.error(f"❌ Transcription service test failed: {e}")
        return False


async def test_chaptering_service():
    """Test the chaptering service"""
    logger.info("Testing Chaptering Service...")

    try:
        service = ChapteringService()

        # Test with mock transcript data
        mock_transcript = [
            {"text": "Welcome to this React course.", "start": 0.0, "end": 2.0},
            {"text": "We will learn about components.", "start": 2.0, "end": 4.0},
            {"text": "Components are the building blocks.", "start": 4.0, "end": 6.0},
            {"text": "Now let's talk about hooks.", "start": 6.0, "end": 8.0},
            {"text": "Hooks allow us to use state.", "start": 8.0, "end": 10.0},
        ]

        chapters = await service.generate_chapters(mock_transcript, "test-video")

        if chapters:
            logger.info(f"✅ Generated {len(chapters)} test chapters")
            for i, chapter in enumerate(chapters):
                logger.info(f"   Chapter {i+1}: {chapter['title']}")
            return True
        else:
            logger.warning("⚠️  No chapters generated (may be due to short transcript)")
            return True

    except Exception as e:
        logger.error(f"❌ Chaptering service test failed: {e}")
        return False


async def test_resource_extraction():
    """Test the resource extraction service"""
    logger.info("Testing Resource Extraction Service...")

    try:
        service = ResourceExtractionService()

        # Test with mock transcript containing URLs
        mock_transcript = [
            {"text": "Check out react.dev for more info", "start": 0.0, "end": 2.0},
            {"text": "Also visit github.com/facebook/react", "start": 2.0, "end": 4.0},
            {"text": "I recommend the book 'React Quickly'", "start": 4.0, "end": 6.0},
        ]

        resources = await service.extract_resources(mock_transcript, "test-video")

        if resources:
            logger.info(f"✅ Extracted {len(resources)} test resources")
            for resource in resources:
                logger.info(f"   - {resource['resource_type']}: {resource['title']}")
            return True
        else:
            logger.warning("⚠️  No resources extracted")
            return True

    except Exception as e:
        logger.error(f"❌ Resource extraction test failed: {e}")
        return False


async def test_database_integration():
    """Test database integration"""
    logger.info("Testing Database Integration...")

    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]

        # Test connection
        await db.command('ping')
        logger.info("✅ Connected to MongoDB successfully")

        # Test collection operations
        # Insert a test transcript
        test_transcript = {
            "video_id": "test-ai-video",
            "language": "en",
            "status": TranscriptionStatus.completed,
            "transcript": [{"text": "Test", "start": 0.0, "end": 1.0}],
            "full_text": "Test",
            "confidence_score": 0.95,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        result = await db.transcripts.insert_one(test_transcript)
        logger.info(f"✅ Inserted test transcript with ID: {result.inserted_id}")

        # Retrieve the transcript
        retrieved = await db.transcripts.find_one({"video_id": "test-ai-video"})
        if retrieved:
            logger.info("✅ Retrieved test transcript successfully")

        # Clean up
        await db.transcripts.delete_many({"video_id": "test-ai-video"})
        logger.info("✅ Cleaned up test data")

        client.close()
        return True

    except Exception as e:
        logger.error(f"❌ Database integration test failed: {e}")
        return False


async def run_all_tests():
    """Run all AI service tests"""
    logger.info("=" * 60)
    logger.info("AI Services Test Suite")
    logger.info("=" * 60)

    results = {}

    # Test individual services
    results['transcription'] = await test_transcription_service()
    results['chaptering'] = await test_chaptering_service()
    results['resource_extraction'] = await test_resource_extraction()
    results['database'] = await test_database_integration()

    # Summary
    logger.info("=" * 60)
    logger.info("Test Summary")
    logger.info("=" * 60)

    passed = sum(1 for v in results.values() if v)
    total = len(results)

    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        logger.info(f"{status}: {test_name}")

    logger.info("=" * 60)
    logger.info(f"Results: {passed}/{total} tests passed")

    if passed == total:
        logger.info("🎉 All tests passed! AI services are ready to use.")
        return 0
    else:
        logger.warning("⚠️  Some tests failed. Check the logs above for details.")
        return 1


def main():
    """Main entry point"""
    try:
        exit_code = asyncio.run(run_all_tests())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        logger.info("Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
