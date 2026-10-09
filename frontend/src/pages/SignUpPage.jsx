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
} from 'lucide-react'
import { useTranslation } from '../i18n/useTranslation.js'
import { formatCurrency } from '../i18n/formatters.js'
import { useAuth } from '../context/AuthContext.jsx'
import { Link } from 'react-router-dom'

function PasswordToggle({ isPassword, setIsPassword, iconEye, iconEyeOff }) {
  return (
    <div className="relative">
      <input
        type isPassword ? "password" : "text"
        id="password"
        name="password"
        autoComplete="current-password"
        required
        className="w-full pl-10 pr-12 py-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 font-slate text-slate-900 dark:text-slate-100 shadow-sm transition-colors focus outline-none focus:border-indigo-500/50"
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

function SignUpPage() {
  const { t, language } = useTranslation()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [showSuccess, setShowSuccess] = useState(false)
  const { login, register } = useAuth()
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

    const { fullName, email, password, confirmPassword } = formData

    // Validation
    if (!fullName.trim()) {
      setErrors((prev) => ({ ...prev, fullName: t('auth.fullNameRequired') }))
    }
    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: t('auth.emailRequired') }))
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: t('auth.passwordRequired') }))
    }
    if (password && password.length < 6) {
      setErrors((prev) => ({ ...prev, password: t('auth.passwordMinLength') }))
    }
    if (password !== confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: t('auth.passwordsDoNotMatch') }))
    }

    // If there are validation errors, stop here
    const hasErrors = Object.values(errors).some((e) => e)
    if (hasErrors || isSubmitting) return

    setIsSubmitting(true)
    const result = register(fullName, email, password)

    setIsSubmitting(false)

    if (result.success) {
      setShowSuccess(true)
      // Redirect after a short delay
      setTimeout(() => {
        window.dispatchEvent(new Event('nexfi:resource-changed'))
      }, 1500)
    } else {
      setErrors((prev) => ({ ...prev, general: result.error || t('auth.registrationFailed') }))
    }
  }

  // Clear success state after navigating
  useEffect(() => {
    if (showSuccess) {
      const timeout = setTimeout(() => setShowSuccess(false), 3000)
      return () => clearTimeout(timeout)
    }
  }, [showSuccess])

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900/90 to-slate-950">
      <div class="max-w-md mx-auto px-4 py-8">
        {/* Header with toggle text */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-100 mb-2">
            {t('auth.signUp')}
          </h2>
          <p className="text-slate-400 text-sm">
            {t('auth.createYourAccount')}
          </p>
          {showSuccess && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-600/20 text-emerald-400 text-sm">
              {t('auth.registrationSuccess')}
            </div>
          )}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-slate-500 text-sm">
              Already have an account?{' '}
              <Link
                to="/signin"
                className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {t('auth.signIn')}
              </Link>
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
              {t('auth.fullName')}
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 dark:text-slate-100 placeholder-slate-400 transition-colors focus-outline"
              placeholder={t('auth.fullNamePlaceholder')}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-emerald-400">{errors.fullName}</p>
            )}
          </div>

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
              disabled={false}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-emerald-400">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
              {t('auth.confirmPassword')}
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 dark:text-slate-100 placeholder-slate-400 transition-colors focus-outline"
              placeholder={t('auth.confirmPasswordPlaceholder')}
              disabled={false}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-emerald-400">{errors.confirmPassword}</p>
            )}
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
                {t('auth.signingUp')}
              </span>
            ) : (
              <span>{t('auth.signUp')}</span>
            )}
          </button>
        </form>

        {/* Social login or divider */}
        <div className="mt-6 text-center">
          <span className="text-slate-500 text-xs opacity-60">Or continue with</span>
          <div className="flex gap-3 mt-3">
            <button
              className="flex-1 py-2 px-4 rounded-xl bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 transition-colors text-sm"
            >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              className="flex-1 py-2 px-4 rounded-xl bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 transition-colors text-sm"
            >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage