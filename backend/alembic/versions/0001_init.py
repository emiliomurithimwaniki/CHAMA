"""init

Revision ID: 0001
Revises: 
Create Date: 2026-03-30

"""

from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("full_name", sa.String(length=200), nullable=False),
        sa.Column("phone_number", sa.String(length=30), nullable=False),
        sa.Column("email", sa.String(length=200), nullable=True),
        sa.Column("password_hash", sa.String(length=255), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_users_phone_number", "users", ["phone_number"], unique=True)

    op.create_table(
        "chamas",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("currency", sa.String(length=10), nullable=False),
        sa.Column("contribution_type", sa.String(length=20), nullable=False),
        sa.Column("contribution_amount", sa.String(length=50), nullable=True),
        sa.Column("contribution_frequency", sa.String(length=20), nullable=False),
        sa.Column("loan_interest_type", sa.String(length=20), nullable=False),
        sa.Column("loan_interest_rate", sa.String(length=50), nullable=False),
        sa.Column("created_by_user_id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_chamas_name", "chamas", ["name"], unique=False)

    op.create_table(
        "memberships",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("chama_id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("role", sa.String(length=30), nullable=False),
        sa.Column("join_status", sa.String(length=20), nullable=False),
        sa.Column("joined_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint("chama_id", "user_id", name="uq_membership_chama_user"),
    )
    op.create_index("ix_memberships_chama_id", "memberships", ["chama_id"], unique=False)
    op.create_index("ix_memberships_user_id", "memberships", ["user_id"], unique=False)

    op.create_table(
        "contributions",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("chama_id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("amount", sa.String(length=50), nullable=False),
        sa.Column("contribution_date", sa.Date(), nullable=False),
        sa.Column("period_key", sa.String(length=20), nullable=True),
        sa.Column("payment_method", sa.String(length=30), nullable=True),
        sa.Column("payment_reference", sa.String(length=100), nullable=True),
        sa.Column("recorded_by_user_id", sa.String(length=36), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_contributions_chama_id", "contributions", ["chama_id"], unique=False)
    op.create_index("ix_contributions_user_id", "contributions", ["user_id"], unique=False)
    op.create_index("ix_contributions_period_key", "contributions", ["period_key"], unique=False)

    op.create_table(
        "loans",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("chama_id", sa.String(length=36), nullable=False),
        sa.Column("borrower_user_id", sa.String(length=36), nullable=False),
        sa.Column("principal_amount", sa.String(length=50), nullable=False),
        sa.Column("interest_type", sa.String(length=20), nullable=False),
        sa.Column("interest_rate", sa.String(length=50), nullable=False),
        sa.Column("term_months", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("total_payable", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_loans_chama_id", "loans", ["chama_id"], unique=False)
    op.create_index("ix_loans_borrower_user_id", "loans", ["borrower_user_id"], unique=False)

    op.create_table(
        "loan_approvals",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("chama_id", sa.String(length=36), nullable=False),
        sa.Column("loan_id", sa.String(length=36), nullable=False),
        sa.Column("step", sa.String(length=20), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("acted_by_user_id", sa.String(length=36), nullable=False),
        sa.Column("acted_at", sa.DateTime(), nullable=False),
        sa.Column("reason", sa.String(length=500), nullable=True),
        sa.UniqueConstraint("loan_id", "step", name="uq_loan_step"),
    )
    op.create_index("ix_loan_approvals_chama_id", "loan_approvals", ["chama_id"], unique=False)
    op.create_index("ix_loan_approvals_loan_id", "loan_approvals", ["loan_id"], unique=False)
    op.create_index("ix_loan_approvals_acted_by_user_id", "loan_approvals", ["acted_by_user_id"], unique=False)

    op.create_table(
        "loan_repayments",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("chama_id", sa.String(length=36), nullable=False),
        sa.Column("loan_id", sa.String(length=36), nullable=False),
        sa.Column("amount", sa.String(length=50), nullable=False),
        sa.Column("payment_reference", sa.String(length=100), nullable=True),
        sa.Column("recorded_by_user_id", sa.String(length=36), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("paid_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_loan_repayments_chama_id", "loan_repayments", ["chama_id"], unique=False)
    op.create_index("ix_loan_repayments_loan_id", "loan_repayments", ["loan_id"], unique=False)

    op.create_table(
        "payment_intents",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("chama_id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("purpose", sa.String(length=30), nullable=False),
        sa.Column("target_id", sa.String(length=36), nullable=True),
        sa.Column("amount", sa.String(length=50), nullable=False),
        sa.Column("currency", sa.String(length=10), nullable=False),
        sa.Column("provider", sa.String(length=20), nullable=False),
        sa.Column("provider_request_id", sa.String(length=100), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_payment_intents_chama_id", "payment_intents", ["chama_id"], unique=False)
    op.create_index("ix_payment_intents_user_id", "payment_intents", ["user_id"], unique=False)

    op.create_table(
        "payment_transactions",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("chama_id", sa.String(length=36), nullable=False),
        sa.Column("provider", sa.String(length=20), nullable=False),
        sa.Column("provider_txn_id", sa.String(length=100), nullable=False),
        sa.Column("payer_phone", sa.String(length=30), nullable=True),
        sa.Column("amount", sa.String(length=50), nullable=False),
        sa.Column("paid_at", sa.DateTime(), nullable=False),
        sa.Column("raw_payload", sa.String(), nullable=True),
        sa.Column("match_status", sa.String(length=20), nullable=False),
        sa.Column("matched_entity_type", sa.String(length=30), nullable=True),
        sa.Column("matched_entity_id", sa.String(length=36), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_payment_transactions_chama_id", "payment_transactions", ["chama_id"], unique=False)
    op.create_index("ix_payment_transactions_provider_txn_id", "payment_transactions", ["provider_txn_id"], unique=False)

    op.create_table(
        "chat_channels",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("chama_id", sa.String(length=36), nullable=False),
        sa.Column("type", sa.String(length=20), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_chat_channels_chama_id", "chat_channels", ["chama_id"], unique=False)

    op.create_table(
        "chat_messages",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("chama_id", sa.String(length=36), nullable=False),
        sa.Column("channel_id", sa.String(length=36), nullable=False),
        sa.Column("sender_user_id", sa.String(length=36), nullable=False),
        sa.Column("body", sa.String(length=2000), nullable=False),
        sa.Column("message_type", sa.String(length=20), nullable=False),
        sa.Column("attachment_url", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.Column("deleted_by_user_id", sa.String(length=36), nullable=True),
    )
    op.create_index("ix_chat_messages_chama_id", "chat_messages", ["chama_id"], unique=False)
    op.create_index("ix_chat_messages_channel_id", "chat_messages", ["channel_id"], unique=False)
    op.create_index("ix_chat_messages_sender_user_id", "chat_messages", ["sender_user_id"], unique=False)


def downgrade() -> None:
    op.drop_table("chat_messages")
    op.drop_table("chat_channels")
    op.drop_table("payment_transactions")
    op.drop_table("payment_intents")
    op.drop_table("loan_repayments")
    op.drop_table("loan_approvals")
    op.drop_table("loans")
    op.drop_table("contributions")
    op.drop_table("memberships")
    op.drop_table("chamas")
    op.drop_table("users")
