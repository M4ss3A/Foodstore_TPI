import { useForm } from '@tanstack/react-form'
import { handleApiError } from '../../../shared/api/handleApiError.ts'
import { MensajeError } from '../../../shared/components/MensajeError.tsx'
import { Button } from '../../../shared/ui/Button.tsx'
import { Input, Select, Textarea } from '../../../shared/ui/Input.tsx'
import { mensajeError } from '../../../shared/utils/formato.ts'
import { useCategorias } from '../../categorias/hooks/useCategorias.ts'
import { useGuardarProducto } from '../hooks/useProductos.ts'
import type { Producto } from '../types/producto.ts'

interface ProductoFormProps {
  producto: Producto | null // null = nuevo
  onListo: () => void
}

export function ProductoForm({ producto, onListo }: ProductoFormProps) {
  const guardar = useGuardarProducto()
  const { data: categorias = [] } = useCategorias()

  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precio_base: producto?.precio_base ?? 0,
      imagen_url: producto?.imagen_url ?? '',
      stock: producto?.stock ?? 0,
      disponible: producto?.disponible ?? true,
      categoria_id: producto?.categoria_id ?? 0,
    },
    onSubmit: ({ value }) => {
      guardar.mutate(
        {
          id: producto?.id,
          body: {
            ...value,
            nombre: value.nombre.trim(),
            descripcion: value.descripcion.trim() || null,
            imagen_url: value.imagen_url.trim() || null,
          },
        },
        { onSuccess: onListo },
      )
    },
  })

  const error = (errors: unknown[], tocado: boolean) => (tocado ? mensajeError(errors) : undefined)

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
        validators={{ onChange: ({ value }) => (value.trim().length < 2 ? 'Mínimo 2 caracteres' : undefined) }}
      >
        {(field) => (
          <Input
            label="Nombre"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={error(field.state.meta.errors, field.state.meta.isTouched)}
          />
        )}
      </form.Field>

      <form.Field
        name="categoria_id"
        validators={{ onChange: ({ value }) => (value <= 0 ? 'Elegí una categoría' : undefined) }}
      >
        {(field) => (
          <Select
            label="Categoría"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(Number(e.target.value))}
            error={error(field.state.meta.errors, field.state.meta.isTouched)}
          >
            <option value={0}>Seleccionar…</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-3">
        <form.Field
          name="precio_base"
          validators={{ onChange: ({ value }) => (value < 0 || Number.isNaN(value) ? 'Debe ser >= 0' : undefined) }}
        >
          {(field) => (
            <Input
              label="Precio"
              type="number"
              min={0}
              step="0.01"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              error={error(field.state.meta.errors, field.state.meta.isTouched)}
            />
          )}
        </form.Field>
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) => (value < 0 || !Number.isInteger(value) ? 'Entero >= 0' : undefined),
          }}
        >
          {(field) => (
            <Input
              label="Stock"
              type="number"
              min={0}
              step={1}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              error={error(field.state.meta.errors, field.state.meta.isTouched)}
            />
          )}
        </form.Field>
      </div>

      <form.Field name="imagen_url">
        {(field) => (
          <Input
            label="URL de la imagen (opcional)"
            placeholder="https://…"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
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

      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
              className="h-4 w-4 accent-orange-600"
            />
            Disponible para la venta
          </label>
        )}
      </form.Field>

      <MensajeError mensaje={guardar.isError ? handleApiError(guardar.error) : null} />

      <form.Subscribe selector={(s) => s.canSubmit}>
        {(canSubmit) => (
          <Button type="submit" className="w-full" disabled={!canSubmit} cargando={guardar.isPending}>
            {producto ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
