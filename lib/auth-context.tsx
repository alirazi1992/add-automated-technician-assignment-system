"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  department?: string
  role: "client" | "engineer" | "admin"
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role?: string) => Promise<boolean>
  register: (userData: {
    name: string
    email: string
    phone: string
    department: string
    role: string
    password: string
  }) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users database
const mockUsers: (User & { password: string })[] = [
  {
    id: "1",
    name: "احمد محمدی",
    email: "ahmad@company.com",
    phone: "09123456789",
    department: "it",
    role: "client",
    password: "123456",
  },
  {
    id: "2",
    name: "علی تکنسین",
    email: "ali@company.com",
    phone: "09123456788",
    department: "it",
    role: "engineer",
    password: "123456",
  },
  {
    id: "3",
    name: "مدیر سیستم",
    email: "admin@company.com",
    phone: "09123456787",
    department: "it",
    role: "admin",
    password: "123456",
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      // Store user email for technician filtering
      localStorage.setItem("userEmail", userData.email)
      localStorage.setItem("userName", userData.name)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, role?: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundUser = mockUsers.find((u) => u.email === email && u.password === password)

    if (foundUser) {
      // If role is specified, check if it matches
      if (role && role === "technician" && foundUser.role === "client") {
        setIsLoading(false)
        return false
      }
      if (role && role === "client" && (foundUser.role === "engineer" || foundUser.role === "admin")) {
        setIsLoading(false)
        return false
      }

      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("user", JSON.stringify(userWithoutPassword))
      localStorage.setItem("userEmail", userWithoutPassword.email)
      localStorage.setItem("userName", userWithoutPassword.name)
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const register = async (userData: {
    name: string
    email: string
    phone: string
    department: string
    role: string
    password: string
  }): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === userData.email)
    if (existingUser) {
      setIsLoading(false)
      return false
    }

    // Create new user
    const newUser = {
      id: (mockUsers.length + 1).toString(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      department: userData.department,
      role: userData.role as "client" | "engineer" | "admin",
      password: userData.password,
    }

    // Add to mock database
    mockUsers.push(newUser)

    // Auto-login the new user
    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    localStorage.setItem("user", JSON.stringify(userWithoutPassword))
    localStorage.setItem("userEmail", userWithoutPassword.email)
    localStorage.setItem("userName", userWithoutPassword.name)

    setIsLoading(false)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
  }

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
