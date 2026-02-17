export interface BaseMovieSearchParams {
  apiKey: string // API key for authentication
  y?: string // Year of release
  type: MovieType // Type of result to return
}

export interface SearchMovieParams extends BaseMovieSearchParams {
  i?: string // IMDb ID of the movie
  s: string // Movie String to search for
  page?: number // Page number to return (for pagination)
}

export interface SearchByIdOrTitleParams extends BaseMovieSearchParams {
  i?: string // IMDb ID of the movie
  plot: PlotOptions // Plot length (short or full)
}

export type MovieType = 'movie' | 'series' | 'episode'

export interface MovieDetails {
  Title: string
  Year: string
  Rated: string
  Released: string
  Runtime: string
  Genre: string
  Director: string
  Writer: string
  Actors: string
  Plot: string
  Language: string
  Country: string
  Awards: string
  Poster: string
  Ratings: {
    Source: string
    Value: string
  }[]
  Metascore: string
  imdbRating: string
  imdbVotes: string
  imdbID: string
  Type: MovieType
  DVD: string
  BoxOffice: string
  Production: string
  Website: string
}

export type SearchMovieResult = Pick<MovieDetails, 'Title' | 'Year' | 'imdbID' | 'Type' | 'Poster'>

export type PlotOptions = 'short' | 'full'

export interface ApiErrorResponse {
  Response: 'False'
  Error: string
}

export interface SearchMoviesSuccessResponse {
  Response: 'True'
  Search: SearchMovieResult[]
  totalResults: string
}

export type SearchMoviesResponse = SearchMoviesSuccessResponse | ApiErrorResponse

export interface MovieDetailsSuccessResponse extends MovieDetails {
  Response: 'True'
}

export type MovieDetailsResponse = MovieDetailsSuccessResponse | ApiErrorResponse
