import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import * as authApi from '../features/auth/api/auth.ts'
import type { LoginData, Usuario } from '../features/auth/types/auth.ts'

interface AuthState {
  usuario: Usuario | null
  cargando: boolean
  login: (data: LoginData) => Promise<Usuario>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiar: () => void
}

// el token NO se guarda acá: vive en la cookie httponly
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (data) => {
        await authApi.login(data)
        const usuario = await authApi.getMe()
        set({ usuario, cargando: false })
        return usuario
      },

      logout: async () => {
        try {
          await authApi.logout()
        } finally {
          set({ usuario: null })
        }
      },

      // al abrir la app pregunta al back si la cookie sigue valida
      checkSession: async () => {
        set({ cargando: true })
        try {
          const usuario = await authApi.getMe()
          set({ usuario })
        } catch {
          set({ usuario: null })
        } finally {
          set({ cargando: false })
        }
      },

      limpiar: () => set({ usuario: null }),
    }),
    {
      name: 'foodstore-auth',
      storage: createJSONStorage(() => sessionStorage),
      // solo se persiste el usuario
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)
