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
          :isSaving="isSaving"
          @save="saveVaultItem"
        ></oca-edit-view>
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
    </b-tabs>
  </b-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { VaultItem, VaultMinMeta, VaultPostItem } from 'vaultifier';
import RawData from './RawData.vue';

import OcaEditView from '../components/OCAEditView.vue';
import RelationsView from '../components/RelationsView.vue';
import { IStore } from '@/store';
import { ActionType } from '@/store/action-type';

interface Data {
  isSaving: boolean;
  activeTabIndex: number;
  totalRelations: number;
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
  }),
  components: {
    RawData,
    OcaEditView,
    RelationsView,
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
    async saveVaultItem(item: VaultPostItem) {
      this.isSaving = true;
      await this.$store.dispatch(ActionType.UPDATE_VAULT_ITEM, item);
      this.isSaving = false;
    },
    selectVaultItem(id: number) {
      this.$emit('selectVaultItem', {
        id,
      } as VaultMinMeta);

      // if new vault item was set through clicking on a relation
      // we want to show the first tab so the user notices something has changed
      this.activeTabIndex = 0;
    }
  },
})
</script>