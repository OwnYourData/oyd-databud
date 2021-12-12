<template>
  <div>
    <b-container :fluid="isUiFluid">
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
        <p class="lead">{{message}}</p>
      </div>
    </b-container>
    <b-container v-else-if="isLoginFormShowed">
      <login
        :scopes="vaultSupport.scopes"
        :identityProviders="identityProviders"
        @login="logIn"
        @useIdentityProvider="tryInitializeVaultifier"
      ></login>
    </b-container>
    <router-view v-else></router-view>
  </div>
</template>

<style scoped>
.lead {
  white-space: pre-wrap;
}
</style>

<script lang="ts">
import Vue from "vue";
import { getInstance as getVaultifier, setInstance as setVaultifier } from './services';
import Spinner from './components/Spinner.vue'
import NavBar from './components/NavBar.vue'
import Login, { Data as LoginData } from './components/Login.vue'
import { Vaultifier, VaultEncryptionSupport, VaultSupport, VaultInfo, VaultifierWeb, OAuthIdentityProvider, } from 'vaultifier';
import { RoutePath } from './router';
import { RouteParams } from "./router/routes";
import { SchemaService } from "./services/schema-service";
import { IStore } from "./store";
import { ConfigService } from "./services/config-service";

interface IData {
  isInitializing: boolean,
  isLoggedIn: boolean,
  message?: string,
  encryptionSupport?: VaultEncryptionSupport,
  vaultSupport?: VaultSupport,
  vaultInfo?: VaultInfo,
  vaultUrl?: string,
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
    vaultUrl: undefined,
  }),
  methods: {
    async initialize() {
      this.tryInitializeVaultifier();

      const { searchParams } = new URL(window.location.href);

      const schema = searchParams.get(RouteParams.SCHEMA_DRI);
      if (schema && this.$router.currentRoute.path !== RoutePath.SCHEMA_VIEW)
        this.$router.push(RoutePath.SCHEMA_VIEW);

      const itemId = searchParams.get(RouteParams.ITEM_ID);
      if (itemId && this.$router.currentRoute.path !== RoutePath.ITEM_VIEW)
        this.$router.push(RoutePath.ITEM_VIEW);
    },
    async tryInitializeVaultifier(idp?: OAuthIdentityProvider) {
      this.isInitializing = true;

      let vaultifier: Vaultifier | undefined = undefined;

      const vw = await VaultifierWeb.create({
        baseUrl: ConfigService.get('endpoint', 'url'),
        clientId: ConfigService.get('endpoint', 'clientId'),
      });

      if (vw.vaultifier)
        this.vaultUrl = vw.vaultifier.urls.baseUrl;

      try {
        await vw.initialize({
          oAuthType: idp,
        });
      } catch { /* */ }

      if (vw.vaultifier) {
        vaultifier = vw.vaultifier;
        setVaultifier(vaultifier);
      }

      if (!vaultifier) {
        this.message = `Sorry. I was not able to create a vaultifier instance.
Try looking into the browser console to gain more insights on the problem.`;
        this.isInitializing = false;
        return;
      }

      try {
        this.vaultSupport = await vaultifier.getVaultSupport();

        if (await vaultifier.isAuthenticated()) {
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
    },
    state(): IStore {
      return this.$store.state as IStore;
    },
    isUiFluid(): boolean {
      return this.state.ui.isFluid;
    },
    identityProviders(): OAuthIdentityProvider[] {
      return (this.vaultSupport?.oAuth ?? []).filter(x => (x as OAuthIdentityProvider).authority !== undefined) as OAuthIdentityProvider[];
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