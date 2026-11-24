import { Link } from 'react-router-dom'
import { Button } from '../../../shared/ui/Button.tsx'

export default function UnauthorizedPage() {
  return (
    <div className="py-20 text-center">
      <p className="text-5xl">🚫</p>
      <h1 className="mt-4 text-2xl font-bold">No tenés permiso para ver esta página</h1>
      <p className="mt-2 text-stone-500">Esta sección es solo para administradores.</p>
      <Link to="/" className="mt-6 inline-block">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  )
}
