import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import TransactionsPage from './pages/TransactionsPage.jsx'
import PayablesPage from './pages/PayablesPage.jsx'
import ReceivablesPage from './pages/ReceivablesPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import AiCopilotPage from './pages/AiCopilotPage.jsx'
import './index.css'

function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <SiteHeader variant="application" />
      <main className="flex-1 px-4 sm:px-8 py-6">
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/payables" element={<PayablesPage />} />
          <Route path="/receivables" element={<ReceivablesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/ai-assistant" element={<AiCopilotPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function MainRoot() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MainRoot />
  </React.StrictMode>
)