import { useState } from 'react'
import {
  ArrowDownLeft,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Mail,
  Lock,
  MailError,
  LockError,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import { useTranslation } from '../i18n/useTranslation.js'
import { useAuth } from '../context/AuthContext.jsx'
import { Link } from 'react-router-dom'

function PasswordToggle({ isPassword, setIsPassword, iconEye, iconEyeOff }) {
  return (
    <div className="relative">
      <input
        type={isPassword ? "password" : "text"}
        id="password"
        name="password"
        autoComplete="current-password"
        required
        className="w-full pl-10 pr-12 py-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 font-slate text-slate-900 dark:text-slate-100 shadow-sm transition-colors focus-outline focus:border-indigo-500/50"
      />
      <button
        onClick={() => setIsPassword(!isPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        aria-label={isPassword ? 'Show password' : 'Hide password'}
      >
        {isPassword ? <iconEyeOff size={16} /> : <iconEye size={16} />}
      </button>
    </div>
  )
}

function SignInPage() {
  const { t, language } = useTranslation()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [errors, setErrors] = useState({})
  const { login, logout, isLoggedIn, toggleDemoMode } = useAuth()
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

    // Validation
    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: t('auth.emailRequired') }))
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: t('auth.passwordRequired') }))
    }

    // If there are validation errors, stop here
    const hasErrors = Object.values(errors).some((e) => e)
    if (hasErrors || isSubmitting) return

    setIsSubmitting(true)
    const result = login(email, password)

    setIsSubmitting(false)

    if (result.success) {
      // Remember me handling
      if (rememberMe) {
        localStorage.setItem('nexfi.remember-me', 'true')
      } else {
        localStorage.removeItem('nexfi.remember-me')
      }
      // Navigate to dashboard
      window.location.href = '/dashboard'
    } else {
      setErrors((prev) => ({ ...prev, general: result.error || t('auth.loginFailed') }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900/90 to-slate-950">
      <div class="max-w-md mx-auto px-4 py-8">
        {/* Header with toggle text */}
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
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 dark:text-slate-100 placeholder-slate-400 transition-colors focus-outline"
              placeholder={t('auth.emailPlaceholder')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-emerald-400">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              {t('auth.password')}
            </label>
            <PasswordToggle
              isPassword={formData.password?.length > 0 ? true : false}
              setIsPassword={setIsPassword}
              iconEye={Lock}
              iconEyeOff={LockError}
            />
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 dark:text-slate-100 placeholder-slate-400 transition-colors focus-outline"
              placeholder={t('auth.passwordPlaceholder')}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-emerald-400">{errors.password}</p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={(e) => setFormData((prev) => ({ ...prev, rememberMe: e.target checked }))}
              className="w-4 h-4 rounded border-slate-600/50 cursor-pointer focus-outline"
            />
            <label htmlFor="rememberMe" className="text-sm text-slate-300 cursor-pointer">
              {t('auth.rememberMe')}
            </label>
          </div>
          {errors.general && (
            <p className="mt-2 text-xs text-emerald-400">{errors.general}</p>
          )}

          {/* Forgot Password link */}
          <div className="text-right mt-2">
            <a
              href="#"
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors underline"
            >
              {t('auth.forgotPassword')}
            </a>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
              isSubmitting
                ? 'bg-slate-600/50 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin inline-block mr-2 size-4 border-2 border-white border-t-transparent"></span>
                {t('auth.signingIn')}
              </span>
            ) : (
              <span>{t('auth.signIn')}</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-6 flex items-center gap-4">
          <span className="flex-1 h-px bg-slate-600/50"></span>
          <span className="text-sm text-slate-500">Or continue with</span>
          <span className="flex-1 h-px bg-slate-600/50"></span>
        </div>

        {/* Social login buttons */}
        <div className="mt-4 flex gap-2">
          <button
            className="flex-1 py-2 px-4 rounded-xl bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 transition-colors text-sm justify-center"
          >
            <svg className="size-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Google
          </button>
          <button
            className="flex-1 py-2 px-4 rounded-xl bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 transition-colors text-sm justify-center"
          >
            <svg className="size-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            GitHub
          </button>
        </div>

        {/* Demo mode toggle */}
        {showDemoToggle && (
          <div className="mt-6 p-4 rounded-xl bg-indigo-600/20 border border-indigo-600/30 text-center">
            <p className="text-sm text-indigo-300">
              <strong>{t('dashboard.demoActive')}</strong> {t('dashboard.demoDescription')}
            </p>
            <button
              onClick={() => {
                toggleDemoMode(false)
                setShowDemoToggle(false)
              }}
              className="mt-2 text-xs text-indigo-300 hover:text-indigo-200 transition-colors"
            >
              {t('auth.exitDemo')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SignInPage