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
  {
    path: '/comparatives',
    name: 'ComparativeHome',
    component: () => import('../views/ComparativeHomeView.vue'),
  },
  {
    path: '/comparatives/game',
    name: 'ComparativeGame',
    component: () => import('../views/ComparativeGameView.vue'),
  },
  {
    path: '/comparatives/results',
    name: 'ComparativeResults',
    component: () => import('../views/ComparativeResultsView.vue'),
  },
  {
    path: '/campaigns',
    name: 'CampaignMap',
    component: () => import('../views/CampaignMapView.vue'),
  },
  {
    path: '/campaigns/:id/lessons/:lessonId',
    name: 'CampaignLesson',
    component: () => import('../views/CampaignLessonView.vue'),
  },
  {
    path: '/campaigns/:id',
    name: 'CampaignDetail',
    component: () => import('../views/CampaignDetailView.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;

