from fastapi import APIRouter
from .auth import router as auth_router
from .users import router as users_router
from .clients import router as clients_router
from .orders import router as orders_router
from .deliveries import router as deliveries_router
from .transactions import router as transactions_router
from .dashboard import router as dashboard_router
from .financials import router as financials_router
from .budget import router as budget_router

api_router = APIRouter()

# Include all routers
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(clients_router)
api_router.include_router(orders_router)
api_router.include_router(deliveries_router)
api_router.include_router(transactions_router)
api_router.include_router(dashboard_router)
api_router.include_router(financials_router)
api_router.include_router(budget_router)

__all__ = ["api_router"]

# Made with Bob
