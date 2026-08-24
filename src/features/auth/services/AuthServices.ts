const API_BASE = import.meta.env.VITE_API_BASE_URL

export interface User {
  ID: string;
  Name: string;
  Email: string;
  Avatar: string;
}

interface LoginOptions {
  client?: "web" | "cli";
  sessionId?: string | null;
}

export const authService = {
  loginWithProvider: (provider: string, { client = "web", sessionId }: LoginOptions = {}) => {
    const params = new URLSearchParams({ client })
    if (sessionId) params.set("session_id", sessionId)
    window.location.href = `${API_BASE}/auth/${provider}?${params.toString()}`
  },

  logOut: async () => {
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      credentials: 'include',
    })

  }
}
