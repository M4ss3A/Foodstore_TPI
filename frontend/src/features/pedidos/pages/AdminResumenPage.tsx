import { EstadoError } from '../../../shared/components/EstadoError.tsx'
import { Skeleton } from '../../../shared/components/Skeleton.tsx'
import { Titulo } from '../../../shared/layout/Titulo.tsx'
import { formatoPrecio } from '../../../shared/utils/formato.ts'
import { TarjetaResumen } from '../components/TarjetaResumen.tsx'
import { useResumenPedidos } from '../hooks/usePedidos.ts'

export default function AdminResumenPage() {
  const { data, isLoading, isError, error, refetch } = useResumenPedidos()

  return (
    <div>
      <Titulo>Resumen del negocio</Titulo>
      {isError && <EstadoError error={error} onReintentar={() => void refetch()} />}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      )}
      {data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TarjetaResumen titulo="Pendientes" valor={data.pendientes} icono="⏳" color="bg-amber-100" />
          <TarjetaResumen titulo="En preparación" valor={data.en_preparacion} icono="👨‍🍳" color="bg-blue-100" />
          <TarjetaResumen titulo="Entregados" valor={data.entregados} icono="✅" color="bg-green-100" />
          <TarjetaResumen titulo="Cancelados" valor={data.cancelados} icono="✖️" color="bg-stone-200" />
          <TarjetaResumen titulo="Pedidos de hoy" valor={data.pedidos_hoy} icono="📅" color="bg-orange-100" />
          <TarjetaResumen
            titulo="Ingresos (entregados)"
            valor={formatoPrecio(data.ingresos_entregados)}
            icono="💰"
            color="bg-emerald-100"
          />
        </div>
      )}
    </div>
  )
}
