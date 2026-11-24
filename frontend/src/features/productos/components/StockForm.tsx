import { useForm } from '@tanstack/react-form'
import { handleApiError } from '../../../shared/api/handleApiError.ts'
import { MensajeError } from '../../../shared/components/MensajeError.tsx'
import { Button } from '../../../shared/ui/Button.tsx'
import { Input } from '../../../shared/ui/Input.tsx'
import { mensajeError } from '../../../shared/utils/formato.ts'
import { useActualizarStock } from '../hooks/useProductos.ts'
import type { Producto } from '../types/producto.ts'

interface StockFormProps {
  producto: Producto
  onListo: () => void
}

// PATCH /productos/{id}/stock
export function StockForm({ producto, onListo }: StockFormProps) {
  const actualizar = useActualizarStock()

  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible },
    onSubmit: ({ value }) => {
      actualizar.mutate({ id: producto.id, body: value }, { onSuccess: onListo })
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
            error={field.state.meta.isTouched ? mensajeError(field.state.meta.errors) : undefined}
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

      <MensajeError mensaje={actualizar.isError ? handleApiError(actualizar.error) : null} />

      <form.Subscribe selector={(s) => s.canSubmit}>
        {(canSubmit) => (
          <Button type="submit" className="w-full" disabled={!canSubmit} cargando={actualizar.isPending}>
            Actualizar stock
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
