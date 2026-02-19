# Semperis Movies Home Assignment

A movie and TV show catalog built with Vue 3, powered by the [TMDB API](https://www.themoviedb.org/documentation/api).

Browse trending content, filter by genre, era, and rating, search by title, and view detailed information including cast and crew.

## Tech Stack

- **Vue 3** with Composition API and `<script setup>`
- **TypeScript** for type safety
- **Pinia** for state management
- **Vue Router** with lazy-loaded routes
- **@nuxt/ui v4** component library (used as a Vue plugin)
- **Tailwind CSS v4** for styling
- **Axios** for HTTP requests
- **Vitest** + Vue Test Utils for testing
- **Vite** for build tooling

## Features

- Media type toggle (Movies / TV Shows)
- Genre, era, and minimum rating filters
- Text search with debounce
- Infinite scroll pagination
- Detail pages with backdrop, poster, cast, and crew
- View Transitions API for smooth page navigation
- URL-driven filter state (shareable links, browser history support)

## Setup

```sh
pnpm install
cp .env.example .env
```

Add your TMDB API key to `.env`:

```
VITE_TMDB_API_KEY=your_key_here
```

Get a free key at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api).

## Scripts

| Command       | Description                         |
| ------------- | ----------------------------------- |
| `pnpm dev`    | Start dev server                    |
| `pnpm build`  | Type-check and build for production |
| `pnpm test`   | Run all tests once                  |
| `pnpm lint`   | Run oxlint + eslint with auto-fix   |
| `pnpm format` | Format source files with Prettier   |

## Project Structure

```
src/
  api/            # Axios client and TMDB repository
  components/     # Shared components (MovieCard, MovieFilters)
  layouts/        # Layout shells (default with navbar, blank for detail)
  pages/          # Route-level pages
    home-page.vue
    movie-detail/
      movie-detail-page.vue
      components/   # Page-scoped components (MediaHero, MediaCast)
  stores/         # Pinia stores (movies, filters, genres)
  types/          # TypeScript interfaces and type definitions
  utils/          # Helper functions and constants
  router/         # Route definitions
```

## Live Demo

Hosted on Cloudflare Pages: [semperis.aviorp.me](https://semperis.aviorp.me/)
