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
import { formatoPrecio } from '../../../shared/utils/formato.ts'
import { ProductoForm } from '../components/ProductoForm.tsx'
import { StockForm } from '../components/StockForm.tsx'
import { useEliminarProducto, useProductos } from '../hooks/useProductos.ts'
import type { Producto } from '../types/producto.ts'

type ModalProducto = { tipo: 'cerrado' } | { tipo: 'form'; producto: Producto | null } | { tipo: 'stock'; producto: Producto }

export default function AdminProductosPage() {
  // el panel pide hasta 100 y pagina del lado del cliente
  const { data, isLoading, isError, error, refetch } = useProductos({ skip: 0, limit: 100 })
  const eliminar = useEliminarProducto()
  const [modal, setModal] = useState<ModalProducto>({ tipo: 'cerrado' })
  const cerrar = () => setModal({ tipo: 'cerrado' })

  const columnas = useMemo<ColumnDef<Producto, unknown>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'nombre', header: 'Nombre' },
      { accessorKey: 'categoria.nombre', header: 'Categoría' },
      { accessorKey: 'precio_base', header: 'Precio', cell: (c) => formatoPrecio(c.getValue<number>()) },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: (c) => {
          const stock = c.getValue<number>()
          return <span className={stock === 0 ? 'font-semibold text-red-600' : ''}>{stock}</span>
        },
      },
      {
        accessorKey: 'disponible',
        header: 'Disponible',
        cell: (c) => (c.getValue<boolean>() ? '✅ Sí' : '⛔ No'),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button tamano="sm" variante="secundario" onClick={() => setModal({ tipo: 'form', producto: row.original })}>
              Editar
            </Button>
            <Button tamano="sm" variante="secundario" onClick={() => setModal({ tipo: 'stock', producto: row.original })}>
              Stock
            </Button>
            <Button
              tamano="sm"
              variante="peligro"
              onClick={() => {
                if (window.confirm(`¿Dar de baja "${row.original.nombre}"?`)) eliminar.mutate(row.original.id)
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
      <Titulo accion={<Button onClick={() => setModal({ tipo: 'form', producto: null })}>+ Nuevo producto</Button>}>
        Productos
      </Titulo>

      <MensajeError mensaje={eliminar.isError ? handleApiError(eliminar.error) : null} />

      {isLoading && <SkeletonFilas />}
      {isError && <EstadoError error={error} onReintentar={() => void refetch()} />}
      {data && <DataTable datos={data.items} columnas={columnas} />}

      <Modal
        abierto={modal.tipo === 'form'}
        titulo={modal.tipo === 'form' && modal.producto ? 'Editar producto' : 'Nuevo producto'}
        onClose={cerrar}
      >
        {modal.tipo === 'form' && (
          <ProductoForm key={modal.producto?.id ?? 'nuevo'} producto={modal.producto} onListo={cerrar} />
        )}
      </Modal>

      <Modal
        abierto={modal.tipo === 'stock'}
        titulo={modal.tipo === 'stock' ? `Stock de ${modal.producto.nombre}` : ''}
        onClose={cerrar}
      >
        {modal.tipo === 'stock' && <StockForm key={modal.producto.id} producto={modal.producto} onListo={cerrar} />}
      </Modal>
    </div>
  )
}
