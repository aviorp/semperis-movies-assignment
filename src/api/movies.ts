import type {
  MediaType,
  MediaListItem,
  MediaDetailsMap,
  GenreListResponse,
  PaginatedResponse,
  DiscoverParams,
  SearchParams,
} from '@/types'
import type { AxiosInstance } from 'axios'

class MediaRepository {
  private client: AxiosInstance

  constructor(client: AxiosInstance) {
    this.client = client
  }

  async discover(
    mediaType: MediaType,
    params: DiscoverParams = {},
  ): Promise<PaginatedResponse<MediaListItem>> {
    const { data } = await this.client.get<PaginatedResponse<MediaListItem>>(
      `/discover/${mediaType}`,
      { params },
    )
    return data
  }

  async search(
    mediaType: MediaType,
    params: SearchParams,
  ): Promise<PaginatedResponse<MediaListItem>> {
    const { data } = await this.client.get<PaginatedResponse<MediaListItem>>(
      `/search/${mediaType}`,
      { params },
    )
    return data
  }

  async getDetails<T extends MediaType>(mediaType: T, id: number): Promise<MediaDetailsMap[T]> {
    const { data } = await this.client.get<MediaDetailsMap[T]>(
      `/${mediaType}/${id}`,
      { params: { append_to_response: 'credits' } },
    )
    return data
  }

  async getGenres(mediaType: MediaType): Promise<GenreListResponse> {
    const { data } = await this.client.get<GenreListResponse>(`/genre/${mediaType}/list`)
    return data
  }
}

export default MediaRepository
