const pesos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })

export function formatoPrecio(valor: number): string {
  return pesos.format(valor)
}

export function formatoFecha(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
}

// junta los errores de un campo de tanstack form en un texto
export function mensajeError(errors: unknown[]): string | undefined {
  const textos = errors.filter(Boolean).map(String)
  return textos.length ? textos.join(', ') : undefined
}
