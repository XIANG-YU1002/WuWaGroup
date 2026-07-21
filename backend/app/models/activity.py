from sqlalchemy import Boolean, CheckConstraint, Enum, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import ActivityStatus

activity_status_enum = Enum(
    ActivityStatus,
    name="activity_status",
    values_callable=lambda enum_cls: [member.value for member in enum_cls],
)


class Activity(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """儲存每一個實際官方活動。活動不是固定分類，管理員動態建立。

    `category` 為需求追蹤矩陣衝突解法 #1 的擴充欄位：依使用者決議加入自由文字分類，
    但不建立固定 Enum（符合 Business Rules §10.2 不使用固定活動分類 Enum 的原則）。
    """

    __tablename__ = "activity"

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[ActivityStatus] = mapped_column(
        activity_status_enum, nullable=False, server_default=text(f"'{ActivityStatus.OPEN.value}'")
    )
    has_full_gift: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)

    __table_args__ = (
        CheckConstraint("length(trim(name)) > 0", name="ck_activity_name_not_blank"),
        CheckConstraint("length(trim(image_url)) > 0", name="ck_activity_image_url_not_blank"),
    )
