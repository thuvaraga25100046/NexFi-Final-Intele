import { useState } from 'react'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Users,
  Globe,
  ShieldCheck,
} from 'lucide-react'
import { useTranslation } from '../i18n/useTranslation.js'
import { useAuth } from '../context/AuthContext.jsx'
import { Link } from 'react-router-dom'

function PasswordToggle({ showPassword, setShowPassword, iconEye, iconEyeOff }) {
  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        id="password"
        name="password"
        autoComplete="current-password"
        required
        className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 dark:text-slate-100 shadow-sm transition-colors focus-outline focus:border-indigo-500/50"
      />
      <button
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <iconEyeOff size={18} /> : <iconEye size={18} />}
      </button>
    </div>
  )
}

function InputWithIcon({ icon, type, name, placeholder, ...rest }) {
  return (
    <div className="relative">
      <input
        type={type}
        name={name}
        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 dark:text-slate-100 shadow-sm transition-colors focus-outline focus:border-indigo-500/50"
        placeholder={placeholder}
        {...rest}
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
        <icon className="size-4" />
      </div>
    </div>
  )
}

function SignUpPage() {
  const { t, language } = useTranslation()
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { register } = useAuth()
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

    const { fullName, username, email, password, confirmPassword } = formData

    // Validation
    if (!fullName.trim()) {
      setErrors((prev) => ({ ...prev, fullName: t('auth.fullNameRequired') }))
    }
    if (!username.trim()) {
      setErrors((prev) => ({ ...prev, username: t('auth.usernameRequired') }))
    }
    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: t('auth.emailRequired') }))
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: t('auth.passwordRequired') }))
    } else if (password.length < 6) {
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
    <div className="min-h-screen bg-gray-950">
      <div class="max-w-md w-full mx-auto px-4 py-8">
        {/* Header with gradient background */}
        <div className="text-center mb-8">
          <div className="relative">
            <div
              className="absolute -inset-1/2 bg-indigo-500/20 -z-10 rounded-2xl opacity-75 blur-lg"
            />
            <h2 className="text-2xl font-bold text-slate-100 mb-2">
              {t('auth.signUp')}
            </h2>
            <p className="text-slate-400 text-sm">
              {t('auth.createYourAccount')}
            </p>
          </div>
          {showSuccess && (
            <div className="mt-4 rounded-xl bg-emerald-600/20 text-emerald-400 text-sm p-3">
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
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <InputWithIcon
            icon={Users}
            type="text"
            name="fullName"
            placeholder={t('auth.fullNamePlaceholder')}
            required
            onChange={handleChange}
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-rose-400">{errors.fullName}</p>
          )}

          {/* Username */}
          <InputWithIcon
            icon={Users}
            type="text"
            name="username"
            placeholder={t('auth.usernamePlaceholder')}
            required
            onChange={handleChange}
          />
          {errors.username && (
            <p className="mt-1 text-xs text-rose-400">{errors.username}</p>
          )}

          {/* Email */}
          <InputWithIcon
            icon={Mail}
            type="email"
            name="email"
            placeholder={t('auth.emailPlaceholder')}
            required
            onChange={handleChange}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-rose-400">{errors.email}</p>
          )}

          {/* Password */}
          <div className="relative">
            <InputWithIcon
              icon={Lock}
              type="password"
              name="password"
              placeholder={t('auth.passwordPlaceholder')}
              required
              onChange={handleChange}
            />
            <PasswordToggle
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              iconEye={Lock}
              iconEyeOff={EyeOff}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-rose-400">{errors.password}</p>
          )}

          {/* Confirm Password */}
          <div className="relative">
            <InputWithIcon
              icon={Lock}
              type="password"
              name="confirmPassword"
              placeholder={t('auth.confirmPasswordPlaceholder')}
              required
              onChange={handleChange}
            />
            <PasswordToggle
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              iconEye={Lock}
              iconEyeOff={EyeOff}
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-rose-400">{errors.confirmPassword}</p>
          )}

          {/* General errors */}
          {errors.general && (
            <p className="mt-2 text-xs text-rose-400">{errors.general}</p>
          )}

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
                {t('auth.signingUp')}
              </span>
            ) : (
              <span>{t('auth.signUp')}</span>
            )}
          </button>
        </form>

        {/* Divider & Social Login */}
        <div className="mt-6 pt-6 border-t border-slate-800/50 text-center">
          <span className="text-slate-500 text-xs opacity-60">Or continue with</span>
          <div className="flex gap-3 mt-3">
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
    </div>
  )
}

export default SignUpPage