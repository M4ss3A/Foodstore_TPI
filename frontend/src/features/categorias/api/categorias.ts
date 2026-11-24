import { api } from '../../../shared/api/axiosInstance.ts'
import type { Categoria, CategoriaInput } from '../types/categoria.ts'

export async function getCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<Categoria[]>('/categorias')
  return data
}

export async function crearCategoria(body: CategoriaInput): Promise<Categoria> {
  const { data } = await api.post<Categoria>('/categorias', body)
  return data
}

export async function actualizarCategoria(id: number, body: Partial<CategoriaInput>): Promise<Categoria> {
  const { data } = await api.put<Categoria>(`/categorias/${id}`, body)
  return data
}

export async function eliminarCategoria(id: number): Promise<void> {
  await api.delete(`/categorias/${id}`)
}
