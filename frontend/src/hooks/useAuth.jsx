import { createContext, useContext, useEffect, useState } from 'react'
import { onChange } from '../lib/storage.js'
import { getCurrentUser } from '../services/auth.js'

const UserContext = createContext(null)

/** Keeps the signed-in user up to date (including changes made in another tab). */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(getCurrentUser)
  useEffect(() => onChange(() => setUser(getCurrentUser())), [])
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

/** The signed-in user, or null. */
export function useUser() {
  return useContext(UserContext)
}
