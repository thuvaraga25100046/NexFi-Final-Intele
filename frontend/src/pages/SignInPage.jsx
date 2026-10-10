import { useState } from 'react'
import {
  User,
  AtSign,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Globe,
  ShieldCheck,
} from 'lucide-react'
import useTranslation from '../i18n/useTranslation.js'
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
    let validationErrors = {}

    if (!email.trim()) {
      validationErrors.email = t('auth.emailRequired')
    }
    if (!password) {
      validationErrors.password = t('auth.passwordRequired')
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

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
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-md w-full mx-auto px-4 py-8">
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email or Username */}
          <div>
            <label htmlFor="credential" className="block text-sm font-medium text-slate-300 mb-2">
              {t('auth.email')}
            </label>
            <input
              type="email"
              id="credential"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 text-slate-100 placeholder-slate-400 transition-colors focus-visible:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500/50"
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
                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 text-slate-100 placeholder-slate-400 transition-colors focus-visible:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500/50"
                placeholder={t('auth.passwordPlaceholder')}
              />
              <PasswordToggle
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-rose-400">{errors.password}</p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, rememberMe: e.target.checked }))
              }
              className="w-4 h-4 rounded border-slate-600/50 cursor-pointer"
            />
            <label htmlFor="rememberMe" className="text-sm text-slate-300 cursor-pointer">
              {t('auth.rememberMe')}
            </label>
          </div>
          {errors.general && (
            <p className="mt-2 text-xs text-rose-400">{errors.general}</p>
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
              isSubmitting ? 'bg-slate-600/50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin inline-block mr-2 size-4 border-2 border-white border-t-transparent rounded-full"></span>
                {t('auth.signingIn')}
              </span>
            ) : (
              <span>{t('auth.signIn')}</span>
            )}
          </button>
        </form>

        {/* Or continue with */}
        <div className="mt-6 flex items-center gap-4">
          <span className="flex-1 h-px bg-slate-600/50"></span>
          <span className="text-sm text-slate-500">Or continue with</span>
          <span className="flex-1 h-px bg-slate-600/50"></span>
        </div>

        {/* Social login buttons */}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className="flex-1 py-2 px-4 rounded-xl bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 transition-colors text-sm flex items-center justify-center"
          >
            <Globe size={16} className="mr-2" />
            Google
          </button>
          <button
            type="button"
            className="flex-1 py-2 px-4 rounded-xl bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 transition-colors text-sm flex items-center justify-center"
          >
            <ShieldCheck size={16} className="mr-2" />
            GitHub
          </button>
        </div>
      </div>
    </div>
  )
}

export default SignInPage