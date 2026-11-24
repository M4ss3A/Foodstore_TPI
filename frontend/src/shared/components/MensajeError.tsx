// error de una mutación (debajo de un formulario o botón)
export function MensajeError({ mensaje }: { mensaje: string | null }) {
  if (!mensaje) return null
  return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{mensaje}</p>
}
