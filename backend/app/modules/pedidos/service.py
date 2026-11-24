from datetime import datetime, timezone

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.schemas import UserPublic


# excepciones de dominio
class PedidoNoEncontrado(Exception):
    pass  # 404


class ProductoNoEncontrado(Exception):
    pass  # 404


class PedidoAjeno(Exception):
    pass  # 403


class StockInsuficiente(Exception):
    pass  # 400


class ProductoNoDisponible(Exception):
    pass  # 400


class ProductoRepetido(Exception):
    pass  # 400


class TransicionInvalida(Exception):
    pass  # 400


class PedidoNoCancelable(Exception):
    pass  # 400


class DireccionInvalida(Exception):
    pass  # 400


# RN-02: maquina de estados
P, EP, E, C = (
    EstadoPedido.PENDIENTE,
    EstadoPedido.EN_PREPARACION,
    EstadoPedido.ENTREGADO,
    EstadoPedido.CANCELADO,
)
TRANSICIONES: dict[EstadoPedido, set[EstadoPedido]] = {
    P: {EP, C},
    EP: {E, C},
    E: set(),  # terminal
    C: set(),  # terminal
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    @staticmethod
    def _buscar(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado("Pedido no encontrado")
        return pedido

    # RN-03: devuelve el stock de cada linea
    @staticmethod
    def _restituir_stock(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        for item in pedido.items:
            producto = uow.productos.get_by_id(item.producto_id)
            if producto is not None:
                producto.stock += item.cantidad

    # RN-01: todo en una sola transaccion, si algo falla no se guarda nada
    def crear(self, usuario: UserPublic, data: PedidoCreate) -> PedidoRead:
        # productos repetidos: se valida antes de abrir la transacción
        ids = [item.producto_id for item in data.items]
        if len(ids) != len(set(ids)):
            raise ProductoRepetido("Hay productos repetidos en el pedido")
        # el schema valida el largo; aca evito una dirección hecha solo de espacios
        direccion = data.direccion_entrega.strip()
        if len(direccion) < 5:
            raise DireccionInvalida("La dirección debe tener al menos 5 caracteres")

        with self.uow as uow:
            pedido = Pedido(
                usuario_id=usuario.id,
                forma_pago=data.forma_pago.value,
                direccion_entrega=direccion,
                notas=data.notas,
                total=0,
            )
            uow.pedidos.add(pedido)

            total = 0.0
            # por cada ítem: verifica, descuenta stock y crea la línea
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"Producto {item.producto_id} no encontrado")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"'{producto.nombre}' no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente de '{producto.nombre}' (quedan {producto.stock})"
                    )

                producto.stock -= item.cantidad
                subtotal = round(producto.precio_base * item.cantidad, 2)
                # se copian nombre y precio (RN-05)
                pedido.items.append(
                    DetallePedido(
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            return PedidoRead.model_validate(pedido)

    # admin ve todos, user solo los suyos (RN-04)
    def listar(
        self, usuario: UserPublic, estado: EstadoPedido | None, skip: int, limit: int
    ) -> PedidosPaginados:
        valor_estado = estado.value if estado else None
        with self.uow as uow:
            if usuario.role == "admin":
                total, pedidos = uow.pedidos.list_todos(valor_estado, skip, limit)
            else:
                total, pedidos = uow.pedidos.list_by_usuario(usuario.id, valor_estado, skip, limit)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in pedidos])

    def obtener(self, usuario: UserPublic, pedido_id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("No tenés acceso a este pedido")
            return PedidoRead.model_validate(pedido)

    # admin: avanza o cancela segun la maquina de estados
    def cambiar_estado(self, pedido_id: int, nuevo: EstadoPedido) -> PedidoRead:
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id)
            actual = EstadoPedido(pedido.estado)
            if nuevo not in TRANSICIONES[actual]:
                raise TransicionInvalida(f"No se puede pasar de {actual.value} a {nuevo.value}")

            if nuevo == EstadoPedido.CANCELADO:
                self._restituir_stock(uow, pedido)
            pedido.estado = nuevo.value
            pedido.updated_at = datetime.now(timezone.utc)
            return PedidoRead.model_validate(pedido)

    # cliente: cancela su pedido solo si esta PENDIENTE
    def cancelar(self, usuario: UserPublic, pedido_id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("No podés cancelar un pedido de otro usuario")
            if pedido.estado != EstadoPedido.PENDIENTE.value:
                raise PedidoNoCancelable("Solo se puede cancelar un pedido PENDIENTE")

            self._restituir_stock(uow, pedido)
            pedido.estado = EstadoPedido.CANCELADO.value
            pedido.updated_at = datetime.now(timezone.utc)
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        # "hoy" segun la hora local del servidor
        inicio_hoy = datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0)
        with self.uow as uow:
            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado(P.value),
                en_preparacion=uow.pedidos.count_by_estado(EP.value),
                entregados=uow.pedidos.count_by_estado(E.value),
                cancelados=uow.pedidos.count_by_estado(C.value),
                pedidos_hoy=uow.pedidos.count_desde(inicio_hoy),
                ingresos_entregados=round(uow.pedidos.sum_total_por_estado(E.value), 2),
            )
