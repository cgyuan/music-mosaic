import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
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
        path: '/popular-music-sheets',
        name: 'popular-music-sheets',
        component: () => import('@/views/Main/pages/PopMusicSheets.vue')
      },
      {
        path: '/recent',
        name: 'recent-played',
        component: () => import('@/views/Main/pages/RecentlyPlayed.vue')
      },
      {
        path: '/music-sheet-detail/:id/:itemData',
        name: 'music-sheet-detail',
        component: () => import('@/views/Main/pages/CloudMusicSheet.vue'),
        props: (route) => ({
          id: route.params.id,
          itemData: route.params.itemData
        })
      },
      {
        path: '/my-music-sheet-detail/:id',
        name: 'my-music-sheet-detail',
        component: () => import('@/views/Main/pages/LocalMusicSheet.vue')
      },
      {
        path: '/stared-music-sheet/:id/:itemData',
        name: 'stared-music-sheet',
        component: () => import('@/views/Main/pages/CloudMusicSheet.vue'),
        props: (route) => ({
          id: route.params.id,
          itemData: route.params.itemData
        })
      },
      {
        path: '/search/:query',
        name: 'search',
        component: () => import('@/views/Main/pages/Search/index.vue')
      },
      {
        path: '/settings',
        name: 'settings',
        component: () => import('@/views/Main/pages/Settings/index.vue')
      },
      {
        path: '/theme',
        name: 'theme',
        component: () => import('@/views/Main/pages/Theme/Index.vue')
      }
    ]
  },
  {
    path: '/mini-player',
    name: 'mini-player',
    component: () => import('@/views/MiniPlayer/index.vue')
  },
  {
    path: '/desktop-lyric',
    name: 'desktop-lyric',
    component: () => import('@/views/DesktopLyric/index.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
