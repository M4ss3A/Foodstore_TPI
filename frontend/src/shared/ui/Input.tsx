import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const base =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200'

interface CampoProps {
  label: string
  error?: string
  children: ReactNode
}

// label + control + mensaje de error
function Campo({ label, error, children }: CampoProps) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      {children}
      {error && <span className="block text-sm text-red-600">{error}</span>}
    </label>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <Campo label={label} error={error}>
      <input className={`${base} ${error ? 'border-red-400' : ''} ${className}`} {...props} />
    </Campo>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
}

export function Select({ label, error, className = '', children, ...props }: SelectProps) {
  return (
    <Campo label={label} error={error}>
      <select className={`${base} ${className}`} {...props}>
        {children}
      </select>
    </Campo>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <Campo label={label} error={error}>
      <textarea className={`${base} ${className}`} rows={3} {...props} />
    </Campo>
  )
}
