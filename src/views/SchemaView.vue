<template>
  <div class="container">
    <div class="row">
      <div class="col-md-4">
        <data-list
          class="list"
          :items="vaultItems"
          :isLoading="isVaultItemListLoading"
          :selected="selectedVaultItem"
          @select="selectVaultItem"
        ></data-list>
      </div>
      <div class="col-md-8">
        <data-visualizer
          v-if="hasSelectedVaultItem"
          :showRawView="false"
          :item="selectedVaultItem"
        ></data-visualizer>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { VaultItem, VaultMinMeta, VaultSchema } from 'vaultifier';
import { createList } from '../components/List.vue';
import DataVisualizer from '../components/DataVisualizer.vue';
import { IStore } from '@/store';
import { FetchState } from '@/store/fetch-state';
import { ActionType } from '@/store/action-type';

export default Vue.extend({
  props: {
    schemaDri: String as PropType<string>,
  },
  components: {
    DataVisualizer,
    DataList: createList<VaultItem>({
      getTitle: (item) => item.id.toString(),
      getId: (item) => item.id.toString(),
    }),
  },
  created() {
    this.initialize();
  },
  methods: {
    async initialize() {
      this.fetchVaultItems();
    },
    async selectVaultItem(item?: VaultMinMeta) {
      this.$store.dispatch(ActionType.FETCH_VAULT_ITEM, item);
    },
    async fetchVaultItems() {
      this.$store.dispatch(ActionType.FETCH_VAULT_ITEMS_BY_SCHEMA, { dri: this.schemaDri });
    }
  },
  computed: {
    vaultItems(): VaultItem[] | undefined {
      return this.$store.state.vaultItem.all;
    },
    isVaultItemListLoading(): boolean {
      return (this.$store.state as IStore).vaultItem.allState === FetchState.FETCHING;
    },
    selectedVaultItem(): VaultItem | undefined {
      return (this.$store.state as IStore).vaultItem.current;
    },
    hasSelectedVaultItem(): boolean {
      return !!this.selectedVaultItem;
    },
  }
})
</script>