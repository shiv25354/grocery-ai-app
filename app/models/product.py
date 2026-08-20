import uuid

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    price: Mapped[float] = mapped_column(nullable=False)
    unit: Mapped[str] = mapped_column(String, default="kg", nullable=False)
    stock: Mapped[int] = mapped_column(default=0, nullable=False)
    is_available: Mapped[bool] = mapped_column(default=True, nullable=False)
