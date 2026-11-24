from sqlalchemy import func
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(Producto, session)

    # listado paginado de activos con busqueda y filtros
    def search(
        self,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
        skip: int,
        limit: int,
    ) -> tuple[int, list[Producto]]:
        filtros = [Producto.activo == True]  # noqa: E712
        if search:
            filtros.append(Producto.nombre.ilike(f"%{search.strip()}%"))  # type: ignore[attr-defined]
        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filtros.append(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(Producto).where(*filtros)).one()
        consulta = select(Producto).where(*filtros).order_by(Producto.id).offset(skip).limit(limit)  # type: ignore[arg-type]
        return total, list(self.session.exec(consulta).all())
