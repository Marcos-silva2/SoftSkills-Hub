from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

import auth
import models
from database import engine, SessionLocal
from routers import empresas, auth_aprendiz, auth_gestor, enquete, mural, artigos, dashboard

# ─── Criação de tabelas ────────────────────────────────────────────────────────

models.Base.metadata.create_all(bind=engine)

# ─── Migrações idempotentes ────────────────────────────────────────────────────

with engine.connect() as conn:
    for ddl in [
        "ALTER TABLE aprendizes ADD COLUMN last_enquete_at DATETIME",
        "ALTER TABLE aprendizes ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT 0",
    ]:
        try:
            conn.execute(text(ddl))
            conn.commit()
        except Exception:
            pass  # coluna já existe

    conn.execute(text("UPDATE aprendizes SET genero = 'prefiro_nao_dizer' WHERE genero = 'nao_binario'"))
    conn.execute(text("UPDATE respostas_enquete SET genero = 'prefiro_nao_dizer' WHERE genero = 'nao_binario'"))
    conn.commit()

# ─── Conta admin padrão ────────────────────────────────────────────────────────

with SessionLocal() as session:
    if not session.query(models.Aprendiz).filter_by(username="aprendiz-adm").first():
        primeira_empresa = session.query(models.Empresa).first()
        if primeira_empresa:
            session.add(models.Aprendiz(
                username="aprendiz-adm",
                senha_hash=auth.hash_senha("admin"),
                idade=18,
                genero="prefiro_nao_dizer",
                empresa_id=primeira_empresa.id,
                is_admin=True,
            ))
            session.commit()

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
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────

app.include_router(empresas.router)
app.include_router(auth_aprendiz.router)
app.include_router(auth_gestor.router)
app.include_router(enquete.router)
app.include_router(mural.router)
app.include_router(artigos.router)
app.include_router(dashboard.router)
