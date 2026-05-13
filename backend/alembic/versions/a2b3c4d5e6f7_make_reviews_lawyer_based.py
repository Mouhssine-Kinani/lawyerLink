"""make reviews lawyer-based (remove reservation_id, add updated_at)

Revision ID: a2b3c4d5e6f7
Revises: a1b2c3d4e5f6
Create Date: 2026-05-13 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

revision: str = 'a2b3c4d5e6f7'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop foreign key if it exists (might have different names depending on DB)
    op.execute("SET FOREIGN_KEY_CHECKS = 0")
    try:
        op.drop_constraint('reviews_ibfk_3', 'reviews', type_='foreignkey')
    except Exception:
        pass
    try:
        op.drop_constraint('reviews_ibfk_1', 'reviews', type_='foreignkey')
    except Exception:
        pass
    try:
        op.drop_constraint('reviews_ibfk_2', 'reviews', type_='foreignkey')
    except Exception:
        pass

    # Drop reservation_id column
    op.drop_column('reviews', 'reservation_id')

    # Add updated_at column
    op.add_column('reviews', sa.Column('updated_at', sa.DateTime(), nullable=True))

    # Make comment NOT NULL (was nullable before)
    op.alter_column('reviews', 'comment',
                    existing_type=sa.Text(),
                    nullable=False)

    op.execute("SET FOREIGN_KEY_CHECKS = 1")


def downgrade() -> None:
    op.execute("SET FOREIGN_KEY_CHECKS = 0")
    op.alter_column('reviews', 'comment',
                    existing_type=sa.Text(),
                    nullable=True)
    op.drop_column('reviews', 'updated_at')
    op.add_column('reviews', sa.Column('reservation_id', mysql.BIGINT(), nullable=True))
    op.execute("SET FOREIGN_KEY_CHECKS = 1")
