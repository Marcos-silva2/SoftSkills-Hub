import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from core import security as auth
import models
import schemas
from core.database import get_db
from core.dependencies import get_aprendiz_atual
from core.rate_limiter import limiter

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth/aprendiz", tags=["Auth"])


@router.post(
    "/register",
    response_model=schemas.AprendizOut,
    status_code=201,
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
    logger.info("aprendiz_cadastrado id=%s username=%s", aprendiz.id, aprendiz.username)
    return aprendiz


@router.post("/login", response_model=schemas.Token, summary="Login do aprendiz — retorna JWT")
@limiter.limit("5/minute")
def login_aprendiz(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    aprendiz = db.query(models.Aprendiz).filter(models.Aprendiz.username == form_data.username).first()
    if not aprendiz or not auth.verificar_senha(form_data.password, aprendiz.senha_hash):
        logger.warning("login_falho_aprendiz username=%s", form_data.username)
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos")
    token = auth.criar_token({"sub": str(aprendiz.id), "tipo": "aprendiz"})
    logger.info("login_aprendiz id=%s", aprendiz.id)
    return {"access_token": token, "token_type": "bearer"}


@router.put("/perfil", summary="Atualiza username e/ou senha do aprendiz")
def atualizar_perfil(
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
    logger.info("perfil_atualizado_aprendiz id=%s", aprendiz.id)
    return {"mensagem": "Perfil atualizado com sucesso"}


@router.post("/refresh", response_model=schemas.Token, summary="Renova o JWT do aprendiz (token ainda válido)")
def refresh_aprendiz(aprendiz: models.Aprendiz = Depends(get_aprendiz_atual)):
    token = auth.criar_token({"sub": str(aprendiz.id), "tipo": "aprendiz"})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.AprendizOut, summary="Retorna dados do aprendiz autenticado")
def perfil_aprendiz(aprendiz: models.Aprendiz = Depends(get_aprendiz_atual)):
    return aprendiz
