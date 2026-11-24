import axios from 'axios'
import { useAuthStore } from '../../store/authStore.ts'

// cliente http único: la cookie viaja sola gracias a withCredentials
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

// rutas donde un 401 es esperable y no hay que cerrar la sesión
const RUTAS_SIN_LIMPIEZA = ['/auth/token', '/auth/me']

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response
      const url = error.config?.url ?? ''
      const detail = (data as { detail?: unknown } | undefined)?.detail

      const sesionVencida = status === 401 && !RUTAS_SIN_LIMPIEZA.some((r) => url.includes(r))
      const cuentaDesactivada = status === 400 && detail === 'Cuenta de usuario desactivada'

      // se limpia el store y ProtectedRoute manda al login
      if (sesionVencida || cuentaDesactivada) {
        useAuthStore.getState().limpiar()
      }
    }
    return Promise.reject(error)
  },
)
