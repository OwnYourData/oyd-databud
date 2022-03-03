<template>
  <b-card no-body>
    <b-tabs
      pills
      card
      v-model="activeTabIndex"
    >
      <b-tab
        title="Raw Data"
        v-if="showRawView"
      >
        <raw-data
          :item="item"
          :isSaving="isSaving"
          @save="saveVaultItem"
        ></raw-data>
      </b-tab>
      <b-tab
        title="Form"
        v-if="hasSchema"
      >
        <form-edit-view
          :item="item"
          :schemaDri="schemaDri"
          :allowSelectSchema="false"
          :hasCancel="false"
          :isSaving="isSaving"
          @save="saveVaultItem"
        ></form-edit-view>
      </b-tab>
      <b-tab
        title="Relations"
        :disabled="totalRelations === 0"
      >
        <relations-view
          :item="item"
          @update="(down, up) => totalRelations = down.length + up.length"
          @selectId="selectVaultItem"
        />
      </b-tab>
      <b-tab title="Sign">
        <div class="flex-container">
          <b-img
            class="signature-logo"
            :src="handySignaturLogo"
          />
          <span>
            Sign this data item with A-TRUST Handy-Signatur.<br>
            The following data that will be signed:
          </span>
          <b-button
            @click="signItem"
            class="sign-button"
            variant="primary"
          >Sign
            <b-spinner v-if="isSigning" />
          </b-button>
        </div>
        <handy-signatur-form
          ref="handySignaturForm"
          :item="item"
        />
        <b-alert
          v-model="hasSignError"
          variant="danger"
        >
          There was an error while trying to sign the data item.
        </b-alert>
        <raw-json :data="item.raw" />

      </b-tab>
    </b-tabs>
  </b-card>
</template>

<style scoped>
.flex-container {
  display: flex;
  align-items: center;
  margin-bottom: 2em;
}

.signature-logo {
  margin-right: 2em;
  max-width: 4em;
}

.sign-button {
  margin-left: auto;
}
</style>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { VaultItem, VaultMinMeta, VaultPostItem } from 'vaultifier';
import RawData from './RawData.vue';

import FormEditView from './FormEditView.vue';
import RelationsView from './RelationsView.vue';
import HandySignaturForm from './HandySignaturForm.vue';

import { ActionType } from '@/store/action-type';
import RawJson from './RawJson.vue';

interface Data {
  isSaving: boolean;
  activeTabIndex: number;
  totalRelations: number;
  hasSignError: boolean;
  isSigning: boolean;
}

export default Vue.extend({
  props: {
    item: Object as PropType<VaultItem>,
    showRawView: {
      default: true,
      type: Boolean as PropType<boolean>,
    },
  },
  data: (): Data => ({
    isSaving: false,
    activeTabIndex: 0,
    totalRelations: 0,
    hasSignError: false,
    isSigning: false,
  }),
  components: {
    RawData,
    FormEditView,
    RelationsView,
    HandySignaturForm,
    RawJson,
  },
  computed: {
    schemaDri(): string | undefined {
      return this.item.schemaDri;
    },
    hasSchema(): boolean {
      return !!this.schemaDri;
    },
    handySignaturLogo(): string {
      return require('../assets/handysign_logo.jpg');
    }
  },
  methods: {
    async saveVaultItem(item: VaultPostItem) {
      this.isSaving = true;

      try {
        await this.$store.dispatch(ActionType.UPDATE_VAULT_ITEM, item);
      } catch {
        /* TODO: Error handling */
      }

      this.isSaving = false;
    },
    selectVaultItem(id: number) {
      this.$emit('selectVaultItem', {
        id,
      } as VaultMinMeta);

      // if new vault item was set through clicking on a relation
      // we want to show the first tab so the user notices something has changed
      this.activeTabIndex = 0;
    },
    async signItem() {
      this.hasSignError = false;
      this.isSigning = true;

      await (this.$refs.handySignaturForm as any).sign();

      // if .sign() fulfills the promise, something went wrong
      // signing always leaves the current browser page that's why the promise will not be resolved, if everything goes according to plan :-)
      this.hasSignError = true;
      this.isSigning = false;
    }
  },
})
</script>