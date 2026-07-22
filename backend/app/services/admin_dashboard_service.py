from sqlalchemy.orm import Session

from app.repositories import activity_repository, group_buy_repository, group_leader_repository, product_repository
from app.schemas.admin_dashboard import CurrentGroupBuyItem, DashboardCard, DashboardResponse


def get_dashboard(db: Session) -> DashboardResponse:
    """依 API Design §26.1／Business Rules §27.1：第一版只顯示簡化統計卡片。"""
    pending_applications = group_leader_repository.count_pending_applications(db)
    open_activities = activity_repository.count_open_activities(db)
    active_products = product_repository.count_active_products(db)
    current_group_buys = group_buy_repository.count_current_group_buys(db)

    return DashboardResponse(
        cards=[
            DashboardCard(
                key="pending_group_leader_applications",
                label="待審核團主申請",
                count=pending_applications,
                target_url="/admin/group-leader-applications?status=pending",
            ),
            DashboardCard(
                key="open_activities",
                label="目前活動",
                count=open_activities,
                target_url="/admin/activities?status=open",
            ),
            DashboardCard(
                key="active_products",
                label="上架商品",
                count=active_products,
                target_url="/admin/products?is_active=true",
            ),
            DashboardCard(
                key="current_group_buys",
                label="目前開團",
                count=current_group_buys,
                target_url="/admin?view=current-group-buys",
            ),
        ]
    )


def get_current_group_buys(
    db: Session, page: int, page_size: int
) -> tuple[list[CurrentGroupBuyItem], int]:
    """依 API Design §26.2：唯讀清單，不提供管理操作。"""
    rows, total = group_buy_repository.list_current_group_buys(db, page, page_size)
    items = [
        CurrentGroupBuyItem(
            id=group_buy.id,
            activity_name=activity.name,
            group_leader_name=leader_profile.display_name,
            deadline_at=group_buy.deadline_at,
            order_count=group_buy_repository.count_orders_for_group_buy(db, group_buy.id),
            created_at=group_buy.created_at,
        )
        for group_buy, activity, leader_profile in rows
    ]
    return items, total
