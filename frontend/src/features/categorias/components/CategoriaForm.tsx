import { useForm } from '@tanstack/react-form'
import { handleApiError } from '../../../shared/api/handleApiError.ts'
import { MensajeError } from '../../../shared/components/MensajeError.tsx'
import { Button } from '../../../shared/ui/Button.tsx'
import { Input, Textarea } from '../../../shared/ui/Input.tsx'
import { mensajeError } from '../../../shared/utils/formato.ts'
import { useGuardarCategoria } from '../hooks/useCategorias.ts'
import type { Categoria } from '../types/categoria.ts'

interface CategoriaFormProps {
  categoria: Categoria | null // null = nueva
  onListo: () => void
}

export function CategoriaForm({ categoria, onListo }: CategoriaFormProps) {
  const guardar = useGuardarCategoria()

  const form = useForm({
    defaultValues: { nombre: categoria?.nombre ?? '', descripcion: categoria?.descripcion ?? '' },
    onSubmit: ({ value }) => {
      // al terminar bien cierra el modal
      guardar.mutate(
        { id: categoria?.id, body: { nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null } },
        { onSuccess: onListo },
      )
    },
  })

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="nombre"
        validators={{
          onChange: ({ value }) =>
            value.trim().length < 2 || value.trim().length > 100 ? 'Entre 2 y 100 caracteres' : undefined,
        }}
      >
        {(field) => (
          <Input
            label="Nombre"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={field.state.meta.isTouched ? mensajeError(field.state.meta.errors) : undefined}
          />
        )}
      </form.Field>
      <form.Field name="descripcion">
        {(field) => (
          <Textarea
            label="Descripción (opcional)"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>

      <MensajeError mensaje={guardar.isError ? handleApiError(guardar.error) : null} />

      <form.Subscribe selector={(s) => s.canSubmit}>
        {(canSubmit) => (
          <Button type="submit" className="w-full" disabled={!canSubmit} cargando={guardar.isPending}>
            {categoria ? 'Guardar cambios' : 'Crear categoría'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
