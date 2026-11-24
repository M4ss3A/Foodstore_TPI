import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError.ts'
import { DataTable } from '../../../shared/components/DataTable.tsx'
import { EstadoError } from '../../../shared/components/EstadoError.tsx'
import { MensajeError } from '../../../shared/components/MensajeError.tsx'
import { SkeletonFilas } from '../../../shared/components/Skeleton.tsx'
import { Titulo } from '../../../shared/layout/Titulo.tsx'
import { Button } from '../../../shared/ui/Button.tsx'
import { useAuthStore } from '../../../store/authStore.ts'
import type { Usuario } from '../../auth/types/auth.ts'
import { useCambiarEstadoUsuario, useUsuarios } from '../hooks/useUsuarios.ts'

export default function AdminUsuariosPage() {
  const yo = useAuthStore((s) => s.usuario)
  const { data, isLoading, isError, error, refetch } = useUsuarios()
  const cambiarEstado = useCambiarEstadoUsuario()

  const columnas = useMemo<ColumnDef<Usuario, unknown>[]>(
    () => [
      { accessorKey: 'username', header: 'Usuario' },
      { accessorKey: 'full_name', header: 'Nombre' },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'role',
        header: 'Rol',
        cell: (c) => (
          <span className="rounded bg-stone-100 px-2 py-0.5 text-xs font-semibold uppercase">{c.getValue<string>()}</span>
        ),
      },
      {
        accessorKey: 'disabled',
        header: 'Estado',
        cell: (c) =>
          c.getValue<boolean>() ? (
            <span className="font-medium text-red-600">Desactivado</span>
          ) : (
            <span className="font-medium text-green-700">Activo</span>
          ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => {
          const u = row.original
          if (!u.disabled && u.id === yo?.id) return <span className="text-xs text-stone-400">(vos)</span>
          // el botón desactivar no aparece en mi propia fila
          return u.disabled ? (
            <Button tamano="sm" onClick={() => cambiarEstado.mutate({ id: u.id, activar: true })}>
              Activar
            </Button>
          ) : (
            <Button tamano="sm" variante="peligro" onClick={() => cambiarEstado.mutate({ id: u.id, activar: false })}>
              Desactivar
            </Button>
          )
        },
      },
    ],
    [yo, cambiarEstado],
  )

  return (
    <div>
      <Titulo>Usuarios</Titulo>
      <MensajeError mensaje={cambiarEstado.isError ? handleApiError(cambiarEstado.error) : null} />
      {isLoading && <SkeletonFilas />}
      {isError && <EstadoError error={error} onReintentar={() => void refetch()} />}
      {data && <DataTable datos={data} columnas={columnas} />}
    </div>
  )
}
