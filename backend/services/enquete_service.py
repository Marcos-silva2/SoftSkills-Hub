import math
from datetime import datetime, timezone, timedelta

from fastapi import HTTPException

import models

COOLDOWN_DIAS = 7


def calcular_faixa_etaria(idade: int) -> str:
    """Converte idade exata em faixa para proteger a privacidade nas respostas."""
    if idade <= 16:
        return "15-16"
    if idade <= 18:
        return "17-18"
    if idade <= 21:
        return "19-21"
    return "22"


def verificar_cooldown(aprendiz: models.Aprendiz, agora: datetime) -> None:
    """Levanta HTTP 429 se o aprendiz ainda está no cooldown da enquete."""
    if not aprendiz.last_enquete_at:
        return
    ultima = aprendiz.last_enquete_at
    if ultima.tzinfo is None:
        ultima = ultima.replace(tzinfo=timezone.utc)
    diff = agora - ultima
    if diff < timedelta(days=COOLDOWN_DIAS):
        restante_seg = (timedelta(days=COOLDOWN_DIAS) - diff).total_seconds()
        if restante_seg < 86400:
            horas = max(1, math.ceil(restante_seg / 3600))
            prazo = f"{horas} hora{'s' if horas != 1 else ''}"
        else:
            dias = math.ceil(restante_seg / 86400)
            prazo = f"{dias} dia{'s' if dias != 1 else ''}"
        raise HTTPException(
            status_code=429,
            detail=f"Você já respondeu essa semana. Aguarde {prazo} para responder novamente.",
        )
