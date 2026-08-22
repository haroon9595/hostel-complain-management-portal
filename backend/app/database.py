import os
from dotenv import load_dotenv
from fastapi import HTTPException, status
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

Base = declarative_base()

_engine = None
_SessionLocal = None


def _get_normalized_db_url() -> str:
    load_dotenv(override=True)
    db_url = os.getenv("DATABASE_URL", "").strip()
    if not db_url:
        return ""
    
    # Normalize postgres:// or postgresql:// to postgresql+psycopg:// for psycopg 3
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+psycopg://", 1)
    elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+"):
        db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)
        
    return db_url


def get_engine():
    global _engine
    db_url = _get_normalized_db_url()
    if not db_url:
        raise ValueError(
            "DATABASE_URL environment variable is missing. "
            "Please set DATABASE_URL in your backend/.env file."
        )
    if _engine is None:
        _engine = create_engine(
            db_url,
            pool_pre_ping=True,
            echo=False,
        )
    return _engine


def get_session_factory():
    global _SessionLocal
    if _SessionLocal is None:
        engine = get_engine()
        _SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=engine,
        )
    return _SessionLocal


def get_db():
    try:
        session_factory = get_session_factory()
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(ve),
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initialize database connection. Please verify your DATABASE_URL.",
        )

    db = session_factory()
    try:
        yield db
    finally:
        db.close()
