/**
 * Acuity — App Root Component
 *
 * Wraps the application in BrowserRouter and AuthProvider.
 * Renders the centralized route configuration.
 */

import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import AppRoutes from '@/routes/AppRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
