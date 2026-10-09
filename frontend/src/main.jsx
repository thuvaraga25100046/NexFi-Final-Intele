import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import AiAssistantPage from './pages/AiAssistantPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import LandingPage from './LandingPage.jsx'
import PayablesPage from './pages/PayablesPage.jsx'
import ReceivablesPage from './pages/ReceivablesPage.jsx'
import SignInPage from './pages/SignInPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import TransactionsPage from './pages/TransactionsPage.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './landing.css'
import './workspace.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/welcome" element={<LandingPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
            <Route path="/transactions" element={<AppLayout><TransactionsPage /></AppLayout>} />
            <Route path="/receivables" element={<AppLayout><ReceivablesPage /></AppLayout>} />
            <Route path="/payables" element={<AppLayout><PayablesPage /></AppLayout>} />
            <Route path="/ai-assistant" element={<AppLayout><AiAssistantPage /></AppLayout>} />
            <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  </StrictMode>,
)