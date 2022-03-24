import Vue from 'vue';
import App from './App.vue';
import { router } from './router';
import { getStore } from './store';

import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import VueBootstrapTypeahead from 'vue-bootstrap-typeahead';

import VueMultiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';

import VueCompositionApi from '@vue/composition-api';

import { ConfigService } from './services/config-service';

(async () => {
  await ConfigService.initialize();

  Vue.use(BootstrapVue);
  Vue.use(IconsPlugin);
  
  Vue.component('b-typeahead', VueBootstrapTypeahead);
  Vue.component('multiselect', VueMultiselect);

  // composition api is needed for json-forms
  Vue.use(VueCompositionApi);

  new Vue({
    router,
    store: getStore(),
    render: h => h(App)
  }).$mount('#app')
}
)();
