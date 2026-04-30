"""add indexes para colunas filtradas e FKs

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-30 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index("ix_aprendizes_empresa_id",       "aprendizes",          ["empresa_id"])
    op.create_index("ix_respostas_enquete_empresa_id", "respostas_enquete",   ["empresa_id"])
    op.create_index("ix_respostas_enquete_data",       "respostas_enquete",   ["data_resposta"])
    op.create_index("ix_respostas_problemas_resp_id",  "respostas_problemas", ["resposta_id"])
    op.create_index("ix_respostas_avaliacao_resp_id",  "respostas_avaliacao", ["resposta_id"])
    op.create_index("ix_artigos_categoria",            "artigos",             ["categoria"])


def downgrade() -> None:
    op.drop_index("ix_artigos_categoria",            "artigos")
    op.drop_index("ix_respostas_avaliacao_resp_id",  "respostas_avaliacao")
    op.drop_index("ix_respostas_problemas_resp_id",  "respostas_problemas")
    op.drop_index("ix_respostas_enquete_data",       "respostas_enquete")
    op.drop_index("ix_respostas_enquete_empresa_id", "respostas_enquete")
    op.drop_index("ix_aprendizes_empresa_id",        "aprendizes")
