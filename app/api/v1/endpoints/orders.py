from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Order, OrderItem
from app.schemas import (
    CheckoutRequest,
    CheckoutResponse,
    OrderItemResponse,
    OrderResponse,
)
from app.services import trigger_n8n_order_workflow

router = APIRouter()


@router.post("/checkout", response_model=CheckoutResponse)
async def checkout(
    request: CheckoutRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> CheckoutResponse:
    order = Order(
        user_id=request.user_id,
        total_amount=request.total_amount,
        delivery_address=request.delivery_address,
        phone_number=request.phone_number,
        status="confirmed",
    )
    db.add(order)
    db.flush()

    item_records: list[OrderItem] = []
    for item in request.items:
        record = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            product_name=item.product_name,
            quantity=item.quantity,
            unit=item.unit,
            unit_price=item.unit_price,
        )
        db.add(record)
        item_records.append(record)

    db.commit()
    db.refresh(order)

    webhook_payload = {
        "order_id": order.id,
        "user_id": order.user_id,
        "phone_number": order.phone_number,
        "delivery_address": order.delivery_address,
        "total_amount": order.total_amount,
        "status": order.status,
        "items": [
            {
                "item_name": r.product_name,
                "quantity": r.quantity,
                "unit": r.unit,
                "price": r.unit_price,
            }
            for r in item_records
        ],
    }

    background_tasks.add_task(trigger_n8n_order_workflow, webhook_payload)

    return CheckoutResponse(
        status="success",
        message="Order placed successfully",
        order=OrderResponse(
            id=order.id,
            user_id=order.user_id,
            total_amount=order.total_amount,
            delivery_address=order.delivery_address,
            phone_number=order.phone_number,
            status=order.status,
            items=[
                OrderItemResponse(
                    id=r.id,
                    order_id=r.order_id,
                    product_id=r.product_id,
                    product_name=r.product_name,
                    quantity=r.quantity,
                    unit=r.unit,
                    unit_price=r.unit_price,
                )
                for r in item_records
            ],
        ),
    )
