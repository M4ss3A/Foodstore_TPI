import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { DataTable } from '../../../shared/components/DataTable.tsx'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado.tsx'
import { Button } from '../../../shared/ui/Button.tsx'
import { formatoFecha, formatoPrecio } from '../../../shared/utils/formato.ts'
import { TRANSICIONES, type EstadoPedido, type Pedido } from '../types/pedido.ts'

const TEXTO_ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: '',
  EN_PREPARACION: 'Preparar',
  ENTREGADO: 'Entregar',
  CANCELADO: 'Cancelar',
}

interface PedidosTablaProps {
  pedidos: Pedido[]
  nombres: Map<number, string> // id de usuario -> username
  onVer: (pedido: Pedido) => void
  onCambiarEstado: (pedido: Pedido, estado: EstadoPedido) => void
}

// tabla del panel con los botones según la máquina de estados
export function PedidosTabla({ pedidos, nombres, onVer, onCambiarEstado }: PedidosTablaProps) {
  const columnas = useMemo<ColumnDef<Pedido, unknown>[]>(
    () => [
      { accessorKey: 'id', header: '#' },
      {
        id: 'cliente',
        header: 'Cliente',
        cell: ({ row }) => nombres.get(row.original.usuario_id) ?? `#${row.original.usuario_id}`,
      },
      { accessorKey: 'created_at', header: 'Fecha', cell: (c) => formatoFecha(c.getValue<string>()) },
      { accessorKey: 'total', header: 'Total', cell: (c) => formatoPrecio(c.getValue<number>()) },
      { accessorKey: 'estado', header: 'Estado', cell: (c) => <BadgeEstado estado={c.getValue<EstadoPedido>()} /> },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => {
          const pedido = row.original
          return (
            <div className="flex flex-wrap gap-2">
              <Button tamano="sm" variante="secundario" onClick={() => onVer(pedido)}>
                Ver
              </Button>
              {/* solo los botones de las transiciones válidas */}
              {TRANSICIONES[pedido.estado].map((siguiente) => (
                <Button
                  key={siguiente}
                  tamano="sm"
                  variante={siguiente === 'CANCELADO' ? 'peligro' : 'primario'}
                  onClick={() => onCambiarEstado(pedido, siguiente)}
                >
                  {TEXTO_ACCION[siguiente]}
                </Button>
              ))}
            </div>
          )
        },
      },
    ],
    [nombres, onVer, onCambiarEstado],
  )

  return <DataTable datos={pedidos} columnas={columnas} />
}
