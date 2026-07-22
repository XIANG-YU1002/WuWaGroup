from fastapi import APIRouter

from app.api.v1 import (
    activities,
    auth,
    favorites,
    follow_list,
    group_buys,
    group_leader_applications,
    group_leader_orders,
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
api_router.include_router(notifications.router)
