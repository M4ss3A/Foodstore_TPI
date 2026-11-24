import { BadgeEstado } from '../../../shared/ui/BadgeEstado.tsx'
import { formatoFecha, formatoPrecio } from '../../../shared/utils/formato.ts'
import type { Pedido } from '../types/pedido.ts'

// detalle con las líneas del pedido (nombre y precio copiados al comprar)
export function DetallePedidoView({ pedido }: { pedido: Pedido }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-2 gap-2">
        <span className="text-stone-500">Estado</span>
        <span>
          <BadgeEstado estado={pedido.estado} />
        </span>
        <span className="text-stone-500">Fecha</span>
        <span>{formatoFecha(pedido.created_at)}</span>
        <span className="text-stone-500">Forma de pago</span>
        <span>{pedido.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}</span>
        <span className="text-stone-500">Dirección</span>
        <span>{pedido.direccion_entrega}</span>
        {pedido.notas && (
          <>
            <span className="text-stone-500">Notas</span>
            <span>{pedido.notas}</span>
          </>
        )}
      </div>

      <table className="w-full">
        <thead className="border-b text-left text-stone-500">
          <tr>
            <th className="py-2">Producto</th>
            <th className="py-2 text-right">Cant.</th>
            <th className="py-2 text-right">Precio</th>
            <th className="py-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {pedido.items.map((item) => (
            <tr key={item.producto_id} className="border-b border-stone-100">
              <td className="py-2">{item.nombre_producto}</td>
              <td className="py-2 text-right">{item.cantidad}</td>
              <td className="py-2 text-right">{formatoPrecio(item.precio_unitario)}</td>
              <td className="py-2 text-right">{formatoPrecio(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-right text-lg font-bold">Total: {formatoPrecio(pedido.total)}</p>
    </div>
  )
}
