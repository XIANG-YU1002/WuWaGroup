import uuid

from sqlalchemy import Boolean, CheckConstraint, DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import AnnouncementAudienceScope, AnnouncementType

announcement_type_enum = Enum(
    AnnouncementType,
    name="announcement_type",
    values_callable=lambda enum_cls: [member.value for member in enum_cls],
)
announcement_audience_scope_enum = Enum(
    AnnouncementAudienceScope,
    name="announcement_audience_scope",
    values_callable=lambda enum_cls: [member.value for member in enum_cls],
)


class Announcement(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """儲存平台公告及團主公告（團主整體範圍或特定開團範圍）。"""

    __tablename__ = "announcement"

    announcement_type: Mapped[AnnouncementType] = mapped_column(
        announcement_type_enum, nullable=False
    )
    audience_scope: Mapped[AnnouncementAudienceScope | None] = mapped_column(
        announcement_audience_scope_enum, nullable=True
    )
    group_leader_profile_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("group_leader_profile.id", ondelete="RESTRICT"),
        nullable=True,
    )
    group_buy_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("group_buy.id", ondelete="RESTRICT"), nullable=True
    )
    created_by_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("app_user.id", ondelete="RESTRICT"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_public: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    published_at: Mapped[object] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    __table_args__ = (
        CheckConstraint("length(trim(title)) > 0", name="ck_announcement_title_not_blank"),
        CheckConstraint("length(trim(content)) > 0", name="ck_announcement_content_not_blank"),
        CheckConstraint(
            """
            (
                announcement_type = 'platform'
                AND audience_scope IS NULL
                AND group_leader_profile_id IS NULL
                AND group_buy_id IS NULL
                AND is_public = false
            )
            OR
            (
                announcement_type = 'group_leader'
                AND audience_scope = 'leader_unfinished'
                AND group_leader_profile_id IS NOT NULL
                AND group_buy_id IS NULL
            )
            OR
            (
                announcement_type = 'group_leader'
                AND audience_scope = 'group_buy_unfinished'
                AND group_leader_profile_id IS NOT NULL
                AND group_buy_id IS NOT NULL
            )
            """,
            name="ck_announcement_type_scope_pair",
        ),
    )
