from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.core.database import session_factory
from app.core.deps import ActiveUser, AdminUser
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    DireccionInvalida,
    PedidoAjeno,
    PedidoNoCancelable,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoNoEncontrado,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork(session_factory))


ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]
PedidoId = Annotated[int, Path(gt=0)]


# traduce las excepciones de dominio a códigos http
def a_http(error: Exception) -> HTTPException:
    if isinstance(error, (PedidoNoEncontrado, ProductoNoEncontrado)):
        return HTTPException(status.HTTP_404_NOT_FOUND, str(error))
    if isinstance(error, PedidoAjeno):
        return HTTPException(status.HTTP_403_FORBIDDEN, str(error))
    return HTTPException(status.HTTP_400_BAD_REQUEST, str(error))


ERRORES = (
    PedidoNoEncontrado,
    ProductoNoEncontrado,
    PedidoAjeno,
    StockInsuficiente,
    ProductoNoDisponible,
    ProductoRepetido,
    TransicionInvalida,
    PedidoNoCancelable,
    DireccionInvalida,
)


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(data: PedidoCreate, usuario: ActiveUser, service: ServiceDep):
    try:
        return service.crear(usuario, data)
    except ERRORES as e:
        raise a_http(e)


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    usuario: ActiveUser,
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: EstadoPedido | None = None,
):
    return service.listar(usuario, estado, skip, limit)


# va antes de /{pedido_id} para que "resumen" no se tome como id
@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(_admin: AdminUser, service: ServiceDep):
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(pedido_id: PedidoId, usuario: ActiveUser, service: ServiceDep):
    try:
        return service.obtener(usuario, pedido_id)
    except ERRORES as e:
        raise a_http(e)


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado(pedido_id: PedidoId, data: CambioEstado, _admin: AdminUser, service: ServiceDep):
    try:
        return service.cambiar_estado(pedido_id, data.estado)
    except ERRORES as e:
        raise a_http(e)


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(pedido_id: PedidoId, usuario: ActiveUser, service: ServiceDep):
    try:
        return service.cancelar(usuario, pedido_id)
    except ERRORES as e:
        raise a_http(e)
