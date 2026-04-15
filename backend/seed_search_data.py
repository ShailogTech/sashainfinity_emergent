import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from os import environ

# MongoDB connection
mongo_url = environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[environ.get('DB_NAME', 'sashainfinity_db')]

# Sample videos
sample_videos = [
    {
        "video_id": "react-hooks-101",
        "course_id": "react-mastery",
        "course_title": "React Mastery",
        "video_title": "Understanding React Hooks",
        "instructor": "Sarah Johnson",
        "topics": ["react", "hooks", "useState", "useEffect", "javascript"],
        "duration": 1800.0,
        "language": "en",
        "indexed_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "video_id": "async-js-deep-dive",
        "course_id": "javascript-advanced",
        "course_title": "Advanced JavaScript",
        "video_title": "Async/Await Deep Dive",
        "instructor": "Michael Chen",
        "topics": ["javascript", "async", "await", "promise", "callback", "api"],
        "duration": 2400.0,
        "language": "en",
        "indexed_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "video_id": "python-oop-basics",
        "course_id": "python-fundamentals",
        "course_title": "Python Fundamentals",
        "video_title": "Object-Oriented Programming in Python",
        "instructor": "Emily Rodriguez",
        "topics": ["python", "oop", "class", "object", "inheritance", "polymorphism"],
        "duration": 2100.0,
        "language": "en",
        "indexed_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "video_id": "css-grid-layout",
        "course_id": "modern-css",
        "course_title": "Modern CSS Techniques",
        "video_title": "CSS Grid Layout Mastery",
        "instructor": "David Kim",
        "topics": ["css", "grid", "layout", "flexbox", "responsive", "design"],
        "duration": 1500.0,
        "language": "en",
        "indexed_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "video_id": "nodejs-api-rest",
        "course_id": "backend-development",
        "course_title": "Backend Development with Node.js",
        "video_title": "Building REST APIs with Node.js",
        "instructor": "Alex Thompson",
        "topics": ["nodejs", "api", "rest", "express", "http", "database"],
        "duration": 2700.0,
        "language": "en",
        "indexed_at": datetime.now(timezone.utc).isoformat()
    },
]

# Sample transcripts
sample_transcripts = {
    "react-hooks-101": [
        {"text": "Welcome back to the course. Today we're diving deep into React hooks.", "start": 0.0, "end": 5.0},
        {"text": "Hooks are functions that let you use state and other React features in functional components.", "start": 5.0, "end": 12.0},
        {"text": "The most basic hook is useState. It lets you add state to functional components.", "start": 12.0, "end": 20.0},
        {"text": "Here's how you use useState in your component. You pass the initial state as an argument.", "start": 20.0, "end": 28.0},
        {"text": "The hook returns an array with the current state value and a function to update it.", "start": 28.0, "end": 36.0},
        {"text": "Another essential hook is useEffect. It lets you perform side effects in your components.", "start": 36.0, "end": 44.0},
        {"text": "useEffect runs after every render by default, but you can control when it runs.", "start": 44.0, "end": 52.0},
        {"text": "You can pass a dependency array as the second argument to useEffect.", "start": 52.0, "end": 60.0},
    ],
    "async-js-deep-dive": [
        {"text": "In this lesson, we'll explore async and await in JavaScript.", "start": 0.0, "end": 6.0},
        {"text": "Async and await make asynchronous code look and behave like synchronous code.", "start": 6.0, "end": 14.0},
        {"text": "The async keyword declares an async function, which always returns a promise.", "start": 14.0, "end": 22.0},
        {"text": "The await keyword pauses the function execution until a promise is resolved.", "start": 22.0, "end": 30.0},
        {"text": "Let's compare promises with async await. The syntax is much cleaner.", "start": 30.0, "end": 38.0},
        {"text": "You can use try catch blocks to handle errors in async functions.", "start": 38.0, "end": 46.0},
        {"text": "When you need to run multiple async operations in parallel, use Promise.all.", "start": 46.0, "end": 55.0},
    ],
    "python-oop-basics": [
        {"text": "Object-oriented programming is a paradigm based on objects containing data and methods.", "start": 0.0, "end": 8.0},
        {"text": "In Python, everything is an object. Classes are blueprints for creating objects.", "start": 8.0, "end": 16.0},
        {"text": "To define a class in Python, use the class keyword followed by the class name.", "start": 16.0, "end": 24.0},
        {"text": "The init method is the constructor. It runs when you create a new instance.", "start": 24.0, "end": 32.0},
        {"text": "Self refers to the current instance of the class. It must be the first parameter.", "start": 32.0, "end": 40.0},
        {"text": "Instance variables are specific to each object. They're defined in the init method.", "start": 40.0, "end": 49.0},
    ],
    "css-grid-layout": [
        {"text": "CSS Grid is a two-dimensional layout system for the web.", "start": 0.0, "end": 7.0},
        {"text": "It allows you to create complex layouts with rows and columns.", "start": 7.0, "end": 14.0},
        {"text": "To use grid layout, set display to grid on the container element.", "start": 14.0, "end": 22.0},
        {"text": "Define your columns using the grid-template-columns property.", "start": 22.0, "end": 30.0},
        {"text": "You can use the fr unit to create flexible columns that share available space.", "start": 30.0, "end": 38.0},
        {"text": "Grid-gap adds space between grid rows and columns.", "start": 38.0, "end": 45.0},
    ],
    "nodejs-api-rest": [
        {"text": "Building APIs with Node.js and Express is fast and efficient.", "start": 0.0, "end": 7.0},
        {"text": "Express is a minimal web framework for Node.js.", "start": 7.0, "end": 13.0},
        {"text": "RESTful APIs use HTTP methods like GET, POST, PUT, and DELETE.", "start": 13.0, "end": 21.0},
        {"text": "GET requests retrieve data from the server.", "start": 21.0, "end": 27.0},
        {"text": "POST requests create new resources on the server.", "start": 27.0, "end": 34.0},
        {"text": "PUT requests update existing resources.", "start": 34.0, "end": 40.0},
    ],
}

async def seed_data():
    """Seed the database with sample video transcripts for testing the search functionality."""

    # Insert video metadata
    for video in sample_videos:
        await db.video_metadata.update_one(
            {"video_id": video["video_id"]},
            {"$set": video},
            upsert=True
        )

    # Insert transcripts
    for video_id, segments in sample_transcripts.items():
        await db.transcripts.update_one(
            {"video_id": video_id},
            {"$set": {
                "video_id": video_id,
                "transcript": segments,
                "full_text": " ".join([s["text"] for s in segments]),
                "status": "completed",
                "confidence_score": 0.95,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )

    print(f"Search data seeded successfully!")
    print(f"Videos indexed: {len(sample_videos)}")
    print(f"Total transcript segments: {sum(len(t) for t in sample_transcripts.values())}")

    client.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
