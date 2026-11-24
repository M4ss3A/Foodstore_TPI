import type { ReactNode } from 'react'

interface TituloProps {
  children: ReactNode
  accion?: ReactNode
}

// título de página con un botón opcional a la derecha
export function Titulo({ children, accion }: TituloProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold text-stone-800">{children}</h1>
      {accion}
    </div>
  )
}
