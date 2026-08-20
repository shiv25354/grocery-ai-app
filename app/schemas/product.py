from pydantic import BaseModel


class ProductCreate(BaseModel):
    name: str
    description: str | None = None
    price: float
    unit: str = "kg"
    stock: int = 0
    is_available: bool = True


class ProductResponse(ProductCreate):
    id: str
