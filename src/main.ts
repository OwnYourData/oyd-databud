import Vue from 'vue';
import App from './App.vue';
import { router } from './router';
import { getStore } from './store';

import 'bootstrap/dist/css/bootstrap.css';
import { ConfigService } from './services/config-service';

(async () => {
  await ConfigService.initialize();

  new Vue({
    router,
    store: getStore(),
    render: h => h(App)
  }).$mount('#app')
}
)();
