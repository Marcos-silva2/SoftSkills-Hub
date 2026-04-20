def _register(client, empresa, username="aprendiz1", senha="senha123"):
    return client.post("/auth/aprendiz/register", json={
        "username": username,
        "senha": senha,
        "idade": 18,
        "genero": "feminino",
        "empresa_id": empresa.id,
    })


def _login(client, username="aprendiz1", senha="senha123"):
    return client.post("/auth/aprendiz/login", data={
        "username": username,
        "password": senha,
    })


# ─── Cadastro ────────────────────────────────────────────────────────────────

def test_register_success(client, empresa):
    r = _register(client, empresa)
    assert r.status_code == 201
    body = r.json()
    assert body["username"] == "aprendiz1"
    assert body["genero"] == "feminino"
    assert body["empresa_id"] == empresa.id


def test_register_duplicate_username(client, empresa):
    _register(client, empresa)
    r = _register(client, empresa)  # mesmo username
    assert r.status_code == 400
    assert "já está em uso" in r.json()["detail"]


def test_register_empresa_inexistente(client, empresa):
    r = client.post("/auth/aprendiz/register", json={
        "username": "novo",
        "senha": "senha123",
        "idade": 17,
        "genero": "masculino",
        "empresa_id": 9999,
    })
    assert r.status_code == 404


def test_register_senha_curta(client, empresa):
    r = client.post("/auth/aprendiz/register", json={
        "username": "novo",
        "senha": "12",
        "idade": 17,
        "genero": "masculino",
        "empresa_id": empresa.id,
    })
    assert r.status_code == 422


def test_register_idade_invalida(client, empresa):
    r = client.post("/auth/aprendiz/register", json={
        "username": "novo",
        "senha": "senha123",
        "idade": 30,
        "genero": "masculino",
        "empresa_id": empresa.id,
    })
    assert r.status_code == 422


# ─── Login ───────────────────────────────────────────────────────────────────

def test_login_success(client, empresa):
    _register(client, empresa)
    r = _login(client)
    assert r.status_code == 200
    body = r.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_login_senha_errada(client, empresa):
    _register(client, empresa)
    r = _login(client, senha="errada")
    assert r.status_code == 401


def test_login_usuario_inexistente(client, empresa):
    r = _login(client, username="naoexiste")
    assert r.status_code == 401


# ─── /me ─────────────────────────────────────────────────────────────────────

def test_me_autenticado(client, empresa):
    _register(client, empresa)
    token = _login(client).json()["access_token"]
    r = client.get("/auth/aprendiz/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["username"] == "aprendiz1"


def test_me_sem_token(client):
    r = client.get("/auth/aprendiz/me")
    assert r.status_code == 401


def test_me_token_invalido(client):
    r = client.get("/auth/aprendiz/me", headers={"Authorization": "Bearer token-falso"})
    assert r.status_code == 401
