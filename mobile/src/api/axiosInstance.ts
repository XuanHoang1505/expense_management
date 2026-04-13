import axios from 'axios'
import { tokenStorage } from '../utils/tokenStorage'

const api = axios.create({
  baseURL: 'http://10.0.2.2:8080/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async config => {
  const accessToken = await tokenStorage.get()
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

api.interceptors.response.use(
  res => res,
  async error => {
    if (error.response?.status === 401) {
      await tokenStorage.remove()
    }
    return Promise.reject(error)
  }
)

export default api