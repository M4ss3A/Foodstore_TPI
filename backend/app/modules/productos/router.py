from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, Response, status

from app.core.database import session_factory
from app.core.deps import AdminUser
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import (
    CategoriaNoValida,
    ProductoNoEncontrado,
    ProductoService,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix="/productos", tags=["productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork(session_factory))


ServiceDep = Annotated[ProductoService, Depends(get_producto_service)]
ProductoId = Annotated[int, Path(gt=0)]


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: Annotated[str | None, Query(max_length=100)] = None,
    categoria_id: Annotated[int | None, Query(gt=0)] = None,
    disponible: bool | None = None,
):
    return service.listar(search, categoria_id, disponible, skip, limit)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(producto_id: ProductoId, service: ServiceDep):
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))


# solo admin
@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(data: ProductoCreate, _admin: AdminUser, service: ServiceDep):
    try:
        return service.crear(data)
    except CategoriaNoValida as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(
    producto_id: ProductoId, data: ProductoUpdate, _admin: AdminUser, service: ServiceDep
):
    try:
        return service.actualizar(producto_id, data)
    except (ProductoNoEncontrado, CategoriaNoValida) as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def actualizar_stock(
    producto_id: ProductoId, data: ProductoStockUpdate, _admin: AdminUser, service: ServiceDep
):
    try:
        return service.actualizar_stock(producto_id, data)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(producto_id: ProductoId, _admin: AdminUser, service: ServiceDep):
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
