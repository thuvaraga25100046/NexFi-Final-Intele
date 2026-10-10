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
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { Link, useNavigate } from 'react-router-dom'

function PasswordToggle({ showPassword, setShowPassword }) {
  return (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
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
        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/85 border border-slate-700/60 text-slate-100 placeholder-slate-500 shadow-sm transition-all focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        placeholder={placeholder}
        {...rest}
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        <Icon size={18} />
      </div>
    </div>
  )
}

function PasswordStrengthIndicator({ password }) {
  const strength = password.length
  const colors = ['bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-500']
  const textColors = ['text-rose-400', 'text-orange-400', 'text-amber-400', 'text-emerald-400', 'text-emerald-400']
  const labels = ['Too short', 'Weak', 'Medium', 'Strong', 'Very Strong']
  
  if (strength === 0) return null
  
  const level = Math.min(strength - 1, 4)
  
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-full transition-all duration-300 ${i <= level ? colors[level] : 'bg-transparent'}`}
            style={{ width: '20%' }}
          />
        ))}
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400">Password strength:</span>
        <span className={`font-medium ${textColors[level]}`}>{labels[level]}</span>
      </div>
    </div>
  )
}

export default function AuthPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    username: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) {
      validationErrors.email = 'Email address is required'
    } else if (!emailPattern.test(email)) {
      validationErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      validationErrors.password = 'Password is required'
    } else if (password.length < 6) {
      validationErrors.password = 'Password must be at least 6 characters'
    }

    if (isLogin) {
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }

      setIsSubmitting(true)
      const result = login(email, password)
      setIsSubmitting(false)

      if (result.success) {
        navigate('/dashboard')
      } else {
        setErrors((prev) => ({ ...prev, general: result.error || 'Invalid email or password' }))
      }
    } else {
      if (!fullName.trim()) validationErrors.fullName = 'Full name is required'
      if (!username.trim()) validationErrors.username = 'Username is required'
      if (password !== formData.confirmPassword) {
        validationErrors.confirmPassword = 'Passwords do not match'
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }

      setIsSubmitting(true)
      const result = register(fullName, email, password)
      setIsSubmitting(false)

      if (result.success) {
        navigate('/dashboard')
      } else {
        setErrors((prev) => ({ ...prev, general: result.error || 'Registration failed. Try again.' }))
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-white tracking-tight mb-2">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
              <ShieldCheck size={20} />
            </span>
            NexFi
          </Link>
          <p className="text-slate-400 text-sm">
            {isLogin ? 'Welcome back! Please enter your details.' : 'Create an account to start tracking finances.'}
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl">
          {/* Toggle Switch Tabs */}
          <div className="grid grid-cols-2 gap-1 bg-slate-950/70 p-1 rounded-xl mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setErrors({}); }}
              className={`py-2.5 text-sm font-medium rounded-lg transition-all ${
                isLogin ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setErrors({}); }}
              className={`py-2.5 text-sm font-medium rounded-lg transition-all ${
                !isLogin ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center">
                {errors.general}
              </div>
            )}

            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                  <InputWithIcon
                    icon={User}
                    type="text"
                    name="fullName"
                    placeholder="Alex Morgan"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                  {errors.fullName && <p className="mt-1 text-xs text-rose-400">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Username</label>
                  <InputWithIcon
                    icon={AtSign}
                    type="text"
                    name="username"
                    placeholder="alexmorgan"
                    value={formData.username}
                    onChange={handleChange}
                  />
                  {errors.username && <p className="mt-1 text-xs text-rose-400">{errors.username}</p>}
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
              <InputWithIcon
                icon={Mail}
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-900/85 border border-slate-700/60 text-slate-100 placeholder-slate-500 shadow-sm transition-all focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="At least 6 characters"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Lock size={18} />
                </div>
                <PasswordToggle showPassword={showPassword} setShowPassword={setShowPassword} />
              </div>
              <PasswordStrengthIndicator password={formData.password} />
              {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword || ''}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-900/85 border border-slate-700/60 text-slate-100 placeholder-slate-500 shadow-sm transition-all focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Confirm your password"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Lock size={18} />
                  </div>
                  <PasswordToggle showPassword={showConfirmPassword} setShowPassword={setShowConfirmPassword} />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-rose-400">{errors.confirmPassword}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Processing...
                </span>
              ) : (
                <>
                  <span>{isLogin ? 'Log In' : 'Create Account'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            ← Back to NexFi Home
          </Link>
        </div>
      </div>
    </div>
  )
}