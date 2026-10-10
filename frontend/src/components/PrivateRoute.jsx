import { Route, Navigate, useRouteElement } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />
  }

  // Render the child route element
  return useRouteElement({ outlet: 'outlet' }) || children
}

export default PrivateRoute