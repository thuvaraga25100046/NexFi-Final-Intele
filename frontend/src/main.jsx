import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import AiAssistantPage from './pages/AiAssistantPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import LandingPage from './LandingPage.jsx'
import PayablesPage from './pages/PayablesPage.jsx'
import ReceivablesPage from './pages/ReceivablesPage.jsx'
import TransactionsPage from './pages/TransactionsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'
import AuthPage from './pages/AuthPage.jsx'
import './landing.css'
import './workspace.css'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/welcome" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/signin" element={<Navigate to="/auth" replace />} />
              <Route path="/signup" element={<Navigate to="/auth" replace />} />
              {/* Protected routes - require authentication */}
              <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
              <Route path="/transactions" element={<PrivateRoute><AppLayout><TransactionsPage /></AppLayout></PrivateRoute>} />
              <Route path="/receivables" element={<PrivateRoute><AppLayout><ReceivablesPage /></AppLayout></PrivateRoute>} />
              <Route path="/payables" element={<PrivateRoute><AppLayout><PayablesPage /></AppLayout></PrivateRoute>} />
              <Route path="/ai-assistant" element={<PrivateRoute><AppLayout><AiAssistantPage /></AppLayout></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><AppLayout><SettingsPage /></AppLayout></PrivateRoute>} />
              {/* Public routes */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  </StrictMode>,
)