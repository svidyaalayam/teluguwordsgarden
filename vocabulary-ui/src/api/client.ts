import axios from 'axios'

export const api = axios.create({
  baseURL: '/',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vp_access')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
