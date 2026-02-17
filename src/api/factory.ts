import type { AxiosInstance } from 'axios'
import MoviesRepository from './movies'

interface ApiFactory {
  movies: MoviesRepository
}

/**
 * @description Factory function to create API repositories with a given Axios client. This allows for better separation of concerns and makes it easier to manage API interactions in a modular way. Each repository can be responsible for a specific set of related API endpoints, making the codebase more organized and maintainable.
 * @param {AxiosInstance} client - An instance of Axios to be used for making API requests.
 * @returns {ApiFactory} An object containing instances of API repositories.
 *
 * @example
 * const apiClient = axios.create({ baseURL: 'https://www.omdbapi.com/' })
 * const api = createApiFactory(apiClient)
 * api.movies.searchMovies({ s: 'Inception', type: 'movie' })
 */

function createApiFactory(client: AxiosInstance): ApiFactory {
  return {
    movies: new MoviesRepository(client),
  }
}

export type { ApiFactory }
export default createApiFactory
