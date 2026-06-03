import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/cases',
    name: 'CasesHome',
    component: () => import('../views/CasesHomeView.vue'),
  },
  {
    path: '/game',
    name: 'Game',
    component: () => import('../views/GameView.vue'),
  },
  {
    path: '/results',
    name: 'Results',
    component: () => import('../views/ResultsView.vue'),
  },
  {
    path: '/aspect',
    name: 'AspectHome',
    component: () => import('../views/AspectHomeView.vue'),
  },
  {
    path: '/aspect/game',
    name: 'AspectGame',
    component: () => import('../views/AspectGameView.vue'),
  },
  {
    path: '/aspect/results',
    name: 'AspectResults',
    component: () => import('../views/AspectResultsView.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;