import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as categoriasApi from '../api/categorias.ts'
import type { CategoriaInput } from '../types/categoria.ts'

export function useCategorias() {
  return useQuery({ queryKey: ['categorias'], queryFn: categoriasApi.getCategorias })
}

export function useGuardarCategoria() {
  const qc = useQueryClient()
  return useMutation({
    // con id edita, sin id crea
    mutationFn: ({ id, body }: { id?: number; body: CategoriaInput }) =>
      id ? categoriasApi.actualizarCategoria(id, body) : categoriasApi.crearCategoria(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categorias'] }),
  })
}

export function useEliminarCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: categoriasApi.eliminarCategoria,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categorias'] }),
  })
}
