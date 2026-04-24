import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from core.database import get_db
from core.dependencies import get_gestor_atual

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/artigos", tags=["Trilhas"])


@router.get("", response_model=list[schemas.ArtigoOut], summary="Lista artigos com filtro e paginação")
def listar_artigos(
    categoria: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(models.Artigo)
    if categoria:
        query = query.filter(models.Artigo.categoria == categoria)
    return query.order_by(models.Artigo.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{artigo_id}", response_model=schemas.ArtigoOut, summary="Retorna um artigo específico pelo ID")
def obter_artigo(artigo_id: int, db: Session = Depends(get_db)):
    artigo = db.query(models.Artigo).filter(models.Artigo.id == artigo_id).first()
    if not artigo:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    return artigo


@router.post("", response_model=schemas.ArtigoOut, status_code=201, summary="Cria novo artigo (requer login de gestor)")
def criar_artigo(
    dados: schemas.ArtigoCreate,
    gestor: models.Gestor = Depends(get_gestor_atual),
    db: Session = Depends(get_db),
):
    artigo = models.Artigo(
        titulo=dados.titulo,
        resumo=dados.resumo,
        conteudo=dados.conteudo,
        categoria=dados.categoria,
        tempo_leitura=dados.tempo_leitura,
    )
    db.add(artigo)
    db.commit()
    db.refresh(artigo)
    logger.info("artigo_criado id=%s gestor_id=%s titulo=%r", artigo.id, gestor.id, artigo.titulo[:40])
    return artigo


@router.put("/{artigo_id}", response_model=schemas.ArtigoOut, summary="Atualiza um artigo existente (requer login de gestor)")
def atualizar_artigo(
    artigo_id: int,
    dados: schemas.ArtigoUpdate,
    gestor: models.Gestor = Depends(get_gestor_atual),
    db: Session = Depends(get_db),
):
    artigo = db.query(models.Artigo).filter(models.Artigo.id == artigo_id).first()
    if not artigo:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")

    if dados.titulo is not None:
        artigo.titulo = dados.titulo
    if dados.resumo is not None:
        artigo.resumo = dados.resumo
    if dados.conteudo is not None:
        artigo.conteudo = dados.conteudo
    if dados.categoria is not None:
        artigo.categoria = dados.categoria
    if dados.tempo_leitura is not None:
        artigo.tempo_leitura = dados.tempo_leitura

    db.commit()
    db.refresh(artigo)
    logger.info("artigo_atualizado id=%s gestor_id=%s", artigo.id, gestor.id)
    return artigo


@router.delete("/{artigo_id}", status_code=204, summary="Remove um artigo (requer login de gestor)")
def deletar_artigo(
    artigo_id: int,
    gestor: models.Gestor = Depends(get_gestor_atual),
    db: Session = Depends(get_db),
):
    artigo = db.query(models.Artigo).filter(models.Artigo.id == artigo_id).first()
    if not artigo:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    db.delete(artigo)
    db.commit()
    logger.warning("artigo_deletado id=%s gestor_id=%s titulo=%r", artigo_id, gestor.id, artigo.titulo[:40])
