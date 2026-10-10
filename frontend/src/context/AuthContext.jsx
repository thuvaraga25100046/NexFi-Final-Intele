import { createContext, useContext, useState, useEffect } from 'react'

// Auth context for managing user authentication state
const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  // Check localStorage for existing user or demo mode
  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('nexfi.user') : null
  const storedDemo = typeof window !== 'undefined' ? localStorage.getItem('nexfi.demo-mode') : null
  const storedRemember = typeof window !== 'undefined' ? localStorage.getItem('nexfi.remember-me') : null

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

  const [rememberMe, setRememberMe] = useState(() => storedRemember === 'true')

  // Hash password (simulated - in real app use bcrypt)
  const hashPassword = (password) => {
    // In a real application, use a proper password hashing library like bcrypt
    // This is a simple simulation for demo purposes
    return btoa(password)
  }

  // Verify hashed password
  const verifyPassword = (storedHash, providedPassword) => {
    return hashPassword(providedPassword) === storedHash
  }

  // Login user
  const login = (email, password) => {
    // Check rememberMe state
    if (rememberMe) {
      localStorage.setItem('nexfi.remember-me', 'true')
    } else {
      localStorage.removeItem('nexfi.remember-me')
    }

    // Get all stored users from localStorage
    const storedUsersStr = localStorage.getItem('nexfi.users')
    let users = []
    if (storedUsersStr) {
      try {
        users = JSON.parse(storedUsersStr)
      } catch (e) {
        users = []
      }
    }

    // Also check demo user if no registered users exist
    const foundDemoUser = users.find(
      u => u.email === email && verifyPassword(u.passwordHash, password)
    )

    if (hardcodedDemoUser) {
      const userData = { id: hardcodedDemoUser.id, email: hardcodedDemoUser.email, name: hardcodedDemoUser.name }
      setUser(userData)
      setIsLoggedIn(true)
      localStorage.setItem('nexfi.user', JSON.stringify(userData))
      return { success: true }
    }

    // Check if there are any registered users
    if (users.length > 0) {
      const user = users.find(
        u => u.email === email && verifyPassword(u.passwordHash, password)
      )

      if (user) {
        const userData = { id: user.id, email: user.email, name: user.name }
        setUser(userData)
        setIsLoggedIn(true)
        localStorage.setItem('nexfi.user', JSON.stringify(userData))
        return { success: true }
      }
    }

    // Fallback: check hardcoded demo user for backward compatibility
    const hardcodedDemoUsers = [
      { email: 'demo@nexfi.com', password: 'demo123', name: 'Demo User', id: 1 }
    ]
    const hardcodedDemoUser = hardcodedDemoUsers.find(
      u => u.email === email && u.password === password
    )

    if (hardcodedDemoUser) {
      const userData = { id: hardcodedDemoUser.id, email: hardcodedDemoUser.email, name: hardcodedDemoUser.name }
      setUser(userData)
      setIsLoggedIn(true)
      localStorage.setItem('nexfi.user', JSON.stringify(userData))
      if (rememberMe) {
        localStorage.setItem('nexfi.remember-me', 'true')
      } else {
        localStorage.removeItem('nexfi.remember-me')
      }
      return { success: true }
    }

    return { success: false, error: 'Invalid email or password' }
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

    // Get all stored users from localStorage
    const storedUsersStr = localStorage.getItem('nexfi.users')
    let users = []
    if (storedUsersStr) {
      try {
        users = JSON.parse(storedUsersStr)
      } catch (e) {
        users = []
      }
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email)
    if (existingUser) {
      return { success: false, error: 'Account already exists. Please sign in.' }
    }

    // Create user with hashed password
    const userData = {
      id: Date.now(),
      email: email,
      name: fullName,
      passwordHash: hashPassword(password) // Store hashed password
    }

    // Add to users array
    users.push(userData)
    localStorage.setItem('nexfi.users', JSON.stringify(users))

    // Also set as the current user (remove demo mode)
    setUser(userData)
    setIsLoggedIn(true)
    localStorage.setItem('nexfi.user', JSON.stringify(userData))
    localStorage.removeItem('nexfi.demo-mode')
    localStorage.removeItem('nexfi.remember-me')

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

  const value = {
    user,
    isLoggedIn,
    rememberMe,
    login,
    register,
    logout,
    toggleDemoMode,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}