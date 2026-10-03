import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import LandingPage from './LandingPage.jsx'
import PayablesPage from './pages/PayablesPage.jsx'
import ReceivablesPage from './pages/ReceivablesPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import TransactionsPage from './pages/TransactionsPage.jsx'
import './landing.css'
import './workspace.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
        <Route path="/transactions" element={<AppLayout><TransactionsPage /></AppLayout>} />
        <Route path="/receivables" element={<AppLayout><ReceivablesPage /></AppLayout>} />
        <Route path="/payables" element={<AppLayout><PayablesPage /></AppLayout>} />
        <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
