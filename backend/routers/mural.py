import logging

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import func
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from dependencies import get_aprendiz_atual
from services.mural_service import verificar_rate_limit
from services.sanitizer import sanitizar_conteudo

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/mural", tags=["Mural"])


@router.get("", response_model=list[schemas.MensagemOut], summary="Lista mensagens do mural com paginação")
def listar_mensagens(
    skip: int = 0,
    limit: int = 20,
    response: Response = None,
    db: Session = Depends(get_db),
):
    total = db.query(func.count(models.MensagemMural.id)).scalar() or 0
    msgs = (
        db.query(models.MensagemMural)
        .order_by(models.MensagemMural.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    response.headers["X-Total-Count"] = str(total)
    return msgs


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
    try:
        conteudo_limpo = sanitizar_conteudo(dados.conteudo)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    verificar_rate_limit(aprendiz.id)
    msg = models.MensagemMural(conteudo=conteudo_limpo)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    logger.info("mural_post aprendiz_id=%s msg_id=%s", aprendiz.id, msg.id)
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
        logger.warning("mural_delete_negado aprendiz_id=%s msg_id=%s", aprendiz.id, mensagem_id)
        raise HTTPException(status_code=403, detail="Sem permissão para apagar mensagens")
    msg = db.query(models.MensagemMural).filter(models.MensagemMural.id == mensagem_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Mensagem não encontrada")
    db.delete(msg)
    db.commit()
    logger.warning("mural_delete admin_id=%s msg_id=%s", aprendiz.id, mensagem_id)
