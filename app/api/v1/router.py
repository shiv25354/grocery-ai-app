from fastapi import APIRouter

from app.api.v1.endpoints import orders, products, voice

api_router = APIRouter()
api_router.include_router(voice.router, prefix="/voice", tags=["voice"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
