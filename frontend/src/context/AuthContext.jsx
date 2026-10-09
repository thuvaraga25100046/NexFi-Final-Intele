import { createContext, useContext, useState, useEffect } from 'react'

// Auth context for managing user authentication state
const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  // Check localStorage for existing user or demo mode
  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('nexfi.user') : null
  const storedDemo = typeof window !== 'undefined' ? localStorage.getItem('nexfi.demo-mode') : null

  const [user, setUser] = useState(() => {
    if (storedUser) {
      return JSON.parse(storedUser)
    }
    return null
  })

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (storedDemo === 'true' && storedUser) {
      return true
    }
    return !!storedUser
  })

  const [rememberMe, setRememberMe] = useState(false)

  // Login user
  const login = (email, password) => {
    // In a real app, this would call an API
    // For demo, we validate and store user
    const demoUsers = [
      { email: 'demo@nexfi.com', password: 'demo123', name: 'Demo User' }
    ]

    const user = demoUsers.find(
      u => u.email === email && u.password === password
    )

    if (user) {
      const userData = { id: 1, email: user.email, name: user.name }
      setUser(userData)
      setIsLoggedIn(true)
      localStorage.setItem('nexfi.user', JSON.stringify(userData))
      if (rememberMe) {
        localStorage.setItem('nexfi.remember-me', 'true')
      }
      return { success: true }
    } else {
      return { success: false, error: 'Invalid email or password' }
    }
  }

  // Register user
  const register = (fullName, email, password) => {
    // Validate
    if (!fullName || !email || !password) {
      return { success: false, error: 'All fields are required' }
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' }
    }

    // Check if user already exists
    const existingUser = localStorage.getItem('nexfi.user')
    if (existingUser) {
      return { success: false, error: 'Account already exists. Please sign in.' }
    }

    // Create user
    const userData = {
      id: Date.now(),
      email: email,
      name: fullName,
      password: password // In real app, hash password
    }

    setUser(userData)
    setIsLoggedIn(true)
    localStorage.setItem('nexfi.user', JSON.stringify(userData))
    localStorage.removeItem('nexfi.demo-mode')

    return { success: true }
  }

  // Logout user
  const logout = () => {
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem('nexfi.user')
    localStorage.removeItem('nexfi.demo-mode')
    localStorage.removeItem('nexfi.remember-me')
  }

  // Toggle demo mode
  const toggleDemoMode = (enabled) => {
    setIsLoggedIn(enabled)
    if (enabled) {
      localStorage.setItem('nexfi.demo-mode', 'true')
    } else {
      localStorage.removeItem('nexfi.demo-mode')
    }
  }

  useEffect(() => {
    // Sync rememberMe state
    const storedRemember = typeof window !== 'undefined' ? localStorage.getItem('nexfi.remember-me') : null
    setRememberMe(storedRemember === 'true')
  }, [])

  return (
    <AuthContext.Provider>
      {children}
    </AuthContext.Provider>
  )
}