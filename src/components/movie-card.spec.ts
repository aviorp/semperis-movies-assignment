import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import MovieCard from './movie-card.vue'
import type { MediaListItem, MediaType } from '@/types'

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

function mountCard(movie: MediaListItem = MOCK_MOVIE, mediaType: MediaType = 'movie') {
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
  it('renders title, year, and rating', () => {
    const wrapper = mountCard()
    expect(wrapper.text()).toContain('Batman Begins')
    expect(wrapper.text()).toContain('2005')
    expect(wrapper.text()).toContain('7.7')
  })

  it('links to the media detail page', () => {
    const wrapper = mountCard()
    const link = wrapper.findComponent({ name: 'RouterLink' })
    expect(link.props('to')).toEqual({
      name: 'media-detail',
      params: { mediaType: 'movie', id: 272 },
    })
  })

  it('shows fallback icon when poster_path is null', () => {
    const wrapper = mountCard({ ...MOCK_MOVIE, poster_path: null })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'UIcon' }).exists()).toBe(true)
  })

  it('handles TV shows with name and first_air_date', () => {
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
    expect(wrapper.text()).toContain('TV')
  })
})
