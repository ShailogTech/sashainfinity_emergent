#!/usr/bin/env python3
"""
Sasha Infinity LMS - Backend Server Start Script

Usage:
    python start_server.py              # Start with default settings
    python start_server.py --port 8001  # Start on custom port
    python start_server.py --dev        # Start in development mode
    python start_server.py --prod       # Start in production mode
"""
import os
import sys
import argparse
import subprocess
from pathlib import Path

def check_env_file():
    """Check if .env file exists, create from example if not."""
    root_dir = Path(__file__).parent
    env_file = root_dir / '.env'
    env_example = root_dir / '.env.example'

    if not env_file.exists() and env_example.exists():
        print("Creating .env file from .env.example...")
        import shutil
        shutil.copy(env_example, env_file)
        print("Created .env file. Please update it with your configuration.")
        return False
    elif not env_file.exists():
        print("ERROR: .env file not found. Please create it from .env.example")
        return False

    return True


def check_mongodb_connection():
    """Check if MongoDB is accessible."""
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        import asyncio

        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=2000)

        async def ping():
            await client.admin.command('ping')
            return True

        result = asyncio.run(ping())
        if result:
            print("✓ MongoDB connection successful")
            return True
    except Exception as e:
        print(f"✗ MongoDB connection failed: {e}")
        print("\nPlease ensure MongoDB is running:")
        print("  - Local: mongod --dbpath /path/to/data")
        print("  - Docker: docker run -d -p 27017:27017 mongo:latest")
        return False


def generate_jwt_secret():
    """Generate a secure JWT secret if not set."""
    current_secret = os.environ.get('JWT_SECRET_KEY', '')
    if 'change-this' in current_secret or 'your-secret-key' in current_secret:
        import secrets
        new_secret = secrets.token_urlsafe(32)
        print("\n⚠ WARNING: Using default JWT secret key")
        print(f"Generated secure key: {new_secret}")
        print("Please add this to your .env file as JWT_SECRET_KEY\n")


def main():
    parser = argparse.ArgumentParser(description='Start Sasha Infinity LMS Backend Server')
    parser.add_argument('--port', type=int, default=8000, help='Port to run the server on')
    parser.add_argument('--host', type=str, default='0.0.0.0', help='Host to bind to')
    parser.add_argument('--dev', action='store_true', help='Development mode with auto-reload')
    parser.add_argument('--prod', action='store_true', help='Production mode')
    parser.add_argument('--workers', type=int, default=1, help='Number of worker processes (production only)')
    parser.add_argument('--check-only', action='store_true', help='Only check configuration without starting')
    parser.add_argument('--skip-checks', action='store_true', help='Skip pre-start checks')

    args = parser.parse_args()

    print("=" * 60)
    print("Sasha Infinity LMS - Backend Server")
    print("=" * 60)

    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()

    # Run checks
    if not args.skip_checks:
        print("\nRunning pre-start checks...")
        print("-" * 40)

        if not check_env_file():
            if not args.check_only:
                print("\nPlease configure the .env file before starting the server.")
            sys.exit(1)

        if not check_mongodb_connection():
            if not args.check_only:
                print("\nPlease start MongoDB before starting the server.")
            sys.exit(1)

        generate_jwt_secret()

        print("-" * 40)
        print("✓ All checks passed!\n")

    if args.check_only:
        print("Configuration check complete.")
        sys.exit(0)

    # Build uvicorn command
    if args.prod:
        # Production mode with multiple workers
        cmd = [
            'uvicorn',
            'server:app',
            '--host', args.host,
            '--port', str(args.port),
            '--workers', str(args.workers),
            '--access-log',
            '--log-level', 'info'
        ]
        print(f"Starting production server on {args.host}:{args.port}")
        print(f"Workers: {args.workers}")
    else:
        # Development mode
        reload_flag = ['--reload'] if args.dev else []
        cmd = [
            'uvicorn',
            'server:app',
            '--host', args.host,
            '--port', str(args.port),
        ] + reload_flag
        mode = "development" if args.dev else "standard"
        print(f"Starting {mode} server on {args.host}:{args.port}")

    print("-" * 40)
    print(f"API Documentation: http://{args.host}:{args.port}/docs")
    print(f"Health Check: http://{args.host}:{args.port}/api/health")
    print("=" * 60)
    print()

    # Start the server
    try:
        subprocess.run(cmd, check=True)
    except KeyboardInterrupt:
        print("\nServer stopped.")
    except subprocess.CalledProcessError as e:
        print(f"\nError starting server: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
