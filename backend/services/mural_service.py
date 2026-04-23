from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

import models

COOLDOWN_SEGUNDOS = 120


def verificar_rate_limit(aprendiz: models.Aprendiz, db: Session) -> None:
    """Levanta HTTP 429 se o aprendiz postou recentemente. Persiste no banco."""
    agora = datetime.now(timezone.utc)
    ultima = aprendiz.last_mural_post_at
    if ultima:
        if ultima.tzinfo is None:
            ultima = ultima.replace(tzinfo=timezone.utc)
        diff = (agora - ultima).total_seconds()
        if diff < COOLDOWN_SEGUNDOS:
            restante = int(COOLDOWN_SEGUNDOS - diff)
            raise HTTPException(
                status_code=429,
                detail=f"Aguarde {restante}s antes de postar novamente.",
            )
    aprendiz.last_mural_post_at = agora
    db.commit()
