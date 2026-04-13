import { create } from 'zustand'
import { tokenStorage } from '../utils/tokenStorage'

interface User {
  email:    string
  fullName: string
}

interface AuthState {
  user:       User | null
  token:      string | null
  isLoggedIn: boolean
  setAuth:    (token: string, user: User) => Promise<void>
  logout:     () => Promise<void>
  loadToken:  () => Promise<void>
}

export const useAuthStore = create<AuthState>(set => ({
  user:       null,
  token:      null,
  isLoggedIn: false,

  setAuth: async (token, user) => {
    await tokenStorage.set(token)
    set({ token, user, isLoggedIn: true })
  },

  logout: async () => {
    await tokenStorage.remove()
    set({ token: null, user: null, isLoggedIn: false })
  },

  loadToken: async () => {
    const token = await tokenStorage.get()
    if (token) set({ token, isLoggedIn: true })
  },
}))