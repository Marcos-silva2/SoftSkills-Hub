import models
from core import security as auth_module


def _seed_gestor(db, username="gestor1", senha="senha123"):
    g = models.Gestor(
        username=username,
        senha_hash=auth_module.hash_senha(senha),
        nome="Gestor Um",
    )
    db.add(g)
    db.commit()
    return g


# ─── Login ───────────────────────────────────────────────────────────────────

def test_login_success(client, db):
    _seed_gestor(db)
    r = client.post("/auth/gestor/login", json={"username": "gestor1", "senha": "senha123"})
    assert r.status_code == 200
    body = r.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_login_senha_errada(client, db):
    _seed_gestor(db)
    r = client.post("/auth/gestor/login", json={"username": "gestor1", "senha": "errada"})
    assert r.status_code == 401


def test_login_usuario_inexistente(client):
    r = client.post("/auth/gestor/login", json={"username": "naoexiste", "senha": "qualquer"})
    assert r.status_code == 401


# ─── /me ─────────────────────────────────────────────────────────────────────

def test_me_autenticado(client, db):
    _seed_gestor(db)
    token = client.post(
        "/auth/gestor/login", json={"username": "gestor1", "senha": "senha123"}
    ).json()["access_token"]
    r = client.get("/auth/gestor/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    body = r.json()
    assert body["username"] == "gestor1"
    assert body["nome"] == "Gestor Um"


def test_me_sem_token(client):
    r = client.get("/auth/gestor/me")
    assert r.status_code == 401


def test_me_token_aprendiz_rejeitado(client, empresa):
    """Token de aprendiz não deve ser aceito no endpoint de gestor."""
    client.post("/auth/aprendiz/register", json={
        "username": "apr",
        "senha": "senha123",
        "idade": 18,
        "genero": "masculino",
        "empresa_id": empresa.id,
    })
    token = client.post(
        "/auth/aprendiz/login", data={"username": "apr", "password": "senha123"}
    ).json()["access_token"]
    r = client.get("/auth/gestor/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 401
