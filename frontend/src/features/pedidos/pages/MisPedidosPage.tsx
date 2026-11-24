import { useState } from 'react'
import { Link } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError.ts'
import { EstadoError } from '../../../shared/components/EstadoError.tsx'
import { EstadoVacio } from '../../../shared/components/EstadoVacio.tsx'
import { MensajeError } from '../../../shared/components/MensajeError.tsx'
import { Paginacion } from '../../../shared/components/Paginacion.tsx'
import { SkeletonFilas } from '../../../shared/components/Skeleton.tsx'
import { Titulo } from '../../../shared/layout/Titulo.tsx'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado.tsx'
import { Button } from '../../../shared/ui/Button.tsx'
import { Card } from '../../../shared/ui/Card.tsx'
import { Modal } from '../../../shared/ui/Modal.tsx'
import { formatoFecha, formatoPrecio } from '../../../shared/utils/formato.ts'
import { DetallePedidoView } from '../components/DetallePedidoView.tsx'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos.ts'
import type { Pedido } from '../types/pedido.ts'

const POR_PAGINA = 10

export default function MisPedidosPage() {
  const [pagina, setPagina] = useState(0)
  const [detalle, setDetalle] = useState<Pedido | null>(null)
  const { data, isLoading, isError, error, refetch } = usePedidos({ skip: pagina * POR_PAGINA, limit: POR_PAGINA })
  const cancelar = useCancelarPedido()

  const cancelarPedido = (pedido: Pedido) => {
    if (window.confirm(`¿Cancelar el pedido #${pedido.id}?`)) {
      cancelar.mutate(pedido.id, { onSuccess: () => setDetalle(null) })
    }
  }

  return (
    <div>
      <Titulo>Mis pedidos</Titulo>
      <MensajeError mensaje={cancelar.isError ? handleApiError(cancelar.error) : null} />

      {isLoading && <SkeletonFilas />}
      {isError && <EstadoError error={error} onReintentar={() => void refetch()} />}
      {data && data.items.length === 0 && (
        <EstadoVacio
          titulo="Todavía no hiciste pedidos"
          accion={
            <Link to="/">
              <Button>Ir al catálogo</Button>
            </Link>
          }
        />
      )}

      <div className="space-y-3">
        {data?.items.map((pedido) => (
          <Card key={pedido.id} className="flex flex-wrap items-center gap-4">
            <div className="min-w-32">
              <p className="font-semibold">Pedido #{pedido.id}</p>
              <p className="text-sm text-stone-500">{formatoFecha(pedido.created_at)}</p>
            </div>
            <BadgeEstado estado={pedido.estado} />
            <p className="text-sm text-stone-600">
              {pedido.items.length} {pedido.items.length === 1 ? 'producto' : 'productos'}
            </p>
            <p className="ml-auto text-lg font-bold">{formatoPrecio(pedido.total)}</p>
            <div className="flex gap-2">
              <Button tamano="sm" variante="secundario" onClick={() => setDetalle(pedido)}>
                Ver detalle
              </Button>
              {/* solo se puede cancelar si está pendiente */}
              {pedido.estado === 'PENDIENTE' && (
                <Button tamano="sm" variante="peligro" cargando={cancelar.isPending && cancelar.variables === pedido.id} onClick={() => cancelarPedido(pedido)}>
                  Cancelar
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {data && (
        <Paginacion pagina={pagina} totalPaginas={Math.ceil(data.total / POR_PAGINA)} onCambiar={setPagina} />
      )}

      <Modal abierto={detalle !== null} titulo={`Pedido #${detalle?.id ?? ''}`} onClose={() => setDetalle(null)}>
        {detalle && (
          <>
            <DetallePedidoView pedido={detalle} />
            {detalle.estado === 'PENDIENTE' && (
              <Button variante="peligro" className="mt-4 w-full" onClick={() => cancelarPedido(detalle)}>
                Cancelar pedido
              </Button>
            )}
          </>
        )}
      </Modal>
    </div>
  )
}
