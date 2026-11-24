interface TarjetaResumenProps {
  titulo: string
  valor: string | number
  icono: string
  color: string
}

export function TarjetaResumen({ titulo, valor, icono, color }: TarjetaResumenProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-stone-500">{titulo}</span>
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl ${color}`}>{icono}</span>
      </div>
      <p className="mt-3 text-3xl font-bold text-stone-800">{valor}</p>
    </div>
  )
}
