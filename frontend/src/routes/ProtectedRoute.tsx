import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Rol } from '../features/auth/types/auth.ts'
import { useAuthStore } from '../store/authStore.ts'

interface ProtectedRouteProps {
  roles?: Rol[]
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)
  const location = useLocation()

  // mientras checkSession confirma la sesión
  if (cargando) {
    return (
      <div className="flex justify-center py-20">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    )
  }

  // sin sesión -> login (guardo a dónde quería ir)
  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  // sin el rol -> unauthorized
  if (roles && !roles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
