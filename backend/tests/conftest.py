import os

# Desativa rate limiting antes de qualquer import do app
os.environ["TESTING"] = "1"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, get_db
from main import app
import auth as auth_module
import models

# StaticPool garante que todas as sessões compartilham a mesma conexão em memória
_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
_TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=_engine)


@pytest.fixture
def db():
    Base.metadata.drop_all(bind=_engine)
    Base.metadata.create_all(bind=_engine)
    session = _TestingSession()
    yield session
    session.close()


@pytest.fixture
def client(db):
    def _override():
        yield db

    app.dependency_overrides[get_db] = _override
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def empresa(db):
    e = models.Empresa(nome="Empresa Teste")
    db.add(e)
    db.commit()
    db.refresh(e)
    return e


@pytest.fixture
def aprendiz_token(client, empresa):
    client.post("/auth/aprendiz/register", json={
        "username": "aprendiz_test",
        "senha": "senha123",
        "idade": 18,
        "genero": "masculino",
        "empresa_id": empresa.id,
    })
    r = client.post("/auth/aprendiz/login", data={
        "username": "aprendiz_test",
        "password": "senha123",
    })
    return r.json()["access_token"]


@pytest.fixture
def gestor_token(client, db):
    gestor = models.Gestor(
        username="gestor_test",
        senha_hash=auth_module.hash_senha("senha123"),
        nome="Gestor Teste",
    )
    db.add(gestor)
    db.commit()
    r = client.post("/auth/gestor/login", json={
        "username": "gestor_test",
        "senha": "senha123",
    })
    return r.json()["access_token"]
