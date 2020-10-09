import { createApp } from 'vue'
import { store } from './store'
import App from './App.vue'
import { router } from './router';

import 'bootstrap/dist/css/bootstrap.css'

createApp(App)
  .use(store)
  .use(router)
  .mount('#app');
