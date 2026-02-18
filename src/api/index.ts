import axios, { type AxiosInstance } from 'axios'
import createApiFactory from './factory'

const apiClient: AxiosInstance = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: import.meta.env.VITE_TMDB_API_KEY,
  },
  headers: {
    'Content-Type': 'application/json',
  },
})

export const api = createApiFactory(apiClient)
export default apiClient
