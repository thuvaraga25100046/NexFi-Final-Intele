import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import PageTransition from './components/PageTransition.jsx'
import DoodleBackground from './components/DoodleBackground.jsx'
import LandingPage from './pages/LandingPage.jsx'
import SignInPage from './pages/SignInPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import TransactionsPage from './pages/TransactionsPage.jsx'
import PayablesPage from './pages/PayablesPage.jsx'
import ReceivablesPage from './pages/ReceivablesPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import AiCopilotPage from './pages/AiCopilotPage.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'
import './landing.css'

const GOOGLE_CLIENT_ID =
    '568682537314-b4qo6kbm0omturara95po5pr0q5uq2th.apps.googleusercontent.com'

function AppLayout() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
            <DoodleBackground />
            <SiteHeader variant="application" />
            <main className="relative z-10 flex-1 px-4 sm:px-8 py-6">
                <PageTransition>
                    <Routes>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/transactions" element={<TransactionsPage />} />
                        <Route path="/payables" element={<PayablesPage />} />
                        <Route path="/receivables" element={<ReceivablesPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/ai-assistant" element={<AiCopilotPage />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </PageTransition>
            </main>
        </div>
    )
}

function MainRoot() {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <BrowserRouter>
                <LanguageProvider>
                    <AuthProvider>
                        <ErrorBoundary>
                            <Routes>
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/signin" element={<SignInPage />} />
                                <Route path="/signup" element={<SignUpPage />} />
                                <Route path="/auth" element={<AuthPage />} />
                                <Route
                                    path="/*"
                                    element={
                                        <PrivateRoute>
                                            <AppLayout />
                                        </PrivateRoute>
                                    }
                                />
                            </Routes>
                        </ErrorBoundary>
                    </AuthProvider>
                </LanguageProvider>
            </BrowserRouter>
        </GoogleOAuthProvider>
    )
}

// Apply the saved display theme before the first render (dark is the default)
try {
    const savedTheme = localStorage.getItem('nexfi_dashboard_theme') || 'dark'
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
} catch {
    document.documentElement.classList.add('dark')
}

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <MainRoot />
    </React.StrictMode>
)