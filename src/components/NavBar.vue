<template>
  <b-navbar
    toggleable="lg"
    type="dark"
    variant="dark"
  >
    <b-navbar-brand>DataBud</b-navbar-brand>
    <b-nav-text>v{{version}}</b-nav-text>
    <b-nav-text>{{encryptionMessage}}</b-nav-text>

    <b-navbar-nav class="ml-auto">
      <b-nav-item-dropdown
        right
        v-if="actions && actions.length > 0"
        :disabled="!!workingAction"
      >
        <template #button-content>
          <b-icon
            icon="gear"
            :animation="gearAnimation"
            aria-label="Settings"
          ></b-icon>
          <span class="ml-1">{{workingActionTitle}}</span>
        </template>
        <b-dropdown-item
          href="#"
          v-for="act of actions"
          :key="act.key"
          @click="() => executeAction(act)"
        >{{act.title}}</b-dropdown-item>

      </b-nav-item-dropdown>
    </b-navbar-nav>
  </b-navbar>
</template>

<script lang="ts">
import { getInstance } from '@/services';
import { VaultEncryptionSupport } from 'vaultifier';
import Vue, { PropType } from 'vue'

import { ConfigService, PACKAGE } from '../services/config-service';

interface Action {
  key: string,
  title: string,
  url: string,
  usesAuth: boolean,
  method: string,
}

interface Data {
  workingAction?: Action,
}

export default Vue.extend({
  props: {
    encryptionSupport: Object as PropType<VaultEncryptionSupport>,
    settingsActions: Array as PropType<string[]>,
  },
  data: (): Data => ({
    workingAction: undefined,
  }),
  methods: {
    async executeAction(action: Action) {
      this.workingAction = action;

      const { key, title, method, url, usesAuth } = action;
      const vaultifier = getInstance();
      const baseUrlPlaceholder = '{{base_url}}'

      try {
        if (url.indexOf(baseUrlPlaceholder) !== -1) {
          const vaultifierUrl = url.replace(baseUrlPlaceholder, '');

          if (method === 'POST')
            await vaultifier.post(vaultifierUrl, usesAuth);
          else if (method === 'GET')
            await vaultifier.get(vaultifierUrl, usesAuth);
          else
            throw new Error(`Invalid method for action ${key}`);
        }
        else {
          const req = await fetch(url, { method });
          await req.text();
        }

        this.$bvModal.msgBoxOk(`The action "${title}" was executed succssfully.`);
      } catch {
        this.$bvModal.msgBoxOk(`The action "${title}" has failed.`);
      }

      this.workingAction = undefined;
    }
  },
  computed: {
    version() {
      return PACKAGE.version;
    },
    encryptionMessage(): string {
      if (!this.encryptionSupport)
        return '';

      const { supportsEncryption, supportsDecryption } = this.encryptionSupport;

      if (supportsEncryption && supportsDecryption)
        return 'encryption/decryption supported';
      else if (!supportsEncryption && !supportsDecryption)
        return 'encryption/decryption not supported';
      else
        return `encryption ${!supportsEncryption ? 'not' : ''} supported/decryption ${!supportsDecryption ? 'not' : ''} supported`
    },
    actions(): Action[] {
      const actionsObj = ConfigService.get('settings', 'actions');
      const arr: Action[] = []

      for (const key in actionsObj) {
        arr.push({
          usesAuth: false,
          ...actionsObj[key],
          key,
        });
      }

      return arr;
    },
    gearAnimation() {
      return this.workingAction ? 'spin' : undefined;
    },
    workingActionTitle() {
      return this.workingAction?.title;
    }
  }
})
</script>

<style scoped>
.navbar {
  margin-bottom: 1em;
}

.navbar-text {
  margin-right: 1em;
}
</style>