import { api } from '../../../shared/api/axiosInstance.ts'
import type { LoginData, RegisterData, Usuario } from '../types/auth.ts'

// el login va como formulario (OAuth2), no como json
export async function login(data: LoginData): Promise<void> {
  const form = new URLSearchParams()
  form.append('username', data.username)
  form.append('password', data.password)
  await api.post('/auth/token', form)
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}

export async function getMe(): Promise<Usuario> {
  const { data } = await api.get<Usuario>('/auth/me')
  return data
}

export async function register(body: RegisterData): Promise<Usuario> {
  const { data } = await api.post<Usuario>('/auth/register', body)
  return data
}
