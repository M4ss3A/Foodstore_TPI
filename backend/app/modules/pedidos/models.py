from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario


def ahora_utc() -> datetime:
    return datetime.now(timezone.utc)


class Pedido(SQLModel, table=True):
    __tablename__ = "pedido"

    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    estado: str = Field(default="PENDIENTE", max_length=20, index=True)
    forma_pago: str = Field(max_length=20)  # EFECTIVO o TRANSFERENCIA
    direccion_entrega: str = Field(max_length=200)
    notas: str | None = Field(default=None, max_length=500)
    total: float = Field(default=0)  # suma de subtotales, no cambia despues
    created_at: datetime = Field(default_factory=ahora_utc, sa_type=DateTime(timezone=True))  # type: ignore[call-overload]
    updated_at: datetime = Field(default_factory=ahora_utc, sa_type=DateTime(timezone=True))  # type: ignore[call-overload]

    usuario: "Usuario" = Relationship(back_populates="pedidos")
    # las lineas son parte del pedido (composicion)
    items: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    __tablename__ = "detalle_pedido"

    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", index=True)
    producto_id: int = Field(foreign_key="producto.id", index=True)
    cantidad: int = Field(ge=1)
    # copia del nombre y precio al momento de comprar
    nombre_producto: str = Field(max_length=150)
    precio_unitario: float
    subtotal: float  # precio_unitario * cantidad

    pedido: Pedido = Relationship(back_populates="items")
    producto: "Producto" = Relationship(back_populates="detalles")
