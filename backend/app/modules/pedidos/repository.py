from datetime import datetime

from sqlalchemy import func
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(Pedido, session)

    def _listar(self, filtros: list, skip: int, limit: int) -> tuple[int, list[Pedido]]:
        total = self.session.exec(select(func.count()).select_from(Pedido).where(*filtros)).one()
        consulta = select(Pedido).where(*filtros).order_by(Pedido.id.desc()).offset(skip).limit(limit)  # type: ignore[union-attr]
        return total, list(self.session.exec(consulta).all())

    # pedidos de un usuario (el cliente solo ve los suyos)
    def list_by_usuario(
        self, usuario_id: int, estado: str | None, skip: int, limit: int
    ) -> tuple[int, list[Pedido]]:
        filtros = [Pedido.usuario_id == usuario_id]
        if estado:
            filtros.append(Pedido.estado == estado)
        return self._listar(filtros, skip, limit)

    # todos los pedidos (admin)
    def list_todos(self, estado: str | None, skip: int, limit: int) -> tuple[int, list[Pedido]]:
        filtros = [Pedido.estado == estado] if estado else []
        return self._listar(filtros, skip, limit)

    # cantidad de pedidos en un estado
    def count_by_estado(self, estado: str) -> int:
        consulta = select(func.count()).select_from(Pedido).where(Pedido.estado == estado)
        return self.session.exec(consulta).one()

    def count_desde(self, desde: datetime) -> int:
        consulta = select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        return self.session.exec(consulta).one()

    # suma de total de los pedidos en un estado (None si no hay ninguno)
    def sum_total_por_estado(self, estado: str) -> float:
        consulta = select(func.sum(Pedido.total)).where(Pedido.estado == estado)
        return self.session.exec(consulta).one() or 0
