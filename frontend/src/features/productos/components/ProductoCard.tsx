import { useState } from 'react'
import { Button } from '../../../shared/ui/Button.tsx'
import { formatoPrecio } from '../../../shared/utils/formato.ts'
import { useCartStore } from '../../../store/cartStore.ts'
import type { Producto } from '../types/producto.ts'

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0)
  const [imagenRota, setImagenRota] = useState(false)

  const sinStock = producto.stock <= enCarrito
  const vendible = producto.disponible && producto.stock > 0

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
      {producto.imagen_url && !imagenRota ? (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          className="h-40 w-full object-cover"
          onError={() => setImagenRota(true)}
        />
      ) : (
        <div className="flex h-40 items-center justify-center bg-orange-50 text-5xl">🍽️</div>
      )}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs font-medium uppercase text-orange-600">{producto.categoria.nombre}</span>
        <h3 className="font-semibold text-stone-800">{producto.nombre}</h3>
        {producto.descripcion && <p className="line-clamp-2 text-sm text-stone-500">{producto.descripcion}</p>}
        <div className="mt-auto flex items-end justify-between pt-3">
          <span className="text-lg font-bold">{formatoPrecio(producto.precio_base)}</span>
          <span className="text-xs text-stone-500">{vendible ? `Stock: ${producto.stock}` : 'Sin stock'}</span>
        </div>
        <Button
          className="mt-2"
          disabled={!vendible || sinStock}
          onClick={() =>
            agregar({
              producto_id: producto.id,
              nombre: producto.nombre,
              precio_unitario: producto.precio_base,
              imagen_url: producto.imagen_url,
            })
          }
        >
          {!vendible ? 'No disponible' : enCarrito > 0 ? `Agregar otro (${enCarrito})` : 'Agregar al carrito'}
        </Button>
      </div>
    </div>
  )
}
