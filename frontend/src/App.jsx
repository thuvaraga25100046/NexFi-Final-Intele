import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import AuthPage from './pages/AuthPage.jsx'

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Default Route -> Navigate to Auth */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
        
        {/* Auth Routes */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Catch-all Route for unknown URLs */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App