import type {
  SearchByIdOrTitleParams,
  SearchMovieParams,
  SearchMoviesResponse,
  MovieDetailsResponse,
} from '@/types'
import type { AxiosInstance } from 'axios'

class MoviesRepository {
  private client: AxiosInstance

  /**
   * Usually, you would want to store API keys securely, such as in environment variables or a secure vault. For the sake of this example, we're hardcoding them here, but in a real application, you should never do this.
   * this rotate is only for having multiple keys to avoid hitting rate limits during development/testing. In production, you would want to implement a more robust solution for managing API keys and handling rate limits, such as using a proxy server or implementing exponential backoff for retries.
   */
  private apiKeys: string[] = ['ca7ba9f2', 'db1d0187', 'ff0b60b3']

  constructor(client: AxiosInstance) {
    this.client = client
  }

  /**
   * as mentions above - this is not convent
   */
  private getApiKey(): string {
    const key = this.apiKeys[Math.floor(Math.random() * this.apiKeys.length)]
    if (!key) {
      throw new Error('No API keys available')
    }
    return key
  }

  async searchMovies(params: Omit<SearchMovieParams, 'apiKey'>): Promise<SearchMoviesResponse> {
    const { data } = await this.client.get<SearchMoviesResponse>('', {
      params: { ...params, apiKey: this.getApiKey() },
    })
    return data
  }

  async getByIdOrTitle(
    params: Omit<SearchByIdOrTitleParams, 'apiKey'>,
  ): Promise<MovieDetailsResponse> {
    const { data } = await this.client.get<MovieDetailsResponse>('', {
      params: { ...params, apiKey: this.getApiKey() },
    })
    return data
  }
}

export default MoviesRepository
