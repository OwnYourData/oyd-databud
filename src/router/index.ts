import * as VueRouter from 'vue-router';

import { routes } from './routes';
export { RoutePath } from './routes'

export const router = VueRouter.createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: VueRouter.createWebHashHistory(),
  routes, // short for `routes: routes`
})