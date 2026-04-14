import axios from 'axios'

const api = axios.create({
  // baseURL: import.meta.env.VITE_API_URL || '/api',
  baseURL: '/api',
  withCredentials: true, // send session cookie on every request
  headers: {
    'Content-Type': 'application/json',
  },
})

// Redirect to login on 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Avoid redirect loop on the login page itself
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
