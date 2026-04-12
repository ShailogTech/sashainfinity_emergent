"""
Database configuration and connection management
"""
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from .config import get_settings

settings = get_settings()
DATABASE_URL = settings.DATABASE_URL

# PostgreSQL connection pool settings
is_postgres = "postgresql" in DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    echo=settings.DEBUG,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    # Pool settings (PostgreSQL only)
    pool_size=10,               # Maintain 10 persistent connections
    max_overflow=20,            # Allow 20 extra connections under load
    pool_pre_ping=True,         # Test connection before using (fixes dropped connections)
    pool_recycle=1800,          # Recycle connections every 30 min (prevents stale connections)
    pool_timeout=30,            # Wait up to 30s for a connection from pool
) if is_postgres else create_engine(
    DATABASE_URL,
    echo=settings.DEBUG,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
metadata = MetaData()

def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def init_db():
    print("Initializing database...")
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully")

def create_tables():
    Base.metadata.create_all(bind=engine)
    print("All tables created successfully")
