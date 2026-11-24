import { api } from '../../../shared/api/axiosInstance.ts'
import type {
  FiltrosProductos,
  Producto,
  ProductoInput,
  ProductosPaginados,
  ProductoStockUpdate,
} from '../types/producto.ts'

export async function getProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  // saco los filtros vacíos para no mandarlos
  const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== undefined && v !== ''))
  const { data } = await api.get<ProductosPaginados>('/productos', { params })
  return data
}

export async function crearProducto(body: ProductoInput): Promise<Producto> {
  const { data } = await api.post<Producto>('/productos', body)
  return data
}

export async function actualizarProducto(id: number, body: Partial<ProductoInput>): Promise<Producto> {
  const { data } = await api.put<Producto>(`/productos/${id}`, body)
  return data
}

export async function actualizarStock(id: number, body: ProductoStockUpdate): Promise<Producto> {
  const { data } = await api.patch<Producto>(`/productos/${id}/stock`, body)
  return data
}

export async function eliminarProducto(id: number): Promise<void> {
  await api.delete(`/productos/${id}`)
}
