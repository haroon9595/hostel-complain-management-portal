import os
import logging
import traceback
from dotenv import load_dotenv
from fastapi import HTTPException, status
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger("uvicorn.error")

load_dotenv()

Base = declarative_base()

_engine = None
_SessionLocal = None


def _get_normalized_db_url() -> str:
    load_dotenv(override=True)
    db_url = os.getenv("DATABASE_URL", "").strip()
    if not db_url:
        return ""

    # Ensure DATABASE_URL uses postgresql+psycopg:// for psycopg 3
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+psycopg://", 1)
    elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+"):
        db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)

    return db_url


def get_engine():
    global _engine
    db_url = _get_normalized_db_url()
    if not db_url:
        error_msg = (
            "DATABASE_URL environment variable is missing. "
            "Please set DATABASE_URL in your environment variables or .env file."
        )
        logger.error(error_msg)
        raise ValueError(error_msg)

    if _engine is None:
        connect_args = {"sslmode": "require"} if "supabase" in db_url.lower() or "pooler.supabase.com" in db_url.lower() else {}

        try:
            _engine = create_engine(
                db_url,
                pool_pre_ping=True,
                pool_recycle=300,
                connect_args=connect_args,
                echo=False,
            )
        except Exception as e:
            logger.error("Failed to create SQLAlchemy engine:\n%s", traceback.format_exc())
            raise e

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
        logger.error("Database configuration error:\n%s", traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(ve),
        )
    except Exception as e:
        logger.error("Failed to initialize database session factory:\n%s", traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database initialization failed: {str(e)}",
        )

    db = session_factory()
    try:
        yield db
    except Exception as e:
        logger.error("Database session transaction error:\n%s", traceback.format_exc())
        db.rollback()
        raise
    finally:
        db.close()
