import { useMemo, useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError.ts'
import { EstadoError } from '../../../shared/components/EstadoError.tsx'
import { MensajeError } from '../../../shared/components/MensajeError.tsx'
import { SkeletonFilas } from '../../../shared/components/Skeleton.tsx'
import { Titulo } from '../../../shared/layout/Titulo.tsx'
import { Modal } from '../../../shared/ui/Modal.tsx'
import { useUsuarios } from '../../usuarios/hooks/useUsuarios.ts'
import { DetallePedidoView } from '../components/DetallePedidoView.tsx'
import { PedidosTabla } from '../components/PedidosTabla.tsx'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos.ts'
import { ESTADOS, type EstadoPedido, type Pedido } from '../types/pedido.ts'

export default function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined)
  const [detalle, setDetalle] = useState<Pedido | null>(null)
  // el panel pide hasta 100 y la tabla pagina del lado del cliente
  const { data, isLoading, isError, error, refetch } = usePedidos({ skip: 0, limit: 100, estado })
  const { data: usuarios = [] } = useUsuarios()
  const cambiarEstado = useCambiarEstadoPedido()

  // id -> username para mostrar el cliente
  const nombres = useMemo(() => new Map(usuarios.map((u) => [u.id, u.username])), [usuarios])

  const onCambiarEstado = (pedido: Pedido, siguiente: EstadoPedido) => {
    if (siguiente === 'CANCELADO' && !window.confirm(`¿Cancelar el pedido #${pedido.id}? Se devuelve el stock.`)) {
      return
    }
    cambiarEstado.mutate({ id: pedido.id, estado: siguiente })
  }

  return (
    <div>
      <Titulo
        accion={
          <select
            value={estado ?? ''}
            onChange={(e) => setEstado(e.target.value ? (e.target.value as EstadoPedido) : undefined)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2"
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {e.replace('_', ' ')}
              </option>
            ))}
          </select>
        }
      >
        Pedidos
      </Titulo>

      <MensajeError mensaje={cambiarEstado.isError ? handleApiError(cambiarEstado.error) : null} />

      {isLoading && <SkeletonFilas />}
      {isError && <EstadoError error={error} onReintentar={() => void refetch()} />}
      {data && (
        <PedidosTabla pedidos={data.items} nombres={nombres} onVer={setDetalle} onCambiarEstado={onCambiarEstado} />
      )}

      <Modal abierto={detalle !== null} titulo={`Pedido #${detalle?.id ?? ''}`} onClose={() => setDetalle(null)}>
        {detalle && <DetallePedidoView pedido={detalle} />}
      </Modal>
    </div>
  )
}
