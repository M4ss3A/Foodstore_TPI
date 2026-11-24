from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


# excepciones de dominio
class ProductoNoEncontrado(Exception):
    pass  # 404


class CategoriaNoValida(Exception):
    pass  # 404: la categoría no existe o está dada de baja


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    # dado de baja = no existe
    @staticmethod
    def _buscar_activo(uow: ProductoUnitOfWork, producto_id: int) -> Producto:
        producto = uow.productos.get_by_id(producto_id)
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado("Producto no encontrado")
        return producto

    @staticmethod
    def _validar_categoria(uow: ProductoUnitOfWork, categoria_id: int) -> Categoria:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoValida("La categoría no existe o está dada de baja")
        return categoria

    def listar(
        self,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
        skip: int,
        limit: int,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.search(search, categoria_id, disponible, skip, limit)
            return ProductosPaginados(
                total=total, items=[ProductoRead.model_validate(p) for p in productos]
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._buscar_activo(uow, producto_id))

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._validar_categoria(uow, data.categoria_id)
            producto = Producto.model_validate(data)
            return ProductoRead.model_validate(uow.productos.add(producto))

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._buscar_activo(uow, producto_id)
            cambios = {
                campo: valor
                for campo, valor in data.model_dump(exclude_unset=True).items()
                if valor is not None or campo in ("descripcion", "imagen_url")
            }
            if "categoria_id" in cambios:
                # también cambio la relación para que la respuesta traiga la categoría nueva
                producto.categoria = self._validar_categoria(uow, cambios["categoria_id"])
            producto.sqlmodel_update(cambios)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._buscar_activo(uow, producto_id)
            if data.stock is not None:
                producto.stock = data.stock
            if data.disponible is not None:
                producto.disponible = data.disponible
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        # baja logica
        with self.uow as uow:
            producto = self._buscar_activo(uow, producto_id)
            producto.activo = False
