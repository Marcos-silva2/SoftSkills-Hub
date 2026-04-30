from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Query

import models


def filtrar_ano(query: Query, ano: Optional[int]) -> Query:
    if ano:
        query = query.filter(
            models.RespostaEnquete.data_resposta >= datetime(ano, 1, 1),
            models.RespostaEnquete.data_resposta < datetime(ano + 1, 1, 1),
        )
    return query
