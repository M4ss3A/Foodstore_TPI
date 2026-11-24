import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError.ts'
import { MensajeError } from '../../../shared/components/MensajeError.tsx'
import { Button } from '../../../shared/ui/Button.tsx'
import { Card } from '../../../shared/ui/Card.tsx'
import { Input } from '../../../shared/ui/Input.tsx'
import { mensajeError } from '../../../shared/utils/formato.ts'
import { useAuthStore } from '../../../store/authStore.ts'
import { register } from '../api/auth.ts'
import type { RegisterData } from '../types/auth.ts'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// mismas validaciones que UserCreate del back
const validar = {
  username: (v: string) => (v.trim().length < 3 ? 'Mínimo 3 caracteres' : undefined),
  full_name: (v: string) => (v.trim().length < 2 ? 'Ingresá tu nombre' : undefined),
  email: (v: string) => (!EMAIL_REGEX.test(v) ? 'Email inválido' : undefined),
  password: (v: string) => (v.length < 8 ? 'Mínimo 8 caracteres' : undefined),
}

const CAMPOS: { name: keyof RegisterData; label: string; type: string; autoComplete: string }[] = [
  { name: 'username', label: 'Usuario', type: 'text', autoComplete: 'username' },
  { name: 'full_name', label: 'Nombre completo', type: 'text', autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'password', label: 'Contraseña', type: 'password', autoComplete: 'new-password' },
]

export default function RegisterPage() {
  const login = useAuthStore((s) => s.login)
  const usuario = useAuthStore((s) => s.usuario)
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '' } as RegisterData,
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await register(value)
        // después del registro inicia sesión directo
        await login({ username: value.username, password: value.password })
        navigate('/', { replace: true })
      } catch (e) {
        setError(handleApiError(e))
      }
    },
  })

  if (usuario) return <Navigate to="/" replace />

  return (
    <div className="mx-auto max-w-sm pt-8">
      <Card className="p-6">
        <h1 className="mb-1 text-2xl font-bold">Crear cuenta</h1>
        <p className="mb-6 text-sm text-stone-500">Registrate para hacer pedidos</p>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          {CAMPOS.map((c) => (
            <form.Field key={c.name} name={c.name} validators={{ onChange: ({ value }) => validar[c.name](value) }}>
              {(field) => (
                <Input
                  label={c.label}
                  type={c.type}
                  autoComplete={c.autoComplete}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={field.state.meta.isTouched ? mensajeError(field.state.meta.errors) : undefined}
                />
              )}
            </form.Field>
          ))}

          <MensajeError mensaje={error} />

          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" className="w-full" disabled={!canSubmit} cargando={isSubmitting}>
                Registrarme
              </Button>
            )}
          </form.Subscribe>
        </form>
        <p className="mt-4 text-center text-sm text-stone-600">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-medium text-orange-600 hover:underline">
            Ingresá
          </Link>
        </p>
      </Card>
    </div>
  )
}
