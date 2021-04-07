<template>
  <div>
    <b-container>
      <nav-bar
        :encryptionSupport="encryptionSupport"
        :title="title"
        :description="description"
      >
      </nav-bar>
    </b-container>
    <b-container v-if="isInitializing">
      <div class="jumbotron">
        <span class="lead">
          {{title}} <span class="text-muted">is loading <spinner></spinner></span>
        </span>

      </div>
    </b-container>
    <b-container v-else-if="hasMessage">
      <div class="jumbotron">
        <h1 class="display-5">Buddy Message</h1>
        <p class="lead">
          {{message}}
        </p>
      </div>
    </b-container>
    <b-container v-else-if="isLoginFormShowed">
      <login
        :scopes="vaultSupport.scopes"
        @login="logIn"
      ></login>
    </b-container>
    <router-view v-else></router-view>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { create as createVaultifier, getInstance as getVaultifier } from './services';
import Spinner from './components/Spinner.vue'
import NavBar from './components/NavBar.vue'
import Login, { Data as LoginData } from './components/Login.vue'
import { ConfigService } from './services/config-service';
import { Vaultifier, VaultEncryptionSupport, VaultSupport, VaultInfo, } from 'vaultifier';
import { RoutePath } from './router';
import { RouteParams } from "./router/routes";
import { SchemaService } from "./services/schema-service";

interface IData {
  isInitializing: boolean,
  isLoggedIn: boolean,
  message?: string,
  encryptionSupport?: VaultEncryptionSupport,
  vaultSupport?: VaultSupport,
  vaultInfo?: VaultInfo,
}

export default Vue.extend({
  components: {
    Spinner,
    Login,
    NavBar,
  },
  created() {
    this.initialize();
  },
  data: (): IData => ({
    isInitializing: true,
    isLoggedIn: false,
    message: undefined,
    encryptionSupport: undefined,
    vaultSupport: undefined,
    vaultInfo: undefined,
  }),
  methods: {
    async initialize() {
      const vaultifier = await createVaultifier();

      this.tryInitializeVaultifier();

      const { searchParams } = new URL(window.location.href);

      const schema = searchParams.get(RouteParams.SCHEMA_DRI);
      if (schema && this.$router.currentRoute.path !== RoutePath.SCHEMA_VIEW)
        this.$router.push(RoutePath.SCHEMA_VIEW);

      const itemId = searchParams.get(RouteParams.ITEM_ID);
      if (itemId && this.$router.currentRoute.path !== RoutePath.ITEM_VIEW)
        this.$router.push(RoutePath.ITEM_VIEW);
    },
    async tryInitializeVaultifier() {
      const vaultifier = getVaultifier();
      this.isInitializing = true;

      try {
        this.vaultSupport = await vaultifier.getVaultSupport();

        if (vaultifier.isAuthenticated()) {
          this.isLoggedIn = true;
        }
        else {
          try {
            await vaultifier.initialize();
            this.isLoggedIn = await vaultifier.isAuthenticated();
          } catch { /* vaultifier throws an error if no credentials can be determined */ }
        }

        this.encryptionSupport = await vaultifier.setEnd2EndEncryption(true);

        if (this.isLoggedIn) {
          this.vaultInfo = await vaultifier.getVaultInfo();
          await this.initializeOca();
        }
      }
      catch {
        if (vaultifier.urls.baseUrl)
          this.message = `I'm not sure ${vaultifier.urls.baseUrl} is the correct endpoint I should connect to. Please check this again.`;
        else
          this.message = `I could not find any endpoint to connect to.`
      }

      this.isInitializing = false;
    },
    logIn(credentials: LoginData) {
      getVaultifier().setCredentials(credentials);
      this.tryInitializeVaultifier();
    },
    async initializeOca() {
      const { content: configurationItems } = await getVaultifier().getValues({
        // That's the dri of "ConfigurationItem", basically it's a key value pair
        schemaDri: '4ktjMzvwbhAeGM8Dwu67VcCnuJc52K3fVdq7V1qCPWLw',
      });

      const ocaBaseUrl = configurationItems.find((x: any) => x.key === 'oca.backend.url');
      SchemaService.setBaseUrl(ocaBaseUrl?.value)
    }
  },
  computed: {
    hasMessage(): boolean {
      return !!this.message;
    },
    isLoginFormShowed(): boolean {
      return !this.isInitializing && !this.isLoggedIn;
    },
    title(): string {
      return this.vaultInfo?.name || 'OYD-DataBud';
    },
    description(): string | undefined {
      return this.vaultInfo?.description;
    }
  },
  watch: {
    title() {
      document.title = this.title;
    }
  }
});
</script>

<style>
.list-group-item {
  /* overflow: hidden; */
  text-overflow: ellipsis;
  word-wrap: initial;
}

.list-group-item:not(.list-group-item--nolink) {
  cursor: pointer;
}

.list-group-item:not(.active):not(.list-group-item--nolink):hover {
  background-color: #f0f7ff;
}
</style>