from fastapi import APIRouter

from app.api.v1 import (
    activities,
    admin_activities,
    admin_announcements,
    admin_characters,
    admin_dashboard,
    admin_group_leader_applications,
    admin_group_leaders,
    admin_products,
    admin_users,
    auth,
    favorites,
    follow_list,
    group_buys,
    group_leader_announcements,
    group_leader_applications,
    group_leader_group_buys,
    group_leader_orders,
    group_leader_profile,
    group_leaders,
    notifications,
    orders,
    products,
    search,
    uploads,
    users,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(group_leader_applications.router)
api_router.include_router(search.router)
api_router.include_router(activities.router)
api_router.include_router(products.router)
api_router.include_router(group_buys.router)
api_router.include_router(group_leaders.router)
api_router.include_router(uploads.router)
api_router.include_router(favorites.router)
api_router.include_router(follow_list.router)
api_router.include_router(orders.router)
api_router.include_router(group_leader_orders.router)
api_router.include_router(group_leader_group_buys.router)
api_router.include_router(group_leader_profile.router)
api_router.include_router(group_leader_announcements.router)
api_router.include_router(notifications.router)
api_router.include_router(admin_activities.router)
api_router.include_router(admin_characters.router)
api_router.include_router(admin_products.router)
api_router.include_router(admin_group_leader_applications.router)
api_router.include_router(admin_announcements.router)
api_router.include_router(admin_dashboard.router)
api_router.include_router(admin_users.router)
api_router.include_router(admin_group_leaders.router)
