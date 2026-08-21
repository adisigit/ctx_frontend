const API_BASE = import.meta.env.VITE_API_BASE_URL

export interface User {
  ID: string;
  Name: string;
  Email: string;
  Avatar: string;
}

export const authService = {
  loginWithProvider: (provider: string) => {
    window.location.href = `${API_BASE}/auth/${provider}`
  },

  logOut: async () => {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
    })

  }
}
