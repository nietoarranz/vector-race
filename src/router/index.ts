import { createRouter, createWebHistory } from 'vue-router'

import RaceView from '@/views/RaceView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/race',
      name: 'race',
      component: RaceView,
    },
  ],
})

export default router

/*
Archive routes
===================================================================================

import HomeView from '../views/HomeView.vue'
{
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
*/
