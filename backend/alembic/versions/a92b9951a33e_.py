"""empty message

Revision ID: a92b9951a33e
Revises: b633012cec49
Create Date: 2023-08-22 21:28:15.004852-04:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a92b9951a33e'
down_revision: Union[str, None] = 'b633012cec49'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('_alembic_tmp_event')
    with op.batch_alter_table('event', schema=None) as batch_op:
        batch_op.alter_column('token',
               existing_type=sa.VARCHAR(),
               nullable=True)
        batch_op.create_unique_constraint(batch_op.f('uq_event_token'), ['token'])

    with op.batch_alter_table('person', schema=None) as batch_op:
        batch_op.add_column(sa.Column('token', sa.String(), nullable=True))
        batch_op.create_unique_constraint(batch_op.f('uq_person_token'), ['token'])

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('person', schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f('uq_person_token'), type_='unique')
        batch_op.drop_column('token')

    with op.batch_alter_table('event', schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f('uq_event_token'), type_='unique')
        batch_op.alter_column('token',
               existing_type=sa.VARCHAR(),
               nullable=False)

    op.create_table('_alembic_tmp_event',
    sa.Column('id', sa.INTEGER(), nullable=False),
    sa.Column('event_type', sa.INTEGER(), nullable=False),
    sa.Column('reported_by', sa.INTEGER(), nullable=False),
    sa.Column('token', sa.VARCHAR(), nullable=False),
    sa.CheckConstraint('1 <= event_type and event_type <= 3', name='check_event_type_valid'),
    sa.ForeignKeyConstraint(['reported_by'], ['person.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('token', name='uq_event_token')
    )
    # ### end Alembic commands ###
