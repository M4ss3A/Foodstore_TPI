import axios from 'axios'

interface ErrorValidacion {
  msg: string
  loc?: (string | number)[]
}

// pasa el detail de la api a un texto para mostrar
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'No se pudo conectar con el servidor'
    const detail: unknown = (error.response.data as { detail?: unknown } | undefined)?.detail

    if (typeof detail === 'string') return detail
    // 422: fastapi devuelve una lista de errores
    if (Array.isArray(detail)) {
      return (detail as ErrorValidacion[])
        .map((e) => {
          const campo = e.loc?.[e.loc.length - 1]
          return campo ? `${campo}: ${e.msg}` : e.msg
        })
        .join(' · ')
    }
    return `Error ${error.response.status}`
  }
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado'
}
