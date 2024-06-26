"""remove payment token column

Revision ID: 5e30ac2c0477
Revises: 579ee4af07c2
Create Date: 2024-05-21 14:35:34.099081

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '5e30ac2c0477'
down_revision = '579ee4af07c2'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('order', schema=None) as batch_op:
        batch_op.drop_column('payment_token')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('order', schema=None) as batch_op:
        batch_op.add_column(sa.Column('payment_token', mysql.VARCHAR(length=120), nullable=True))

    # ### end Alembic commands ###
