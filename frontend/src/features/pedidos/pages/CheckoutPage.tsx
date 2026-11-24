import { Link } from 'react-router-dom'
import { EstadoVacio } from '../../../shared/components/EstadoVacio.tsx'
import { Titulo } from '../../../shared/layout/Titulo.tsx'
import { Button } from '../../../shared/ui/Button.tsx'
import { Card } from '../../../shared/ui/Card.tsx'
import { formatoPrecio } from '../../../shared/utils/formato.ts'
import { useCartStore } from '../../../store/cartStore.ts'
import { CheckoutForm } from '../components/CheckoutForm.tsx'

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="No hay nada para confirmar"
        mensaje="Tu carrito está vacío."
        accion={
          <Link to="/">
            <Button>Ver catálogo</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div>
      <Titulo>Confirmar pedido</Titulo>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <CheckoutForm />
        </Card>
        <Card className="h-fit p-6">
          <h2 className="mb-3 font-semibold">Tu pedido</h2>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.producto_id} className="flex justify-between">
                <span>
                  {i.cantidad} × {i.nombre}
                </span>
                <span>{formatoPrecio(i.precio_unitario * i.cantidad)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t pt-3 text-lg font-bold">
            <span>Total</span>
            <span>{formatoPrecio(total)}</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
