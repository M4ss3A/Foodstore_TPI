from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido


def ahora_utc() -> datetime:
    return datetime.now(timezone.utc)


class Usuario(SQLModel, table=True):
    __tablename__ = "usuario"

    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True, max_length=50)
    full_name: str = Field(max_length=150)
    email: str = Field(index=True, unique=True, max_length=255)
    hashed_password: str  # se guarda el hash, no la contraseña
    role: str = Field(default="user", max_length=20)  # user o admin
    disabled: bool = Field(default=False)  # baja lógica
    created_at: datetime = Field(default_factory=ahora_utc, sa_type=DateTime(timezone=True))  # type: ignore[call-overload]

    # usuario 1:N pedidos
    pedidos: list["Pedido"] = Relationship(back_populates="usuario")
