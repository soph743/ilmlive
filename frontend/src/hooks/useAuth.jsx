import { createContext, useContext, useEffect, useState } from 'react'
import { onChange } from '../lib/storage.js'
import { getCurrentUser, loadSession } from '../services/auth.js'

const UserContext = createContext(null)

/** Asks the server who is signed in, then keeps the user up to date. */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(getCurrentUser)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const unsubscribe = onChange(() => setUser(getCurrentUser()))
    loadSession().finally(() => setReady(true))
    return unsubscribe
  }, [])
  // Render nothing until we know, so signed-in users don't see the sign-in screen flash.
  if (!ready) return null
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

/** The signed-in user, or null. */
export function useUser() {
  return useContext(UserContext)
}
