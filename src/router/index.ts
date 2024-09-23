import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Main from '@/views/Main/index.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/ranking',
    component: Main,
    children: [
      {
        path: '/plugin',
        name: 'plugin-manager',
        component: () => import('@/views/Main/pages/PluginManager.vue')
      },
      {
        path: '/download',
        name: 'download-manager',
        component: () => import('@/views/Main/pages/DownloadManager.vue')
      },
      {
        path: '/ranking',
        name: 'ranking',
        component: () => import('@/views/Main/pages/Ranking.vue')
      },
      {
        path: '/local',
        name: 'local-music',
        component: () => import('@/views/Main/pages/LocalMusic.vue')
      },
      {
        path: '/poppular',
        name: 'popular-playlists',
        component: () => import('@/views/Main/pages/PopularPlaylists.vue')
      },
      {
        path: '/recent',
        name: 'recent-played',
        component: () => import('@/views/Main/pages/RecentlyPlayed.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
