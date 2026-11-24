import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as productosApi from '../api/productos.ts'
import type { FiltrosProductos, ProductoInput, ProductoStockUpdate } from '../types/producto.ts'

// la key incluye los filtros: cada combinación se cachea aparte
export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => productosApi.getProductos(filtros),
  })
}

export function useGuardarProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id?: number; body: ProductoInput }) =>
      id ? productosApi.actualizarProducto(id, body) : productosApi.crearProducto(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }),
  })
}

export function useActualizarStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ProductoStockUpdate }) => productosApi.actualizarStock(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }),
  })
}

export function useEliminarProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: productosApi.eliminarProducto,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }),
  })
}
