"""add coluna last_mural_post_at em aprendizes

Revision ID: 0003
Revises: 0002
Create Date: 2026-04-30 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    colunas = [c["name"] for c in inspect(conn).get_columns("aprendizes")]
    if "last_mural_post_at" not in colunas:
        with op.batch_alter_table("aprendizes") as batch_op:
            batch_op.add_column(sa.Column("last_mural_post_at", sa.DateTime(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("aprendizes") as batch_op:
        batch_op.drop_column("last_mural_post_at")
