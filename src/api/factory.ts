import type { AxiosInstance } from 'axios'
import MediaRepository from './movies'

interface ApiFactory {
  media: MediaRepository
}

function createApiFactory(client: AxiosInstance): ApiFactory {
  return {
    media: new MediaRepository(client),
  }
}

export type { ApiFactory }
export default createApiFactory
