import { useCheckSession } from './features/auth/hooks/useCheckSession.ts'
import AppRouter from './routes/AppRouter.tsx'

function App() {
  // al montar: checkSession (la lógica vive en el hook de auth)
  useCheckSession()

  return <AppRouter />
}

export default App
