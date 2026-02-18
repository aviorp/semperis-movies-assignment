import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import MovieCard from './movie-card.vue'
import type { MediaListItem } from '@/types'

const MOCK_MOVIE: MediaListItem = {
  id: 272,
  title: 'Batman Begins',
  overview: 'After training with his mentor...',
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  genre_ids: [28, 80],
  vote_average: 7.7,
  release_date: '2005-06-15',
}

const RouterLinkStub = {
  name: 'RouterLink',
  template: '<a><slot /></a>',
  props: ['to'],
}

function mountCard(movie: MediaListItem = MOCK_MOVIE, mediaType: 'movie' | 'tv' = 'movie') {
  return shallowMount(MovieCard, {
    props: { movie, mediaType },
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
        UIcon: true,
        UBadge: { template: '<span>{{ label }}</span>', props: ['label'] },
      },
    },
  })
}

describe('MovieCard', () => {
  it('renders the movie title', () => {
    const wrapper = mountCard()
    expect(wrapper.text()).toContain('Batman Begins')
  })

  it('renders the movie year', () => {
    const wrapper = mountCard()
    expect(wrapper.text()).toContain('2005')
  })

  it('renders the media type as a badge', () => {
    const wrapper = mountCard()
    expect(wrapper.text()).toContain('Movie')
  })

  it('renders TV badge for tv mediaType', () => {
    const wrapper = mountCard(MOCK_MOVIE, 'tv')
    expect(wrapper.text()).toContain('TV')
  })

  it('shows poster image when poster_path is present', () => {
    const wrapper = mountCard()
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toContain('/poster.jpg')
    expect(img.attributes('alt')).toBe('Batman Begins')
  })

  it('shows fallback icon when poster_path is null', () => {
    const wrapper = mountCard({ ...MOCK_MOVIE, poster_path: null })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'UIcon' }).exists()).toBe(true)
  })

  it('links to the media detail page', () => {
    const wrapper = mountCard()
    const link = wrapper.findComponent({ name: 'RouterLink' })
    expect(link.props('to')).toEqual({
      name: 'media-detail',
      params: { mediaType: 'movie', id: 272 },
    })
  })

  it('displays the rating on the poster', () => {
    const wrapper = mountCard()
    expect(wrapper.text()).toContain('7.7')
  })

  it('hides rating when vote_average is 0', () => {
    const wrapper = mountCard({ ...MOCK_MOVIE, vote_average: 0 })
    expect(wrapper.text()).not.toContain('0.0')
  })

  it('uses name field for TV shows', () => {
    const tvShow: MediaListItem = {
      id: 1399,
      name: 'Game of Thrones',
      overview: 'A fantasy drama...',
      poster_path: '/got.jpg',
      backdrop_path: null,
      genre_ids: [18],
      vote_average: 8.4,
      first_air_date: '2011-04-17',
    }
    const wrapper = mountCard(tvShow, 'tv')
    expect(wrapper.text()).toContain('Game of Thrones')
    expect(wrapper.text()).toContain('2011')
  })
})
