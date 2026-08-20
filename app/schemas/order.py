from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    product_id: str | None = None
    product_name: str
    quantity: float = Field(..., gt=0)
    unit: str
    unit_price: float = Field(..., ge=0)


class CheckoutRequest(BaseModel):
    user_id: str = "guest-user"
    items: list[OrderItemCreate] = Field(..., min_length=1)
    total_amount: float = Field(..., ge=0)
    delivery_address: str
    phone_number: str


class OrderItemResponse(OrderItemCreate):
    id: str
    order_id: str


class OrderResponse(BaseModel):
    id: str
    user_id: str
    total_amount: float
    delivery_address: str
    phone_number: str
    status: str
    items: list[OrderItemResponse]


class CheckoutResponse(BaseModel):
    status: str
    message: str
    order: OrderResponse
