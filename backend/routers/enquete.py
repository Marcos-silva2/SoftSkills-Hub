from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
import schemas
from core.database import get_db
from core.dependencies import get_aprendiz_atual
from services.enquete_service import calcular_faixa_etaria, verificar_cooldown

router = APIRouter(prefix="/enquete", tags=["Enquete"])


@router.post(
    "/responder",
    status_code=201,
    summary="Submete resposta anônima de clima",
    description=(
        "O backend copia os dados demográficos do aprendiz (empresa, gênero, faixa etária) "
        "para a resposta e descarta qualquer vínculo com o ID do usuário — garantindo anonimato total."
    ),
)
def responder_enquete(
    dados: schemas.RespostaEnqueteCreate,
    aprendiz: models.Aprendiz = Depends(get_aprendiz_atual),
    db: Session = Depends(get_db),
):
    agora = datetime.now(timezone.utc)
    verificar_cooldown(aprendiz, agora)

    resposta = models.RespostaEnquete(
        empresa_id=aprendiz.empresa_id,
        genero=aprendiz.genero,
        faixa_etaria=calcular_faixa_etaria(aprendiz.idade),
        desejo_efetivacao=dados.desejo_efetivacao,
        nota_satisfacao=dados.nota_satisfacao,
    )
    db.add(resposta)
    db.flush()

    for problema in dados.problemas:
        db.add(models.RespostaProblema(resposta_id=resposta.id, problema=problema))
    for item in dados.pontos_positivos:
        db.add(models.RespostaAvaliacao(resposta_id=resposta.id, tipo="positivo", valor=item))
    for item in dados.pontos_negativos:
        db.add(models.RespostaAvaliacao(resposta_id=resposta.id, tipo="negativo", valor=item))

    aprendiz.last_enquete_at = agora
    db.commit()
    return {"mensagem": "Resposta registrada com sucesso de forma totalmente anônima!"}
