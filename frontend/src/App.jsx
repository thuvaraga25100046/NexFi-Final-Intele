import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import SignInPage from './pages/SignInPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Default Route -> Navigate to SignIn */}
        <Route path="/" element={<Navigate to="/signin" replace />} />
        
        {/* Auth Routes */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Catch-all Route for unknown URLs */}
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App