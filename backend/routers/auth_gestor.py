import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from core import security as auth
import models
import schemas
from core.database import get_db
from core.dependencies import get_gestor_atual
from core.rate_limiter import limiter

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth/gestor", tags=["Auth"])


@router.post("/login", response_model=schemas.Token, summary="Login do gestor — retorna JWT")
@limiter.limit("5/minute")
def login_gestor(
    request: Request,
    dados: schemas.GestorLogin,
    db: Session = Depends(get_db),
):
    gestor = db.query(models.Gestor).filter(models.Gestor.username == dados.username).first()
    if not gestor or not auth.verificar_senha(dados.senha, gestor.senha_hash):
        logger.warning("login_falho_gestor username=%s", dados.username)
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos")
    if auth.hash_desatualizado(gestor.senha_hash):
        gestor.senha_hash = auth.hash_senha(dados.senha)
        db.commit()
    token = auth.criar_token({"sub": str(gestor.id), "tipo": "gestor"})
    logger.info("login_gestor id=%s", gestor.id)
    return {"access_token": token, "token_type": "bearer"}


@router.put("/perfil", summary="Atualiza nome e/ou senha do gestor")
def atualizar_perfil(
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
    logger.info("perfil_atualizado_gestor id=%s", gestor.id)
    return {"mensagem": "Perfil atualizado com sucesso"}


@router.post("/refresh", response_model=schemas.Token, summary="Renova o JWT do gestor (token ainda válido)")
def refresh_gestor(gestor: models.Gestor = Depends(get_gestor_atual)):
    token = auth.criar_token({"sub": str(gestor.id), "tipo": "gestor"})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", summary="Valida token do gestor e retorna seus dados")
def perfil_gestor(gestor: models.Gestor = Depends(get_gestor_atual)):
    return {"id": gestor.id, "username": gestor.username, "nome": gestor.nome}
