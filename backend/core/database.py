"""Configuração do banco de dados: engine, sessão e classe Base do ORM."""

import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./softskills.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # necessário para SQLite com FastAPI
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """Dependência FastAPI que fornece uma sessão de banco de dados por requisição."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
