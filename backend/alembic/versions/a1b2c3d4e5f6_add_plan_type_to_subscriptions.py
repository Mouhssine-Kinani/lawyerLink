"""add plan_type to subscriptions

Revision ID: a1b2c3d4e5f6
Revises: 9f5af3447c79
Create Date: 2026-05-11 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '9f5af3447c79'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('subscriptions', sa.Column('plan_type', sa.String(20), server_default='pro', nullable=False))


def downgrade() -> None:
    op.drop_column('subscriptions', 'plan_type')
