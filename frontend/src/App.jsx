/**
 * Acuity — App Root Component
 *
 * Wraps the application in BrowserRouter and AuthProvider.
 * Renders the centralized route configuration.
 */

import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import AppRoutes from '@/routes/AppRoutes'
import ToastContainer from '@/components/ui/ToastContainer'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

export default function App() {
  useScrollAnimation()

  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <AppRoutes />
          <ToastContainer />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  )
}
