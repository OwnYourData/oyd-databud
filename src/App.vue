<template>
  <div
    class="container"
    v-if="isInitializing"
  >
    <div class="jumbotron">
      <h1 class="display-4">OwnYourData DataBud</h1>
      <p class="lead">DataBud is loading <spinner></spinner></p>
    </div>
  </div>
  <router-view v-else></router-view>
</template>

<script lang="ts">
import Vue from "vue";
import { initialize } from './services';
import Spinner from './components/Spinner.vue'
import { ConfigService } from './services/config-service';

interface IData {
  isInitializing: boolean,
}

export default Vue.extend({
  components: {
    Spinner,
  },
  created() {
    this.initialize();
  },
  data: (): IData => ({
    isInitializing: true,
  }),
  methods: {
    async initialize() {
      const endpoint = ConfigService.get('endpoint', 'url');
      const appKey = ConfigService.get('endpoint', 'credentials', 'appKey');
      const appSecret = ConfigService.get('endpoint', 'credentials', 'appSecret');

      await initialize('', endpoint, appKey, appSecret);

      this.isInitializing = false;
    },
  }
});
</script>

<style>
.list-group-item {
  overflow: hidden;
  text-overflow: ellipsis;
  word-wrap: initial;
}
</style>