import AdminDashboard from './AdminDashboard'
import LoginPage from './LoginPage'
import { useAuth } from './context/AuthContext.jsx'

export default function App() {
  const { isAuthenticated, isSubmitting, error, login } = useAuth()

  if (!isAuthenticated) {
    return (
      <LoginPage
        onSubmit={login}
        isSubmitting={isSubmitting}
        error={error}
      />
    )
  }

  return <AdminDashboard />
}