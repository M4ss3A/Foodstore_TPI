import { useForm } from '@tanstack/react-form'
import { useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError.ts'
import { MensajeError } from '../../../shared/components/MensajeError.tsx'
import { Button } from '../../../shared/ui/Button.tsx'
import { Input, Select, Textarea } from '../../../shared/ui/Input.tsx'
import { mensajeError } from '../../../shared/utils/formato.ts'
import { useCartStore } from '../../../store/cartStore.ts'
import { useCrearPedido } from '../hooks/usePedidos.ts'
import type { FormaPago } from '../types/pedido.ts'

export function CheckoutForm() {
  const items = useCartStore((s) => s.items)
  const vaciar = useCartStore((s) => s.vaciar)
  const crearPedido = useCrearPedido()
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as FormaPago, notas: '' },
    onSubmit: ({ value }) => {
      crearPedido.mutate(
        {
          items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega.trim(),
          notas: value.notas.trim() || null,
        },
        {
          // pedido creado: vacío el carrito y voy a mis pedidos
          onSuccess: () => {
            vaciar()
            navigate('/mis-pedidos')
          },
        },
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
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            return largo < 5 || largo > 200 ? 'La dirección debe tener entre 5 y 200 caracteres' : undefined
          },
        }}
      >
        {(field) => (
          <Input
            label="Dirección de entrega"
            placeholder="Calle, número, piso, depto"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={field.state.meta.isTouched ? mensajeError(field.state.meta.errors) : undefined}
          />
        )}
      </form.Field>
      <form.Field name="forma_pago">
        {(field) => (
          <Select
            label="Forma de pago"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value as FormaPago)}
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </Select>
        )}
      </form.Field>
      <form.Field
        name="notas"
        validators={{ onChange: ({ value }) => (value.length > 500 ? 'Máximo 500 caracteres' : undefined) }}
      >
        {(field) => (
          <Textarea
            label="Notas (opcional)"
            placeholder="Ej: tocar timbre 2B"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            error={mensajeError(field.state.meta.errors)}
          />
        )}
      </form.Field>

      <MensajeError mensaje={crearPedido.isError ? handleApiError(crearPedido.error) : null} />

      <form.Subscribe selector={(s) => s.canSubmit}>
        {(canSubmit) => (
          <Button type="submit" className="w-full" disabled={!canSubmit || items.length === 0} cargando={crearPedido.isPending}>
            Confirmar pedido
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
