export type MediaType = 'movie' | 'tv'

export interface Genre {
  id: number
  name: string
}

export interface GenreListResponse {
  genres: Genre[]
}

export interface BaseMedia {
  id: number
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
}

export type MediaWithTitle = BaseMedia & { title?: string; name?: string }

export type MediaWithDate = BaseMedia & { release_date?: string; first_air_date?: string }

export interface DateRange {
  gte: string
  lte: string
}

export interface SelectOption {
  label: string
  value: string
}

export type SelectValue = string[] | SelectOption[]

export type QueryParams = Record<string, string | undefined>

export interface MediaListItem extends BaseMedia {
  title?: string
  name?: string
  genre_ids: number[]
  release_date?: string
  first_air_date?: string
  media_type?: MediaType
}

export interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

export interface CrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

export interface Credits {
  cast: CastMember[]
  crew: CrewMember[]
}

export interface Creator {
  id: number
  name: string
  profile_path: string | null
}

export interface BaseMediaDetails extends BaseMedia {
  genres: Genre[]
  vote_count: number
  popularity: number
  homepage: string | null
  tagline: string | null
  status: string
  credits?: Credits
}

export interface MovieDetails extends BaseMediaDetails {
  title: string
  release_date: string
  runtime: number | null
  budget: number
  revenue: number
  imdb_id: string | null
}

export interface TvDetails extends BaseMediaDetails {
  name: string
  first_air_date: string
  last_air_date: string
  number_of_seasons: number
  number_of_episodes: number
  episode_run_time: number[]
  created_by: Creator[]
}

export interface MediaDetailsMap {
  movie: MovieDetails
  tv: TvDetails
}

export interface PaginatedResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

interface PaginationParams {
  page?: number
}

export interface DiscoverParams extends PaginationParams {
  with_genres?: string
  sort_by?: string
  'primary_release_date.gte'?: string
  'primary_release_date.lte'?: string
  'first_air_date.gte'?: string
  'first_air_date.lte'?: string
  'vote_average.gte'?: number
}

export interface SearchParams extends PaginationParams {
  query: string
}
