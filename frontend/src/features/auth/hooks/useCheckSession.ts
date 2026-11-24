import { useEffect } from 'react'
import { useAuthStore } from '../../../store/authStore.ts'

// confirma la sesión una vez, al montar la app (llama a /auth/me)
// es el único useEffect con llamada a la api de todo el proyecto
export function useCheckSession() {
  const checkSession = useAuthStore((s) => s.checkSession)

  useEffect(() => {
    void checkSession()
  }, [checkSession])
}
