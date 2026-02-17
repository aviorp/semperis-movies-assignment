import axios, { type AxiosInstance } from 'axios'
import createApiFactory from './factory'

/**
 * Create an Axios instance with a base URL and default headers.
 * @type {AxiosInstance}
 */

const apiClient: AxiosInstance = axios.create({
  baseURL: 'https:///www.omdbapi.com/',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const api = createApiFactory(apiClient)
export default apiClient
