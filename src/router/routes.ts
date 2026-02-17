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
          title: 'Catalogue - Semperis Movies',
        },
      },
    ],
  },
  {
    path: '/movie',
    component: () => import('@/layouts/blank-layout.vue'),
    children: [
      {
        path: ':id',
        name: 'movie-detail',
        component: () => import('@/pages/movie-detail-page.vue'),
      },
    ],
  },
] as const satisfies readonly RouteRecordRaw[]
