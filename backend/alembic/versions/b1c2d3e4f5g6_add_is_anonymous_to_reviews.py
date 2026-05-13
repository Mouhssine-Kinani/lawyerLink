"""add is_anonymous to reviews

Revision ID: b1c2d3e4f5g6
Revises: a2b3c4d5e6f7
Create Date: 2026-05-13 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "b1c2d3e4f5g6"
down_revision = "a2b3c4d5e6f7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("reviews", sa.Column("is_anonymous", sa.Boolean(), server_default="0", nullable=False))


def downgrade() -> None:
    op.drop_column("reviews", "is_anonymous")
