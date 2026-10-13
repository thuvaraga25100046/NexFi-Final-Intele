import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import useTranslation from '../i18n/useTranslation.js'
import { useAuth } from '../context/AuthContext.jsx'
import AuthShell from '../components/AuthShell.jsx'

const inputClass =
    'w-full rounded-xl border border-slate-700/60 bg-slate-900/85 py-3 pl-10 pr-4 text-slate-100 placeholder-slate-500 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

function SignInPage() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    const { email, password, rememberMe } = formData
    const validationErrors = {}

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
      <AuthShell activeTab="signin" subtitle={t('auth.welcomeBack')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-center text-sm text-rose-400">
                {errors.general}
              </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="credential" className="mb-1.5 block text-xs font-medium text-slate-300">
              {t('auth.email')}
            </label>
            <div className="relative">
              <input
                  type="email"
                  id="credential"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder={t('auth.emailPlaceholder')}
              />
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <Mail className="size-4" />
              </div>
            </div>
            {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-300">
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
                  className={`${inputClass} pr-12`}
                  placeholder={t('auth.passwordPlaceholder')}
              />
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock className="size-4" />
              </div>
              <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password}</p>}
          </div>

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between">
            <label htmlFor="rememberMe" className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
              <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData((prev) => ({ ...prev, rememberMe: e.target.checked }))}
                  className="h-4 w-4 cursor-pointer rounded border-slate-600/50 accent-indigo-500"
              />
              {t('auth.rememberMe')}
            </label>
            <a href="#" className="text-xs text-indigo-400! transition-colors hover:text-indigo-300!">
              {t('auth.forgotPassword')}
            </a>
          </div>

          {/* Submit */}
          <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? t('auth.signingIn') : t('auth.signIn')}
            {!isSubmitting && <ArrowRight size={16} />}
          </button>
        </form>
      </AuthShell>
  )
}

export default SignInPage
