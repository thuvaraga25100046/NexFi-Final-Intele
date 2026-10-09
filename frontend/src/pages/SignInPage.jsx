import { useState } from 'react'
import {
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useTranslation } from '../i18n/useTranslation.js'
import { useAuth } from '../context/AuthContext.jsx'
import { Link } from 'react-router-dom'

function PasswordToggle({ showPassword, setShowPassword }) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}

function SignInPage() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const { login, toggleDemoMode } = useAuth()
  const [showDemoToggle, setShowDemoToggle] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    const { email, password, rememberMe } = formData

    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: t('auth.emailRequired') }))
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: t('auth.passwordRequired') }))
    }

    const hasErrors = Object.values(errors).some((e) => e)
    if (hasErrors || isSubmitting) return

    setIsSubmitting(true)
    const result = login(email, password)
    setIsSubmitting(false)

    if (result.success) {
      if (rememberMe) {
        localStorage.setItem('nexfi.remember-me', 'true')
      } else {
        localStorage.removeItem('nexfi.remember-me')
      }
      window.location.href = '/dashboard'
    } else {
      setErrors((prev) => ({ ...prev, general: result.error || t('auth.loginFailed') }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900/90 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-100 mb-2">
            {t('auth.signIn')}
          </h2>
          <p className="text-slate-400 text-sm">
            {t('auth.welcomeBack')}
          </p>
          {showDemoToggle && (
            <p className="mt-2 text-sm text-slate-500">
              {t('dashboard.demoActive')}
            </p>
          )}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-slate-500 text-sm">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {t('auth.signUp')}
              </Link>
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              {t('auth.email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 text-slate-100 placeholder-slate-400 transition-colors focus-visible:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500/50outline-none focus:border-indigo-500"
              placeholder={t('auth.emailPlaceholder')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-400">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              {t('auth.password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 text-slate-100 placeholder-slate-400 transition-colors focus-visible:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500/50