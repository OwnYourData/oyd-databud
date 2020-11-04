<template>
  <div>
    <div class="container">
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <span class="navbar-brand">DataBud</span>
        <small class="text-muted">v{{version}}</small>
      </nav>
    </div>
    <div
      class="container"
      v-if="isInitializing"
    >
      <div class="jumbotron">
        <span class="lead">
          OwnYourData DataBud <span class="text-muted">is loading <spinner></spinner></span>
        </span>

      </div>
    </div>
    <div
      class="container"
      v-else-if="hasMessage"
    >
      <div class="jumbotron">
        <h1 class="display-5">Buddy Message</h1>
        <p class="lead">
          {{message}}
        </p>
      </div>
    </div>
    <login
      v-else-if="isLoginFormShowed"
      @login="logIn"
    ></login>
    <router-view v-else></router-view>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { create, getInstance } from './services';
import Spinner from './components/Spinner.vue'
import Login, { Data as LoginData } from './components/Login.vue'
import { ConfigService, PACKAGE } from './services/config-service';
import { Vaultifier } from 'vaultifier';
import { RoutePath } from './router';

interface IData {
  isInitializing: boolean,
  isLoggedIn: boolean,
  message?: string,
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
      const vaultifier = create();

      this.tryInitializeVaultifier();

      const { searchParams } = new URL(window.location.href);
      const schema = searchParams.get('schemaDri');

      if (schema && this.$router.currentRoute.path !== RoutePath.SCHEMA_VIEW)
        this.$router.push(RoutePath.SCHEMA_VIEW);
    },
    async tryInitializeVaultifier() {
      const vaultifier = getInstance();
      this.isInitializing = true;

      try {
        const supports = await vaultifier.getVaultSupport();

        if (!supports.authentication) {
          this.isLoggedIn = true;
        }
        else if (vaultifier.hasCredentials()) {
          await vaultifier.initialize();

          this.isLoggedIn = await vaultifier.isValid();
        }

        await vaultifier.setEnd2EndEncryption(true);
      }
      catch {
        this.message = `I'm not sure ${vaultifier.baseUrl} is the correct endpoint I should connect to. Please check this again.`;
      }

      this.isInitializing = false;
    },
    logIn(credentials: LoginData) {
      getInstance().setCredentials(credentials);
      this.tryInitializeVaultifier();
    }
  },
  computed: {
    hasMessage(): boolean {
      return !!this.message;
    },
    isLoginFormShowed(): boolean {
      return !this.isInitializing && !this.isLoggedIn;
    },
    version(): string {
      return PACKAGE.version;
    }
  }
});
</script>

<style scoped>
.navbar {
  margin-bottom: 1em;
}
</style>

<style>
.list-group-item {
  overflow: hidden;
  text-overflow: ellipsis;
  word-wrap: initial;
}
</style>