from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import datetime, timezone, timedelta

import auth
import models
import schemas
from database import engine, get_db

# Cria todas as tabelas no banco ao iniciar (se ainda não existirem)
models.Base.metadata.create_all(bind=engine)

# Migrações de banco
from sqlalchemy import text as _text
with engine.connect() as _conn:
    try:
        _conn.execute(_text("ALTER TABLE aprendizes ADD COLUMN last_enquete_at DATETIME"))
        _conn.commit()
    except Exception:
        pass  # coluna já existe

    # Remove nao_binario: converte para prefiro_nao_dizer em todas as tabelas
    _conn.execute(_text("UPDATE aprendizes SET genero = 'prefiro_nao_dizer' WHERE genero = 'nao_binario'"))
    _conn.execute(_text("UPDATE respostas_enquete SET genero = 'prefiro_nao_dizer' WHERE genero = 'nao_binario'"))
    _conn.commit()

# ─── Aplicação ────────────────────────────────────────────────────────────────

app = FastAPI(
    title="SoftSkills Hub API",
    description=(
        "Backend da plataforma de desenvolvimento socioemocional para jovens aprendizes. "
        "Acesse /docs para explorar todos os endpoints interativamente."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # JWT via header — não precisa de credentials
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/aprendiz/login")


# ─── Dependências de Autenticação ─────────────────────────────────────────────

def get_aprendiz_atual(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.Aprendiz:
    payload = auth.verificar_token(token)
    if not payload or payload.get("tipo") != "aprendiz":
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")
    aprendiz = db.query(models.Aprendiz).filter(models.Aprendiz.id == int(payload["sub"])).first()
    if not aprendiz:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    return aprendiz


def get_gestor_atual(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.Gestor:
    payload = auth.verificar_token(token)
    if not payload or payload.get("tipo") != "gestor":
        raise HTTPException(status_code=401, detail="Token inválido ou sem permissão de gestor")
    gestor = db.query(models.Gestor).filter(models.Gestor.id == int(payload["sub"])).first()
    if not gestor:
        raise HTTPException(status_code=401, detail="Gestor não encontrado")
    return gestor


# ─── Utilidades ───────────────────────────────────────────────────────────────

def _filtrar_ano(query, ano: Optional[int]):
    """Filtra por ano usando substr — funciona com qualquer formato de data SQLite."""
    if ano:
        query = query.filter(func.substr(models.RespostaEnquete.data_resposta, 1, 4) == str(ano))
    return query


def _calcular_faixa_etaria(idade: int) -> str:
    """Converte idade exata em faixa para proteger a privacidade nas respostas."""
    if idade <= 16:
        return "15-16"
    if idade <= 18:
        return "17-18"
    if idade <= 21:
        return "19-21"
    return "22"


# ═══════════════════════════════════════════════════════════════════════════════
# EMPRESAS
# ═══════════════════════════════════════════════════════════════════════════════

@app.get(
    "/empresas",
    response_model=list[schemas.EmpresaOut],
    tags=["Empresas"],
    summary="Lista todas as empresas parceiras",
)
def listar_empresas(db: Session = Depends(get_db)):
    return db.query(models.Empresa).order_by(models.Empresa.nome).all()


# ═══════════════════════════════════════════════════════════════════════════════
# AUTH — APRENDIZ
# ═══════════════════════════════════════════════════════════════════════════════

@app.post(
    "/auth/aprendiz/register",
    response_model=schemas.AprendizOut,
    status_code=201,
    tags=["Auth"],
    summary="Cadastro anônimo do aprendiz",
)
def cadastrar_aprendiz(dados: schemas.AprendizCreate, db: Session = Depends(get_db)):
    if db.query(models.Aprendiz).filter(models.Aprendiz.username == dados.username).first():
        raise HTTPException(status_code=400, detail="Nome de usuário já está em uso")

    if not db.query(models.Empresa).filter(models.Empresa.id == dados.empresa_id).first():
        raise HTTPException(status_code=404, detail="Empresa não encontrada")

    aprendiz = models.Aprendiz(
        username=dados.username,
        senha_hash=auth.hash_senha(dados.senha),
        idade=dados.idade,
        genero=dados.genero,
        empresa_id=dados.empresa_id,
    )
    db.add(aprendiz)
    db.commit()
    db.refresh(aprendiz)
    return aprendiz


@app.post(
    "/auth/aprendiz/login",
    response_model=schemas.Token,
    tags=["Auth"],
    summary="Login do aprendiz — retorna JWT",
)
def login_aprendiz(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    aprendiz = db.query(models.Aprendiz).filter(models.Aprendiz.username == form_data.username).first()
    if not aprendiz or not auth.verificar_senha(form_data.password, aprendiz.senha_hash):
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos")

    token = auth.criar_token({"sub": str(aprendiz.id), "tipo": "aprendiz"})
    return {"access_token": token, "token_type": "bearer"}


@app.put(
    "/auth/aprendiz/perfil",
    tags=["Auth"],
    summary="Atualiza username e/ou senha do aprendiz",
)
def atualizar_perfil_aprendiz(
    dados: schemas.AprendizPerfilUpdate,
    aprendiz: models.Aprendiz = Depends(get_aprendiz_atual),
    db: Session = Depends(get_db),
):
    if not auth.verificar_senha(dados.senha_atual, aprendiz.senha_hash):
        raise HTTPException(status_code=400, detail="Senha atual incorreta")

    if dados.novo_username:
        conflito = db.query(models.Aprendiz).filter(
            models.Aprendiz.username == dados.novo_username,
            models.Aprendiz.id != aprendiz.id,
        ).first()
        if conflito:
            raise HTTPException(status_code=400, detail="Nome de usuário já está em uso")
        aprendiz.username = dados.novo_username

    if dados.nova_senha:
        aprendiz.senha_hash = auth.hash_senha(dados.nova_senha)

    db.commit()
    return {"mensagem": "Perfil atualizado com sucesso"}


@app.get(
    "/auth/aprendiz/me",
    response_model=schemas.AprendizOut,
    tags=["Auth"],
    summary="Retorna dados do aprendiz autenticado",
)
def perfil_aprendiz(aprendiz: models.Aprendiz = Depends(get_aprendiz_atual)):
    return aprendiz


# ═══════════════════════════════════════════════════════════════════════════════
# AUTH — GESTOR
# ═══════════════════════════════════════════════════════════════════════════════

@app.post(
    "/auth/gestor/login",
    response_model=schemas.Token,
    tags=["Auth"],
    summary="Login do gestor — retorna JWT",
)
def login_gestor(dados: schemas.GestorLogin, db: Session = Depends(get_db)):
    gestor = db.query(models.Gestor).filter(models.Gestor.username == dados.username).first()
    if not gestor or not auth.verificar_senha(dados.senha, gestor.senha_hash):
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos")

    token = auth.criar_token({"sub": str(gestor.id), "tipo": "gestor"})
    return {"access_token": token, "token_type": "bearer"}


@app.put(
    "/auth/gestor/perfil",
    tags=["Auth"],
    summary="Atualiza nome e/ou senha do gestor",
)
def atualizar_perfil_gestor(
    dados: schemas.GestorPerfilUpdate,
    gestor: models.Gestor = Depends(get_gestor_atual),
    db: Session = Depends(get_db),
):
    if not auth.verificar_senha(dados.senha_atual, gestor.senha_hash):
        raise HTTPException(status_code=400, detail="Senha atual incorreta")

    if dados.nome is not None:
        gestor.nome = dados.nome.strip()

    if dados.nova_senha:
        gestor.senha_hash = auth.hash_senha(dados.nova_senha)

    db.commit()
    return {"mensagem": "Perfil atualizado com sucesso"}


@app.get(
    "/auth/gestor/me",
    tags=["Auth"],
    summary="Valida token do gestor e retorna seus dados",
)
def perfil_gestor(gestor: models.Gestor = Depends(get_gestor_atual)):
    return {"id": gestor.id, "username": gestor.username, "nome": gestor.nome}


# ═══════════════════════════════════════════════════════════════════════════════
# ENQUETE — PESQUISA DE CLIMA
# ═══════════════════════════════════════════════════════════════════════════════

COOLDOWN_ENQUETE_DIAS = 7

@app.post(
    "/enquete/responder",
    status_code=201,
    tags=["Enquete"],
    summary="Submete resposta anônima de clima",
    description=(
        "O backend copia os dados demográficos do aprendiz (empresa, gênero, faixa etária) "
        "para a resposta e descarta qualquer vínculo com o ID do usuário — garantindo anonimato total."
    ),
)
def responder_enquete(
    dados: schemas.RespostaEnqueteCreate,
    aprendiz: models.Aprendiz = Depends(get_aprendiz_atual),
    db: Session = Depends(get_db),
):
    agora = datetime.now(timezone.utc)

    if aprendiz.last_enquete_at:
        ultima = aprendiz.last_enquete_at
        if ultima.tzinfo is None:
            ultima = ultima.replace(tzinfo=timezone.utc)
        diff = agora - ultima
        if diff < timedelta(days=COOLDOWN_ENQUETE_DIAS):
            dias_restantes = COOLDOWN_ENQUETE_DIAS - diff.days
            raise HTTPException(
                status_code=429,
                detail=f"Você já respondeu essa semana. Aguarde {dias_restantes} dia(s) para responder novamente.",
            )

    faixa = _calcular_faixa_etaria(aprendiz.idade)

    resposta = models.RespostaEnquete(
        empresa_id=aprendiz.empresa_id,
        genero=aprendiz.genero,
        faixa_etaria=faixa,
        desejo_efetivacao=dados.desejo_efetivacao,
        nota_satisfacao=dados.nota_satisfacao,
    )
    db.add(resposta)
    db.flush()  # gera o ID sem fazer commit ainda

    for problema in dados.problemas:
        db.add(models.RespostaProblema(resposta_id=resposta.id, problema=problema))

    for item in dados.pontos_positivos:
        db.add(models.RespostaAvaliacao(resposta_id=resposta.id, tipo="positivo", valor=item))

    for item in dados.pontos_negativos:
        db.add(models.RespostaAvaliacao(resposta_id=resposta.id, tipo="negativo", valor=item))

    aprendiz.last_enquete_at = agora
    db.commit()
    return {"mensagem": "Resposta registrada com sucesso de forma totalmente anônima!"}


# ═══════════════════════════════════════════════════════════════════════════════
# DASHBOARD — PAINEL DO GESTOR (SIG)
# ═══════════════════════════════════════════════════════════════════════════════

@app.get(
    "/dashboard/resumo",
    response_model=schemas.DashboardResumo,
    tags=["Dashboard"],
    summary="Totais e médias gerais (com filtros opcionais)",
)
def dashboard_resumo(
    empresa_id: Optional[int] = None,
    genero: Optional[str] = None,
    faixa_etaria: Optional[str] = None,
    ano: Optional[int] = None,
    _: models.Gestor = Depends(get_gestor_atual),
    db: Session = Depends(get_db),
):
    query = db.query(models.RespostaEnquete)
    if empresa_id:
        query = query.filter(models.RespostaEnquete.empresa_id == empresa_id)
    if genero:
        query = query.filter(models.RespostaEnquete.genero == genero)
    if faixa_etaria:
        query = query.filter(models.RespostaEnquete.faixa_etaria == faixa_etaria)
    query = _filtrar_ano(query, ano)

    # Agrega no banco em vez de carregar todas as linhas em memória
    from sqlalchemy import case
    agg = query.with_entities(
        func.count(models.RespostaEnquete.id).label("total"),
        func.avg(models.RespostaEnquete.nota_satisfacao).label("media"),
        func.sum(
            case((models.RespostaEnquete.desejo_efetivacao == "sim", 1), else_=0)
        ).label("qtd_sim"),
    ).one()

    total = agg.total or 0
    if total == 0:
        return {"total_respostas": 0, "media_satisfacao": 0.0, "perc_quer_efetivacao": 0.0}

    return {
        "total_respostas": total,
        "media_satisfacao": round(agg.media, 2),
        "perc_quer_efetivacao": round((agg.qtd_sim / total) * 100, 1),
    }


@app.get(
    "/dashboard/problemas",
    response_model=list[schemas.ProblemaContagem],
    tags=["Dashboard"],
    summary="Ranking de problemas por frequência de relatos",
)
def dashboard_problemas(
    empresa_id: Optional[int] = None,
    genero: Optional[str] = None,
    faixa_etaria: Optional[str] = None,
    ano: Optional[int] = None,
    _: models.Gestor = Depends(get_gestor_atual),
    db: Session = Depends(get_db),
):
    query = (
        db.query(
            models.RespostaProblema.problema,
            func.count(models.RespostaProblema.problema).label("total"),
        )
        .join(models.RespostaEnquete)
    )
    if empresa_id:
        query = query.filter(models.RespostaEnquete.empresa_id == empresa_id)
    if genero:
        query = query.filter(models.RespostaEnquete.genero == genero)
    if faixa_etaria:
        query = query.filter(models.RespostaEnquete.faixa_etaria == faixa_etaria)
    query = _filtrar_ano(query, ano)

    resultado = (
        query.group_by(models.RespostaProblema.problema)
        .order_by(func.count().desc())
        .all()
    )
    return [{"problema": r.problema, "total": r.total} for r in resultado]


@app.get(
    "/dashboard/satisfacao-por-empresa",
    response_model=list[schemas.SatisfacaoEmpresa],
    tags=["Dashboard"],
    summary="Média de satisfação agrupada por empresa",
)
def satisfacao_por_empresa(
    ano: Optional[int] = None,
    _: models.Gestor = Depends(get_gestor_atual),
    db: Session = Depends(get_db),
):
    query = (
        db.query(
            models.Empresa.id,
            models.Empresa.nome,
            func.avg(models.RespostaEnquete.nota_satisfacao).label("media"),
            func.count(models.RespostaEnquete.id).label("total"),
        )
        .join(models.RespostaEnquete, models.Empresa.id == models.RespostaEnquete.empresa_id)
    )
    query = _filtrar_ano(query, ano)
    resultado = query.group_by(models.Empresa.id).all()
    return [
        {"empresa_id": r.id, "empresa": r.nome, "media_satisfacao": round(r.media, 2), "total_respostas": r.total}
        for r in resultado
    ]


@app.get(
    "/dashboard/efetivacao-por-empresa",
    tags=["Dashboard"],
    summary="Percentual de desejo de efetivação por empresa",
)
def efetivacao_por_empresa(
    empresa_id: Optional[int] = None,
    genero: Optional[str] = None,
    faixa_etaria: Optional[str] = None,
    ano: Optional[int] = None,
    _: models.Gestor = Depends(get_gestor_atual),
    db: Session = Depends(get_db),
):
    query = (
        db.query(
            models.Empresa.nome,
            models.RespostaEnquete.desejo_efetivacao,
            func.count(models.RespostaEnquete.id).label("qtd"),
        )
        .join(models.RespostaEnquete, models.Empresa.id == models.RespostaEnquete.empresa_id)
    )
    if empresa_id:
        query = query.filter(models.RespostaEnquete.empresa_id == empresa_id)
    if genero:
        query = query.filter(models.RespostaEnquete.genero == genero)
    if faixa_etaria:
        query = query.filter(models.RespostaEnquete.faixa_etaria == faixa_etaria)
    query = _filtrar_ano(query, ano)

    linhas = query.group_by(models.Empresa.nome, models.RespostaEnquete.desejo_efetivacao).all()

    por_empresa: dict = {}
    for nome, opcao, qtd in linhas:
        if nome not in por_empresa:
            por_empresa[nome] = {"sim": 0, "nao": 0, "talvez": 0}
        por_empresa[nome][opcao] = qtd

    resultado = []
    for nome, cont in por_empresa.items():
        total = cont["sim"] + cont["nao"] + cont["talvez"]
        resultado.append({
            "empresa": nome,
            "total": total,
            "sim_perc":    round(cont["sim"]    / total * 100, 1),
            "nao_perc":    round(cont["nao"]    / total * 100, 1),
            "talvez_perc": round(cont["talvez"] / total * 100, 1),
        })
    return resultado


@app.get(
    "/dashboard/empresa/{empresa_id}/detalhes",
    tags=["Dashboard"],
    summary="Detalhes completos de uma empresa: efetivação por gênero, problemas e avaliações",
)
def detalhe_empresa(
    empresa_id: int,
    _: models.Gestor = Depends(get_gestor_atual),
    db: Session = Depends(get_db),
):
    empresa = db.query(models.Empresa).filter(models.Empresa.id == empresa_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")

    total = db.query(func.count(models.RespostaEnquete.id)).filter(
        models.RespostaEnquete.empresa_id == empresa_id
    ).scalar() or 0

    if total == 0:
        return {"empresa": empresa.nome, "total_respostas": 0,
                "efetivacao_genero": [], "pontos_positivos": [], "pontos_negativos": [], "problemas": []}

    # Efetivação cruzada com gênero
    linhas_ef = (
        db.query(
            models.RespostaEnquete.genero,
            models.RespostaEnquete.desejo_efetivacao,
            func.count().label("qtd"),
        )
        .filter(models.RespostaEnquete.empresa_id == empresa_id)
        .group_by(models.RespostaEnquete.genero, models.RespostaEnquete.desejo_efetivacao)
        .all()
    )
    por_genero: dict = {}
    for genero, efetivacao, qtd in linhas_ef:
        if genero not in por_genero:
            por_genero[genero] = {"sim": 0, "nao": 0, "talvez": 0}
        por_genero[genero][efetivacao] = qtd

    efetivacao_genero = [
        {"genero": g, "sim": v["sim"], "nao": v["nao"], "talvez": v["talvez"],
         "total": v["sim"] + v["nao"] + v["talvez"]}
        for g, v in por_genero.items()
    ]

    # Pontos positivos
    positivos = (
        db.query(models.RespostaAvaliacao.valor, func.count().label("total"))
        .join(models.RespostaEnquete)
        .filter(models.RespostaEnquete.empresa_id == empresa_id, models.RespostaAvaliacao.tipo == "positivo")
        .group_by(models.RespostaAvaliacao.valor)
        .order_by(func.count().desc())
        .all()
    )

    # Pontos negativos
    negativos = (
        db.query(models.RespostaAvaliacao.valor, func.count().label("total"))
        .join(models.RespostaEnquete)
        .filter(models.RespostaEnquete.empresa_id == empresa_id, models.RespostaAvaliacao.tipo == "negativo")
        .group_by(models.RespostaAvaliacao.valor)
        .order_by(func.count().desc())
        .all()
    )

    # Problemas
    problemas = (
        db.query(models.RespostaProblema.problema, func.count().label("total"))
        .join(models.RespostaEnquete)
        .filter(models.RespostaEnquete.empresa_id == empresa_id)
        .group_by(models.RespostaProblema.problema)
        .order_by(func.count().desc())
        .all()
    )

    return {
        "empresa": empresa.nome,
        "total_respostas": total,
        "efetivacao_genero": efetivacao_genero,
        "pontos_positivos":  [{"valor": r.valor, "total": r.total} for r in positivos],
        "pontos_negativos":  [{"valor": r.valor, "total": r.total} for r in negativos],
        "problemas":         [{"problema": r.problema, "total": r.total} for r in problemas],
    }


# ═══════════════════════════════════════════════════════════════════════════════
# MURAL DA COMUNIDADE
# ═══════════════════════════════════════════════════════════════════════════════

@app.get(
    "/mural",
    response_model=list[schemas.MensagemOut],
    tags=["Mural"],
    summary="Lista as últimas 50 mensagens do mural",
)
def listar_mensagens(db: Session = Depends(get_db)):
    return (
        db.query(models.MensagemMural)
        .order_by(models.MensagemMural.created_at.desc())
        .limit(50)
        .all()
    )


@app.post(
    "/mural",
    response_model=schemas.MensagemOut,
    status_code=201,
    tags=["Mural"],
    summary="Posta mensagem anônima no mural (requer login de aprendiz)",
)
def postar_mensagem(
    dados: schemas.MensagemCreate,
    _: models.Aprendiz = Depends(get_aprendiz_atual),
    db: Session = Depends(get_db),
):
    msg = models.MensagemMural(conteudo=dados.conteudo)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


# ═══════════════════════════════════════════════════════════════════════════════
# TRILHAS DE SOFT SKILLS — ARTIGOS
# ═══════════════════════════════════════════════════════════════════════════════

@app.get(
    "/artigos",
    response_model=list[schemas.ArtigoOut],
    tags=["Trilhas"],
    summary="Lista artigos, com filtro opcional por categoria",
)
def listar_artigos(
    categoria: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Artigo)
    if categoria:
        query = query.filter(models.Artigo.categoria == categoria)
    return query.order_by(models.Artigo.created_at.desc()).all()


@app.get(
    "/artigos/{artigo_id}",
    response_model=schemas.ArtigoOut,
    tags=["Trilhas"],
    summary="Retorna um artigo específico pelo ID",
)
def obter_artigo(artigo_id: int, db: Session = Depends(get_db)):
    artigo = db.query(models.Artigo).filter(models.Artigo.id == artigo_id).first()
    if not artigo:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    return artigo
