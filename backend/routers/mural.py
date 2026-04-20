from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from dependencies import get_aprendiz_atual
from services.mural_service import verificar_rate_limit

router = APIRouter(prefix="/mural", tags=["Mural"])


@router.get("", response_model=list[schemas.MensagemOut], summary="Lista as últimas 50 mensagens do mural")
def listar_mensagens(db: Session = Depends(get_db)):
    return (
        db.query(models.MensagemMural)
        .order_by(models.MensagemMural.created_at.desc())
        .limit(50)
        .all()
    )


@router.post(
    "",
    response_model=schemas.MensagemOut,
    status_code=201,
    summary="Posta mensagem anônima no mural (requer login de aprendiz)",
)
def postar_mensagem(
    dados: schemas.MensagemCreate,
    aprendiz: models.Aprendiz = Depends(get_aprendiz_atual),
    db: Session = Depends(get_db),
):
    verificar_rate_limit(aprendiz.id)
    msg = models.MensagemMural(conteudo=dados.conteudo)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


@router.delete(
    "/{mensagem_id}",
    status_code=204,
    summary="Apaga uma mensagem do mural (requer conta admin)",
)
def apagar_mensagem(
    mensagem_id: int,
    aprendiz: models.Aprendiz = Depends(get_aprendiz_atual),
    db: Session = Depends(get_db),
):
    if not aprendiz.is_admin:
        raise HTTPException(status_code=403, detail="Sem permissão para apagar mensagens")
    msg = db.query(models.MensagemMural).filter(models.MensagemMural.id == mensagem_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Mensagem não encontrada")
    db.delete(msg)
    db.commit()
