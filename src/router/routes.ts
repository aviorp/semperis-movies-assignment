import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/',
    name: 'default-layout',
    component: () => import('@/layouts/default-layout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/pages/home-page.vue'),
        meta: {
          title: 'Catalog - Semperis Movies',
        },
      },
    ],
  },
  {
    path: '/:mediaType(movie|tv)',
    component: () => import('@/layouts/blank-layout.vue'),
    children: [
      {
        path: ':id(\\d+)',
        name: 'media-detail',
        component: () => import('@/pages/movie-detail/movie-detail-page.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/',
  },
] as const satisfies readonly RouteRecordRaw[]
