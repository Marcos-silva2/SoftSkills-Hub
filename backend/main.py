import logging
import logging.config
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from sqlalchemy import text

import auth
import models
from database import engine, SessionLocal
from limiter import limiter
from routers import empresas, auth_aprendiz, auth_gestor, enquete, mural, artigos, dashboard

# ─── Logging ──────────────────────────────────────────────────────────────────

logging.config.dictConfig({
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s | %(levelname)-8s | %(name)-35s | %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        }
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "default"}
    },
    "root": {"level": "INFO", "handlers": ["console"]},
    "loggers": {
        "uvicorn":        {"level": "WARNING", "handlers": ["console"], "propagate": False},
        "uvicorn.error":  {"level": "INFO",    "handlers": ["console"], "propagate": False},
        "uvicorn.access": {"level": "WARNING", "handlers": ["console"], "propagate": False},
    },
})

logger = logging.getLogger(__name__)


# ─── Startup ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("iniciando SoftSkills Hub API")
    models.Base.metadata.create_all(bind=engine)

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
                logger.info("conta aprendiz-adm criada")

    logger.info("startup concluído")
    yield
    logger.info("encerrando servidor")


# ─── Aplicação ────────────────────────────────────────────────────────────────

app = FastAPI(
    lifespan=lifespan,
    title="SoftSkills Hub API",
    description=(
        "Backend da plataforma de desenvolvimento socioemocional para jovens aprendizes. "
        "Acesse /docs para explorar todos os endpoints interativamente."
    ),
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*", "X-Total-Count"],
    expose_headers=["X-Total-Count"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────

app.include_router(empresas.router)
app.include_router(auth_aprendiz.router)
app.include_router(auth_gestor.router)
app.include_router(enquete.router)
app.include_router(mural.router)
app.include_router(artigos.router)
app.include_router(dashboard.router)
