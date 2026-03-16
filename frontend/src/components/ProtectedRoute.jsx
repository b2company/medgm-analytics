import { useAuth, useUser } from '@clerk/react'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()

  // Aguardar carregar auth
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Redirecionar para login se não estiver autenticado
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />
  }

  // Verificar se requer admin (usando publicMetadata)
  const userRole = user?.publicMetadata?.orgRole
  if (requireAdmin && userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-900 mb-2">Acesso Negado</h2>
            <p className="text-red-700">Você não tem permissão de administrador para acessar esta página.</p>
            <button
              onClick={() => window.history.back()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return children
}
