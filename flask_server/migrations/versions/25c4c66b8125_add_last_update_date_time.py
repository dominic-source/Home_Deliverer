"""add last update date time

Revision ID: 25c4c66b8125
Revises: 5e30ac2c0477
Create Date: 2024-05-21 15:27:05.578215

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '25c4c66b8125'
down_revision = '5e30ac2c0477'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('payment', schema=None) as batch_op:
        batch_op.add_column(sa.Column('last_update_time', sa.DateTime(), nullable=False))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('payment', schema=None) as batch_op:
        batch_op.drop_column('last_update_time')

    # ### end Alembic commands ###
