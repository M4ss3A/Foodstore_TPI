import { api } from '../../../shared/api/axiosInstance.ts'
import type {
  EstadoPedido,
  FiltrosPedidos,
  Pedido,
  PedidoCreate,
  PedidosPaginados,
  ResumenPedidos,
} from '../types/pedido.ts'

export async function getPedidos(filtros: FiltrosPedidos): Promise<PedidosPaginados> {
  const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== undefined))
  const { data } = await api.get<PedidosPaginados>('/pedidos', { params })
  return data
}

export async function crearPedido(body: PedidoCreate): Promise<Pedido> {
  const { data } = await api.post<Pedido>('/pedidos', body)
  return data
}

export async function cambiarEstado(id: number, estado: EstadoPedido): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado })
  return data
}

export async function cancelarPedido(id: number): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(`/pedidos/${id}/cancelar`)
  return data
}

export async function getResumen(): Promise<ResumenPedidos> {
  const { data } = await api.get<ResumenPedidos>('/pedidos/resumen')
  return data
}
