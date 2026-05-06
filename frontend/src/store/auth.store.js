/**
 * auth.store.js — Zustand store for authentication
 *
 * Handles:
 *  - Login: stores JWT + decoded user in localStorage
 *  - Logout: clears everything
 *  - Token decode: extracts role from JWT payload
 *  - Hydration: restores session on page reload
 *
 * Install Zustand if not already:
 *   npm install zustand
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Decode a JWT without any library.
 * Returns the payload object, or null if invalid.
 */
function decodeJWT(token) {
  try {
    const base64 = token.split('.')[1]
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

/**
 * Check if a JWT is expired.
 * FastAPI sets `exp` as a Unix timestamp (seconds).
 */
function isTokenExpired(token) {
  const payload = decodeJWT(token)
  if (!payload?.exp) return true
  return Date.now() / 1000 > payload.exp
}

// ─────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── State ──────────────────────────────────────────────
      token: null,   // raw JWT string
      user: null,    // { id, email, name, role }

      // ── Computed helpers ───────────────────────────────────
      isAuthenticated: () => {
        const { token } = get()
        return !!token && !isTokenExpired(token)
      },

      getRole: () => get().user?.role ?? null,

      // ── Actions ────────────────────────────────────────────

      /**
       * Call this after a successful POST /auth/login.
       *
       * Expected response from FastAPI:
       *   { access_token: "eyJ...", token_type: "bearer" }
       *
       * The JWT payload must include:
       *   { sub: "user_id", email: "...", name: "...", role: "client|lawyer|admin", exp: ... }
       */
      login(access_token) {
        const payload = decodeJWT(access_token)
        if (!payload) throw new Error('Invalid token received from server')

        const user = {
          id:    payload.sub,
          email: payload.email ?? '',
          name:  payload.name  ?? payload.email ?? 'User',
          role:  payload.role  ?? 'client',       // ← your FastAPI must set this claim
        }

        set({ token: access_token, user })
      },

      logout() {
        set({ token: null, user: null })
        // Optional: redirect to login
        window.location.href = '/login'
      },
    }),

    {
      name: 'lawyerlink-auth',   // localStorage key
      // Only persist token + user; derived functions are not serialisable
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)