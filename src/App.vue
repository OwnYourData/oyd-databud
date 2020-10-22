<template>
  <div
    class="container"
    v-if="isInitializing"
  >
    <div class="jumbotron">
      <h1 class="display-4">OwnYourData DataBud</h1>
      <p class="lead">
        DataBud is loading <spinner></spinner>
      </p>
    </div>
  </div>
  <login
    v-else-if="isLoginFormShowed"
    @login="logIn"
  ></login>
  <router-view v-else></router-view>
</template>

<script lang="ts">
import Vue from "vue";
import { initialize } from './services';
import Spinner from './components/Spinner.vue'
import Login, { Data as LoginData } from './components/Login.vue'
import { ConfigService } from './services/config-service';

interface IData {
  isInitializing: boolean,
  isLoggedIn: boolean,
}

export default Vue.extend({
  components: {
    Spinner,
    Login,
  },
  created() {
    this.initialize();
  },
  data: (): IData => ({
    isInitializing: true,
    isLoggedIn: false,
  }),
  methods: {
    async initialize() {
      const appKey = ConfigService.get('endpoint', 'credentials', 'appKey');
      const appSecret = ConfigService.get('endpoint', 'credentials', 'appSecret');

      this.tryInitializeVaultifier(appKey, appSecret)
    },
    async tryInitializeVaultifier(appKey: string, appSecret: string) {
      this.isInitializing = true;

      try {
        const endpoint = ConfigService.get('endpoint', 'url');

        const vaultifier = await initialize('', endpoint, appKey, appSecret);
        this.isLoggedIn = vaultifier.isValid();
      }
      catch {
        /* if there is no data provided */
      }

      this.isInitializing = false;
    },
    logIn({ appKey, appSecret }: LoginData) {
      this.tryInitializeVaultifier(appKey, appSecret);
    }
  },
  computed: {
    isLoginFormShowed(): boolean {
      return !this.isInitializing && !this.isLoggedIn;
    }
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