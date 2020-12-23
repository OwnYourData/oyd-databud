<template>
  <div>
    <b-container>
      <nav-bar
        :encryptionSupport="encryptionSupport"
        :title="title"
        :description="description"
      >
        <b-nav-item
          v-if="hasTDA"
          href="#"
          target="_blank"
          :disabled="isTDALoading"
          @click.prevent="openTDA"
        >
          TDA
          <spinner
            v-if="isTDALoading"
            variant="light"
            :small="true"
          />
        </b-nav-item>
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
import { create as createVaultifier, getInstance as getVaultifier, TDAService } from './services';
import Spinner from './components/Spinner.vue'
import NavBar from './components/NavBar.vue'
import Login, { Data as LoginData } from './components/Login.vue'
import { ConfigService } from './services/config-service';
import { Vaultifier, VaultEncryptionSupport, VaultSupport, VaultInfo, } from 'vaultifier';
import { RoutePath } from './router';

interface IData {
  isInitializing: boolean,
  isLoggedIn: boolean,
  message?: string,
  encryptionSupport?: VaultEncryptionSupport,
  vaultSupport?: VaultSupport,
  vaultInfo?: VaultInfo,
  tdaFrontendUrl?: string,
  tdaBackendUrl?: string,
  isTDALoading: boolean,
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
    tdaFrontendUrl: undefined,
    tdaBackendUrl: undefined,
    isTDALoading: false,
  }),
  methods: {
    async initialize() {
      const vaultifier = await createVaultifier();

      this.tryInitializeVaultifier();

      const { searchParams } = new URL(window.location.href);
      const schema = searchParams.get('schemaDri');

      if (schema && this.$router.currentRoute.path !== RoutePath.SCHEMA_VIEW)
        this.$router.push(RoutePath.SCHEMA_VIEW);
    },
    async tryInitializeVaultifier() {
      const vaultifier = getVaultifier();
      this.isInitializing = true;

      try {
        this.vaultSupport = await vaultifier.getVaultSupport();

        if (!this.vaultSupport?.authentication) {
          this.isLoggedIn = true;
        }
        else if (vaultifier.hasCredentials()) {
          await vaultifier.initialize();

          this.isLoggedIn = await vaultifier.isValid();
        }

        this.encryptionSupport = await vaultifier.setEnd2EndEncryption(true);

        if (this.isLoggedIn)
          this.vaultInfo = await vaultifier.getVaultInfo();
      }
      catch {
        if (vaultifier.urls.baseUrl)
          this.message = `I'm not sure ${vaultifier.urls.baseUrl} is the correct endpoint I should connect to. Please check this again.`;
        else
          this.message = `I could not find any endpoint to connect to.`
      }

      if (this.isLoggedIn)
        await this.initializeTDA();

      this.isInitializing = false;
    },
    async initializeTDA() {
      this.isTDALoading = true;

      const vaultifier = await getVaultifier();

      const { content: configurationItems } = await vaultifier.getValues({
        // That's the dri of "ConfigurationItem", basically it's a key value pair
        schemaDri: '4ktjMzvwbhAeGM8Dwu67VcCnuJc52K3fVdq7V1qCPWLw',
      });

      const backend = configurationItems.find((x: any) => x.key === 'tda.backend.uri');
      const frontend = configurationItems.find((x: any) => x.key === 'tda.frontend.uri');

      if (backend && frontend) {
        this.tdaFrontendUrl = frontend.value as string;
        this.tdaBackendUrl = backend.value as string;

        if (vaultifier.credentials) {
          const { appKey, appSecret, scope } = vaultifier.credentials;
          const { oAuth } = await vaultifier.getVaultSupport();
          const { name } = await vaultifier.getVaultInfo();

          if (appKey && appSecret && oAuth) {
            const tdaService = TDAService.getInstance();
            tdaService.setTDAUrl(this.tdaBackendUrl);
            await tdaService.setupPDSSettings(
              vaultifier.urls.baseUrl,
              appKey,
              appSecret,
              oAuth.type,
              name,
              scope,
            );
          }
        }
      }

      this.isTDALoading = false;
    },
    async openTDA() {
      if (!this.tdaFrontendUrl || !this.tdaBackendUrl)
        return;

      this.isTDALoading = true;

      const tdaService = TDAService.getInstance();
      const url = await tdaService.createAdminInvitationUrl(this.tdaFrontendUrl);
      window.open(url);

      this.isTDALoading = false;
    },
    logIn(credentials: LoginData) {
      getVaultifier().setCredentials(credentials);
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
    hasTDA(): boolean {
      return !!(this.tdaFrontendUrl && this.tdaBackendUrl);
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
</style>