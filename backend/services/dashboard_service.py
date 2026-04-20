from typing import Optional

from sqlalchemy.orm import Query
from sqlalchemy import func

import models


def filtrar_ano(query: Query, ano: Optional[int]) -> Query:
    """Filtra por ano usando substr — compatível com datetimes com microsegundos no SQLite."""
    if ano:
        query = query.filter(
            func.substr(models.RespostaEnquete.data_resposta, 1, 4) == str(ano)
        )
    return query
