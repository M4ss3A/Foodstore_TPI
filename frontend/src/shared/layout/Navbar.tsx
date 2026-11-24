import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore.ts'
import { useCartStore } from '../../store/cartStore.ts'
import { queryClient } from '../api/queryClient.ts'
import { Button } from '../ui/Button.tsx'

const linkClase = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-orange-100 text-orange-700' : 'text-stone-600 hover:bg-stone-100'}`

const LINKS_ADMIN = [
  { to: '/admin/resumen', texto: 'Resumen' },
  { to: '/admin/pedidos', texto: 'Pedidos' },
  { to: '/admin/productos', texto: 'Productos' },
  { to: '/admin/categorias', texto: 'Categorías' },
  { to: '/admin/usuarios', texto: 'Usuarios' },
]

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const cantidad = useCartStore((s) => s.cantidadTotal())
  const navigate = useNavigate()

  const cerrarSesion = async () => {
    await logout()
    queryClient.clear() // borra la caché del usuario anterior
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        <Link to="/" className="mr-4 text-xl font-bold text-orange-600">
          🍕 Food Store
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          <NavLink to="/" end className={linkClase}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={linkClase}>
            Carrito {cantidad > 0 && <span className="ml-1 rounded-full bg-orange-600 px-1.5 text-xs text-white">{cantidad}</span>}
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={linkClase}>
              Mis pedidos
            </NavLink>
          )}
          {/* el panel solo se muestra al admin (igual el back lo valida) */}
          {usuario?.role === 'admin' &&
            LINKS_ADMIN.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClase}>
                {l.texto}
              </NavLink>
            ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {usuario ? (
            <>
              <span className="text-sm text-stone-600">
                {usuario.full_name}{' '}
                <span className="rounded bg-stone-100 px-1.5 py-0.5 text-xs uppercase text-stone-500">{usuario.role}</span>
              </span>
              <Button variante="secundario" tamano="sm" onClick={() => void cerrarSesion()}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-stone-700 hover:text-orange-600">
                Ingresar
              </Link>
              <Link to="/register">
                <Button tamano="sm">Registrarse</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
