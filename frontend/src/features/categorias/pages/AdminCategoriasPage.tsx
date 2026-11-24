import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError.ts'
import { DataTable } from '../../../shared/components/DataTable.tsx'
import { EstadoError } from '../../../shared/components/EstadoError.tsx'
import { MensajeError } from '../../../shared/components/MensajeError.tsx'
import { SkeletonFilas } from '../../../shared/components/Skeleton.tsx'
import { Titulo } from '../../../shared/layout/Titulo.tsx'
import { Button } from '../../../shared/ui/Button.tsx'
import { Modal } from '../../../shared/ui/Modal.tsx'
import { CategoriaForm } from '../components/CategoriaForm.tsx'
import { useCategorias, useEliminarCategoria } from '../hooks/useCategorias.ts'
import type { Categoria } from '../types/categoria.ts'

export default function AdminCategoriasPage() {
  const { data, isLoading, isError, error, refetch } = useCategorias()
  const eliminar = useEliminarCategoria()
  const [modal, setModal] = useState<{ abierto: boolean; categoria: Categoria | null }>({
    abierto: false,
    categoria: null,
  })

  const columnas = useMemo<ColumnDef<Categoria, unknown>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'nombre', header: 'Nombre' },
      { accessorKey: 'descripcion', header: 'Descripción', cell: (c) => c.getValue<string | null>() ?? '—' },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button tamano="sm" variante="secundario" onClick={() => setModal({ abierto: true, categoria: row.original })}>
              Editar
            </Button>
            <Button
              tamano="sm"
              variante="peligro"
              onClick={() => {
                if (window.confirm(`¿Dar de baja la categoría "${row.original.nombre}"?`)) {
                  eliminar.mutate(row.original.id)
                }
              }}
            >
              Eliminar
            </Button>
          </div>
        ),
      },
    ],
    [eliminar],
  )

  return (
    <div>
      <Titulo accion={<Button onClick={() => setModal({ abierto: true, categoria: null })}>+ Nueva categoría</Button>}>
        Categorías
      </Titulo>

      <MensajeError mensaje={eliminar.isError ? handleApiError(eliminar.error) : null} />

      {isLoading && <SkeletonFilas />}
      {isError && <EstadoError error={error} onReintentar={() => void refetch()} />}
      {data && <DataTable datos={data} columnas={columnas} />}

      <Modal
        abierto={modal.abierto}
        titulo={modal.categoria ? 'Editar categoría' : 'Nueva categoría'}
        onClose={() => setModal({ abierto: false, categoria: null })}
      >
        {/* key: reinicia el form al cambiar de categoría */}
        <CategoriaForm
          key={modal.categoria?.id ?? 'nueva'}
          categoria={modal.categoria}
          onListo={() => setModal({ abierto: false, categoria: null })}
        />
      </Modal>
    </div>
  )
}
