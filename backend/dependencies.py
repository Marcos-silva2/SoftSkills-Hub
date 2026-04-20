from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

import auth
import models
from database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/aprendiz/login")


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
