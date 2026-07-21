from sqlalchemy import CheckConstraint, Enum, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import UserRole

user_role_enum = Enum(
    UserRole,
    name="user_role",
    values_callable=lambda enum_cls: [member.value for member in enum_cls],
)


class AppUser(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """儲存會員及管理員帳號與私人聯絡方式。團主仍使用同一筆帳號登入。

    註：`uq_app_user_email_lower`（LOWER(email) 唯一索引）由 Alembic Migration 以
    原生 SQL 建立，詳見 04_Database_Design_v2.1 §9.1。
    """

    __tablename__ = "app_user"

    email: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    nickname: Mapped[str] = mapped_column(String(50), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    facebook_contact: Mapped[str | None] = mapped_column(Text, nullable=True)
    discord_contact: Mapped[str | None] = mapped_column(Text, nullable=True)
    line_contact: Mapped[str | None] = mapped_column(Text, nullable=True)
    role: Mapped[UserRole] = mapped_column(
        user_role_enum,
        nullable=False,
        server_default=text(f"'{UserRole.MEMBER.value}'"),
        index=True,
    )

    __table_args__ = (
        CheckConstraint("length(trim(nickname)) > 0", name="ck_app_user_nickname_not_blank"),
        CheckConstraint(
            "facebook_contact IS NOT NULL OR discord_contact IS NOT NULL OR line_contact IS NOT NULL",
            name="ck_app_user_contact_required",
        ),
    )
