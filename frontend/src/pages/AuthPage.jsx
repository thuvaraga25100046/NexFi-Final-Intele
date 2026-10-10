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

function InputWithIcon({ icon: Icon, type, name, placeholder, value, onChange, ...rest }) {
  return (
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 text-slate-100 placeholder-slate-400 shadow-sm transition-colors focus:outline-none focus:border-indigo-500/80"
        placeholder={placeholder}
        {...rest}
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
        <Icon className="size-4" />
      </div>
    </div>
  )
}

function PasswordStrengthIndicator({ password }) {
  const strength = password.length
  const colors = ['rose', 'orange', 'amber', 'emerald', 'emerald']
  const labels = ['Too short', 'Weak', 'Medium', 'Strong', 'Strong']
  
  if (strength === 0) return null
  
  const level = Math.min(strength - 1, 4)
  
  return (
    <div className="mt-1 flex items-center gap-2 text-xs">
      <span className="text-slate-400">Password strength: </span>
      <span className={`text-${colors[level]}-500 font-medium}`>{labels[level]}</span>
    </div>
  )
}

function AuthPage() {
  const { t } = useTranslation()
  const { login, register, toggleDemoMode } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    username: '',
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
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

    const { email, password, fullName, username } = formData
    let validationErrors = {}

    // Email format validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) {
      validationErrors.email = t('auth.emailRequired')
    } else if (!emailPattern.test(email)) {
      validationErrors.email = t('auth.emailInvalid')
    }

    if (!password) {
      validationErrors.password = t('auth.passwordRequired')
    } else if (password.length < 6) {
      validationErrors.password = t('auth.passwordMinLength')
    }

    if (isLogin) {
      // Login validation
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }

      setIsSubmitting(true)
      const result = login(email, password)
      setIsSubmitting(false)

      if (result.success) {
        if (localStorage.getItem('nexfi.remember-me') === 'true') {
          localStorage.setItem('nexfi.remember-me', 'true')
        } else {
          localStorage.removeItem('nexfi.remember-me')
        }
        window.location.href = '/dashboard'
      } else {
        setErrors((prev) => ({ ...prev, general: result.error || t('auth.loginFailed') }))
      }
    } else {
      // Sign up validation
      if (!fullName.trim()) {
        validationErrors.fullName = t('auth.fullNameRequired')
      }
      if (!username.trim()) {
        validationErrors.username = t('auth.usernameRequired')
      }
      if (!email.trim()) {
        validationErrors.email = t('auth.emailRequired')
      } else if (!emailPattern.test(email)) {
        validationErrors.email = t('auth.emailInvalid')
      }
      if (!password || password.length < 6) {
        validationErrors.password = t('auth.passwordMinLength')
      }
      if (password !== formData.confirmPassword) {
        validationErrors.confirmPassword = t('auth.passwordsDoNotMatch')
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }

      setIsSubmitting(true)
      const result = register(fullName, email, password)
      setIsSubmitting(false)

      if (result.success) {
        window.location.href = '/dashboard'
      } else {
        setErrors((prev) => ({ ...prev, general: result.error || t('auth.registrationFailed') }))
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-md w-full mx-auto px-4 py-8">
        {/* Toggle Switch */}
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <button
              onClick={() => setIsLogin(true)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                isLogin ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'
              } ${!isLogin ? 'mb-0' : 'mb-3'}`}
            >
              {t('auth.signIn')}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                !isLogin ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'
              } ${isLogin ? 'mb-3' : 'mb-0'}`}
            >
              {t('auth.signUp')}
            </button>
          </div>
          <p className="text-slate-500 text-sm mt-2">
            {isLogin ? t('auth.welcomeBack') : t('auth.createYourAccount')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isLogin ? (
            <div>
              {/* Email */}
              <InputWithIcon
                icon={Mail}
                type="email"
                name="email"
                placeholder={t('auth.emailPlaceholder')}
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-400">{errors.email}</p>
              )}

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
                  <PasswordStrengthIndicator password={formData.password} />
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-rose-400">{errors.password}</p>
                )}
              </div>
            </div>
          ) : (
            <div>
              {/* Full Name */}
              <InputWithIcon
                icon={User}
                type="text"
                name="fullName"
                placeholder={t('auth.fullNamePlaceholder')}
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-rose-400">{errors.fullName}</p>
              )}

              {/* Username */}
              <InputWithIcon
                icon={AtSign}
                type="text"
                name="username"
                placeholder={t('auth.usernamePlaceholder')}
                value={formData.username}
                onChange={handleChange}
                required
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
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-400">{errors.email}</p>
              )}

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
                  <PasswordStrengthIndicator password={formData.password} />
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-rose-400">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                  {t('auth.confirmPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 text-slate-100 placeholder-slate-400 transition-colors focus-visible:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500/50"
                    placeholder={t('auth.confirmPasswordPlaceholder')}
                  />
                  <PasswordToggle
                    showPassword={showConfirmPassword}
                    setShowPassword={setShowConfirmPassword}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-400">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
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
                {t('auth.signingIn')}
              </span>
            ) : (
              <span>{t(isLogin ? 'auth.signIn' : 'auth.signUp')}</span>
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

export default AuthPage