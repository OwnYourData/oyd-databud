<template>
  <b-card no-body>
    <b-tabs
      pills
      card
    >
      <b-tab
        title="Raw Data"
        v-if="showRawView"
      >
        <raw-data :item="item"></raw-data>
      </b-tab>
      <b-tab
        title="OCA-Form"
        v-if="hasSchema"
      >
        <oca-edit-view
          :item="item"
          :schemaDri="schemaDri"
          :allowSelectSchema="false"
          :hasCancel="false"
          @save="saveVaultItem"
        ></oca-edit-view>
      </b-tab>
    </b-tabs>
  </b-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { VaultItem, VaultPostItem } from 'vaultifier';
import RawData from './RawData.vue';

import OcaEditView from '../components/OCAEditView.vue';
import { IStore } from '@/store';
import { ActionType } from '@/store/action-type';

export default Vue.extend({
  props: {
    item: Object as PropType<VaultItem>,
    showRawView: {
      default: true,
      type: Boolean as PropType<boolean>,
    },
  },
  components: {
    RawData,
    OcaEditView,
  },
  computed: {
    schemaDri(): string | undefined {
      return this.item.schemaDri;
    },
    hasSchema(): boolean {
      return !!this.schemaDri;
    }
  },
  methods: {
    saveVaultItem(item: VaultPostItem) {
      this.$store.dispatch(ActionType.UPDATE_VAULT_ITEM, item);
    }
  }
})
</script>