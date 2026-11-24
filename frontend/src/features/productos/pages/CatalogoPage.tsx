import { useState } from 'react'
import { EstadoError } from '../../../shared/components/EstadoError.tsx'
import { EstadoVacio } from '../../../shared/components/EstadoVacio.tsx'
import { Paginacion } from '../../../shared/components/Paginacion.tsx'
import { SkeletonGrilla } from '../../../shared/components/Skeleton.tsx'
import { Button } from '../../../shared/ui/Button.tsx'
import { useCategorias } from '../../categorias/hooks/useCategorias.ts'
import { ProductoCard } from '../components/ProductoCard.tsx'
import { useProductos } from '../hooks/useProductos.ts'

const POR_PAGINA = 8

export default function CatalogoPage() {
  const [pagina, setPagina] = useState(0)
  const [busqueda, setBusqueda] = useState('') // lo que se escribe
  const [search, setSearch] = useState('') // lo que se busca al apretar "Buscar"
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)

  const { data: categorias = [] } = useCategorias()
  // paginado en el servidor: skip = pagina * limit
  const { data, isLoading, isError, error, refetch, isFetching } = useProductos({
    skip: pagina * POR_PAGINA,
    limit: POR_PAGINA,
    search: search || undefined,
    categoria_id: categoriaId,
  })

  const totalPaginas = data ? Math.ceil(data.total / POR_PAGINA) : 0

  // al cambiar un filtro vuelvo a la primera página
  const elegirCategoria = (id: number | undefined) => {
    setCategoriaId(id)
    setPagina(0)
  }

  return (
    <div>
      <div className="mb-6 space-y-4">
        <h1 className="text-2xl font-bold text-stone-800">Nuestro menú</h1>
        <form
          className="flex gap-2 sm:max-w-md"
          onSubmit={(e) => {
            e.preventDefault()
            setSearch(busqueda.trim())
            setPagina(0)
          }}
        >
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar productos…"
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
          <Button type="submit">Buscar</Button>
        </form>
        <div className="flex flex-wrap gap-2">
          <Button tamano="sm" variante={categoriaId === undefined ? 'primario' : 'secundario'} onClick={() => elegirCategoria(undefined)}>
            Todas
          </Button>
          {categorias.map((c) => (
            <Button
              key={c.id}
              tamano="sm"
              variante={categoriaId === c.id ? 'primario' : 'secundario'}
              onClick={() => elegirCategoria(c.id)}
            >
              {c.nombre}
            </Button>
          ))}
        </div>
      </div>

      {isLoading && <SkeletonGrilla cantidad={POR_PAGINA} />}
      {isError && <EstadoError error={error} onReintentar={() => void refetch()} />}
      {data && data.items.length === 0 && (
        <EstadoVacio titulo="No encontramos productos" mensaje="Probá con otra búsqueda o categoría." />
      )}
      {data && data.items.length > 0 && (
        <>
          <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${isFetching ? 'opacity-60' : ''}`}>
            {data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
        </>
      )}
    </div>
  )
}
