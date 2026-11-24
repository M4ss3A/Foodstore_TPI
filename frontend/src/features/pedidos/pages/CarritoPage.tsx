import { Link } from 'react-router-dom'
import { EstadoVacio } from '../../../shared/components/EstadoVacio.tsx'
import { Titulo } from '../../../shared/layout/Titulo.tsx'
import { Button } from '../../../shared/ui/Button.tsx'
import { Card } from '../../../shared/ui/Card.tsx'
import { formatoPrecio } from '../../../shared/utils/formato.ts'
import { useCartStore } from '../../../store/cartStore.ts'

export default function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const quitar = useCartStore((s) => s.quitar)
  const vaciar = useCartStore((s) => s.vaciar)
  const total = useCartStore((s) => s.total())

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="Tu carrito está vacío"
        mensaje="Agregá productos desde el catálogo."
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
      <Titulo
        accion={
          <Button variante="fantasma" tamano="sm" onClick={vaciar}>
            Vaciar carrito
          </Button>
        }
      >
        Carrito
      </Titulo>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <Card key={item.producto_id} className="flex items-center gap-4">
              {item.imagen_url ? (
                <img src={item.imagen_url} alt={item.nombre} className="h-16 w-16 rounded-lg object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-orange-50 text-2xl">🍽️</div>
              )}
              <div className="flex-1">
                <p className="font-semibold">{item.nombre}</p>
                <p className="text-sm text-stone-500">{formatoPrecio(item.precio_unitario)} c/u</p>
              </div>
              <div className="flex items-center gap-2">
                <Button tamano="sm" variante="secundario" onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}>
                  −
                </Button>
                <span className="w-6 text-center font-medium">{item.cantidad}</span>
                <Button tamano="sm" variante="secundario" onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}>
                  +
                </Button>
              </div>
              <p className="w-28 text-right font-semibold">{formatoPrecio(item.precio_unitario * item.cantidad)}</p>
              <button onClick={() => quitar(item.producto_id)} className="text-stone-400 hover:text-red-600" aria-label="Quitar">
                ✕
              </button>
            </Card>
          ))}
        </div>

        <Card className="h-fit space-y-4 p-5">
          <h2 className="text-lg font-semibold">Resumen</h2>
          <div className="flex justify-between text-lg">
            <span>Total</span>
            <span className="font-bold">{formatoPrecio(total)}</span>
          </div>
          <p className="text-xs text-stone-500">El stock y el precio final se confirman al crear el pedido.</p>
          <Link to="/checkout" className="block">
            <Button className="w-full">Continuar al checkout</Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
