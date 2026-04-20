from datetime import datetime, timezone

from fastapi import HTTPException

COOLDOWN_SEGUNDOS = 120

# Estado em memória — reiniciado com o servidor.
# Para produção, substituir por Redis ou tabela de controle no banco.
_ultima_postagem: dict[int, datetime] = {}


def verificar_rate_limit(aprendiz_id: int) -> None:
    """Levanta HTTP 429 se o aprendiz postou recentemente."""
    agora = datetime.now(timezone.utc)
    ultima = _ultima_postagem.get(aprendiz_id)
    if ultima:
        diff = (agora - ultima).total_seconds()
        if diff < COOLDOWN_SEGUNDOS:
            restante = int(COOLDOWN_SEGUNDOS - diff)
            raise HTTPException(
                status_code=429,
                detail=f"Aguarde {restante}s antes de postar novamente.",
            )
    _ultima_postagem[aprendiz_id] = agora
