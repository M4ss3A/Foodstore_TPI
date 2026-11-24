import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as pedidosApi from '../api/pedidos.ts'
import type { EstadoPedido, FiltrosPedidos } from '../types/pedido.ts'

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => pedidosApi.getPedidos(filtros),
  })
}

export function useResumenPedidos() {
  return useQuery({ queryKey: ['resumen'], queryFn: pedidosApi.getResumen })
}

// cualquier cambio en un pedido afecta pedidos, resumen y el stock de productos
function useInvalidarTodo() {
  const qc = useQueryClient()
  return () => {
    void qc.invalidateQueries({ queryKey: ['pedidos'] })
    void qc.invalidateQueries({ queryKey: ['resumen'] })
    void qc.invalidateQueries({ queryKey: ['productos'] })
  }
}

export function useCrearPedido() {
  const invalidar = useInvalidarTodo()
  return useMutation({ mutationFn: pedidosApi.crearPedido, onSuccess: invalidar })
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarTodo()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => pedidosApi.cambiarEstado(id, estado),
    onSuccess: invalidar,
  })
}

export function useCancelarPedido() {
  const invalidar = useInvalidarTodo()
  return useMutation({ mutationFn: pedidosApi.cancelarPedido, onSuccess: invalidar })
}
