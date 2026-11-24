export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-stone-200 ${className}`} />
}

// grilla de tarjetas "fantasma" mientras carga el catálogo
export function SkeletonGrilla({ cantidad = 8 }: { cantidad?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonFilas({ cantidad = 5 }: { cantidad?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: cantidad }, (_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}
