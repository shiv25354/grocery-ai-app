from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.models import Product
from app.schemas import ProductCreate, ProductResponse
from app.core.database import SessionLocal

router = APIRouter()


@router.get("/", response_model=list[ProductResponse])
def list_products() -> list[ProductResponse]:
    with SessionLocal() as db:
        products = db.scalars(select(Product)).all()
        return [ProductResponse(**p.__dict__) for p in products]


@router.post("/", response_model=ProductResponse, status_code=201)
def create_product(product: ProductCreate) -> ProductResponse:
    with SessionLocal() as db:
        record = Product(**product.model_dump())
        db.add(record)
        db.commit()
        db.refresh(record)
        return ProductResponse(**record.__dict__)
