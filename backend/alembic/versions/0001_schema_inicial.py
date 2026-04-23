"""schema inicial

Revision ID: 0001
Revises:
Create Date: 2026-04-23 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "empresas",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("nome", sa.String(150), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("nome"),
    )
    op.create_table(
        "gestores",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("username", sa.String(150), nullable=False),
        sa.Column("senha_hash", sa.String(255), nullable=False),
        sa.Column("nome", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("username"),
    )
    op.create_table(
        "aprendizes",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("username", sa.String(80), nullable=False),
        sa.Column("senha_hash", sa.String(255), nullable=False),
        sa.Column("idade", sa.Integer(), nullable=False),
        sa.Column("genero", sa.String(30), nullable=False),
        sa.Column("empresa_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("last_enquete_at", sa.DateTime(), nullable=True),
        sa.Column("last_mural_post_at", sa.DateTime(), nullable=True),
        sa.Column("is_admin", sa.Boolean(), server_default="0", nullable=False),
        sa.ForeignKeyConstraint(["empresa_id"], ["empresas.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("username"),
    )
    op.create_table(
        "respostas_enquete",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("empresa_id", sa.Integer(), nullable=False),
        sa.Column("genero", sa.String(30), nullable=False),
        sa.Column("faixa_etaria", sa.String(10), nullable=False),
        sa.Column("desejo_efetivacao", sa.String(10), nullable=False),
        sa.Column("nota_satisfacao", sa.Integer(), nullable=False),
        sa.Column("data_resposta", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["empresa_id"], ["empresas.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "respostas_problemas",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("resposta_id", sa.Integer(), nullable=False),
        sa.Column("problema", sa.String(80), nullable=False),
        sa.ForeignKeyConstraint(["resposta_id"], ["respostas_enquete.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "respostas_avaliacao",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("resposta_id", sa.Integer(), nullable=False),
        sa.Column("tipo", sa.String(10), nullable=False),
        sa.Column("valor", sa.String(80), nullable=False),
        sa.ForeignKeyConstraint(["resposta_id"], ["respostas_enquete.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "mensagens_mural",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("conteudo", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "artigos",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("titulo", sa.String(200), nullable=False),
        sa.Column("resumo", sa.String(300), nullable=False),
        sa.Column("conteudo", sa.Text(), nullable=False),
        sa.Column("categoria", sa.String(40), nullable=False),
        sa.Column("tempo_leitura", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("artigos")
    op.drop_table("mensagens_mural")
    op.drop_table("respostas_avaliacao")
    op.drop_table("respostas_problemas")
    op.drop_table("respostas_enquete")
    op.drop_table("aprendizes")
    op.drop_table("gestores")
    op.drop_table("empresas")
