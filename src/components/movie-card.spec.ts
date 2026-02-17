import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import MovieCard from './movie-card.vue'
import type { SearchMovieResult } from '@/types'

const MOCK_MOVIE: SearchMovieResult = {
  Title: 'Batman Begins',
  Year: '2005',
  imdbID: 'tt0372784',
  Type: 'movie',
  Poster: 'https://example.com/poster.jpg',
}

const RouterLinkStub = {
  name: 'RouterLink',
  template: '<a><slot /></a>',
  props: ['to'],
}

function mountCard(movie: SearchMovieResult = MOCK_MOVIE) {
  return shallowMount(MovieCard, {
    props: { movie },
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

  it('renders the movie type as a badge', () => {
    const wrapper = mountCard()
    expect(wrapper.text()).toContain('movie')
  })

  it('shows poster image when URL is valid', () => {
    const wrapper = mountCard()
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://example.com/poster.jpg')
    expect(img.attributes('alt')).toBe('Batman Begins')
  })

  it('shows fallback icon when poster is N/A', () => {
    const wrapper = mountCard({ ...MOCK_MOVIE, Poster: 'N/A' })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'UIcon' }).exists()).toBe(true)
  })

  it('links to the movie detail page', () => {
    const wrapper = mountCard()
    const link = wrapper.findComponent({ name: 'RouterLink' })
    expect(link.props('to')).toEqual({
      name: 'movie-detail',
      params: { id: 'tt0372784' },
    })
  })
})
