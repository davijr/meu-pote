import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_API_URL 
    : 'http://localhost:3001/api',
  timeout: 10000,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)