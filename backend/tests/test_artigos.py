_ARTIGO = {
    "titulo": "Como gerenciar emoções no trabalho",
    "resumo": "Dicas práticas para desenvolver inteligência emocional no ambiente corporativo.",
    "conteudo": "## Introdução\n\nA inteligência emocional é uma habilidade essencial para o sucesso profissional.",
    "categoria": "inteligencia_emocional",
    "tempo_leitura": 5,
}


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


# ─── Listagem pública ────────────────────────────────────────────────────────

def test_listar_artigos_sem_autenticacao(client):
    r = client.get("/artigos")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_listar_artigos_vazio(client):
    r = client.get("/artigos")
    assert r.json() == []


# ─── Criação ─────────────────────────────────────────────────────────────────

def test_criar_artigo_gestor(client, gestor_token):
    r = client.post("/artigos", json=_ARTIGO, headers=_auth(gestor_token))
    assert r.status_code == 201
    body = r.json()
    assert body["titulo"] == _ARTIGO["titulo"]
    assert body["categoria"] == "inteligencia_emocional"
    assert "id" in body


def test_criar_artigo_sem_token(client):
    r = client.post("/artigos", json=_ARTIGO)
    assert r.status_code == 401


def test_criar_artigo_token_aprendiz_rejeitado(client, aprendiz_token):
    r = client.post("/artigos", json=_ARTIGO, headers=_auth(aprendiz_token))
    assert r.status_code == 401


def test_criar_artigo_categoria_invalida(client, gestor_token):
    artigo = {**_ARTIGO, "categoria": "categoria_inexistente"}
    r = client.post("/artigos", json=artigo, headers=_auth(gestor_token))
    assert r.status_code == 422


# ─── Atualização ─────────────────────────────────────────────────────────────

def test_atualizar_artigo(client, gestor_token):
    artigo_id = client.post("/artigos", json=_ARTIGO, headers=_auth(gestor_token)).json()["id"]
    r = client.put(
        f"/artigos/{artigo_id}",
        json={"titulo": "Título atualizado"},
        headers=_auth(gestor_token),
    )
    assert r.status_code == 200
    assert r.json()["titulo"] == "Título atualizado"


def test_atualizar_artigo_inexistente(client, gestor_token):
    r = client.put("/artigos/9999", json={"titulo": "Título que não existe"}, headers=_auth(gestor_token))
    assert r.status_code == 404


# ─── Remoção ─────────────────────────────────────────────────────────────────

def test_deletar_artigo(client, gestor_token):
    artigo_id = client.post("/artigos", json=_ARTIGO, headers=_auth(gestor_token)).json()["id"]
    r = client.delete(f"/artigos/{artigo_id}", headers=_auth(gestor_token))
    assert r.status_code == 204

    r2 = client.get(f"/artigos/{artigo_id}")
    assert r2.status_code == 404


def test_deletar_artigo_sem_token(client, gestor_token):
    artigo_id = client.post("/artigos", json=_ARTIGO, headers=_auth(gestor_token)).json()["id"]
    r = client.delete(f"/artigos/{artigo_id}")
    assert r.status_code == 401


# ─── Filtro por categoria ─────────────────────────────────────────────────────

def test_filtrar_por_categoria(client, gestor_token):
    client.post("/artigos", json=_ARTIGO, headers=_auth(gestor_token))
    client.post("/artigos", json={**_ARTIGO, "categoria": "comunicacao"}, headers=_auth(gestor_token))

    r = client.get("/artigos?categoria=inteligencia_emocional")
    assert r.status_code == 200
    artigos = r.json()
    assert len(artigos) == 1
    assert artigos[0]["categoria"] == "inteligencia_emocional"
