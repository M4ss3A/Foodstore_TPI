import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as usuariosApi from '../api/usuarios.ts'

export function useUsuarios() {
  return useQuery({ queryKey: ['usuarios'], queryFn: usuariosApi.getUsuarios })
}

export function useCambiarEstadoUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activar }: { id: number; activar: boolean }) =>
      activar ? usuariosApi.activarUsuario(id) : usuariosApi.desactivarUsuario(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }),
  })
}
