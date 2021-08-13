<template>
  <div class="row">
    <section class="col-md-4">
      <list
        :isLoading="isTableListLoading"
        @refresh="fetchTables"
      >
        <b-list-group-item
          v-for="item of tables"
          :key="item.id"
          :active="selectedTable && item.id === selectedTable.id"
          @click="() => selectTable(item)"
        >{{item.id}}</b-list-group-item>
      </list>
    </section>
    <section class="col-md-8">
      <b-tabs
        content-class="mt-3"
        @activate-tab="handleActivateTab"
        v-model="selectedTabIndex"
        lazy
      >
        <b-tab title="Data Items">
          <list
            :isLoading="isVaultItemListLoading"
            :totalItems="totalVaultItems"
            :currentPage="currentVaultPage"
            :pageItems="vaultPageItems"
            @refresh="fetchVaultItems"
          >
            <template v-slot:header-end>
              <custom-button
                type="danger"
                @click="deleteSelectedVaultItem"
                :disabled="isDeleteButtonDisabled"
              >Delete</custom-button>
            </template>

            <b-list-group-item
              v-for="item of vaultItems"
              :key="item.id"
              :active="selectedVaultItem && item.id === selectedVaultItem.id"
              @click="() => selectVaultItem(item)"
            >
              {{item.id}}
            </b-list-group-item>
          </list>
        </b-tab>
        <b-tab title="Charts">
          <b-input-group prepend="Item Count">
            <b-input v-model="dataItemCount" />
          </b-input-group>

          <chart-visualizer :items="vaultItems">
          </chart-visualizer>
        </b-tab>
      </b-tabs>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { IFetchVaultItems, IStore } from '../store';
import List from '../components/List.vue';
import CustomButton from '../components/Button.vue';
import { VaultItem, VaultMinMeta, VaultTable } from 'vaultifier/dist/module';
import { ActionType } from '@/store/action-type';
import { FetchState } from '@/store/fetch-state';
import ChartVisualizer from './ChartVisualizer.vue';

interface IData {
  selectedTable?: VaultTable,
  selectedTabIndex: number,
  dataItemCount: number,
}

export default Vue.extend({
  mounted() {
    this.initialize();
  },
  data: (): IData => ({
    selectedTable: undefined,
    selectedTabIndex: 0,
    dataItemCount: 50,
  }),
  components: {
    List,
    CustomButton,
    ChartVisualizer,
  },
  methods: {
    async initialize() {
      this.fetchTables();
    },
    async selectTable(item?: VaultTable) {
      this.selectedTable = item;

      this.fetchVaultItems();
    },
    async selectVaultItem(item?: VaultMinMeta) {
      this.$store.dispatch(ActionType.FETCH_VAULT_ITEM, item);
    },
    async fetchTables() {
      this.selectedTable = undefined;
      this.$store.dispatch(ActionType.FETCH_TABLES);
    },
    async fetchVaultItems(refreshObj?: IFetchVaultItems) {
      const isChart = this.selectedTabIndex === 1;

      refreshObj = {
        ...refreshObj,
        table: this.selectedTable,
        // we only want to fetch all the content if we display charts
        fetchContent: isChart,
      };

      if (isChart) {
        refreshObj.size = this.dataItemCount;
      }

      this.$store.dispatch(ActionType.FETCH_VAULT_ITEMS, refreshObj);
    },
    async deleteSelectedVaultItem() {
      await this.$store.dispatch(ActionType.DELETE_VAULT_ITEM, this.selectedVaultItem);
      this.fetchTables();
    },
    async handleActivateTab() {
      this.selectedTable = undefined;
      this.$store.dispatch(ActionType.RESET_VAULT_ITEMS);
    }
  },
  computed: {
    store(): IStore {
      return this.$store.state as IStore;
    },
    tables(): VaultTable[] {
      return this.store.table.all;
    },
    isTableListLoading(): boolean {
      return this.store.table.state === FetchState.FETCHING;
    },
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
    isDeleteButtonDisabled(): boolean {
      return !this.hasSelectedVaultItem;
    },
    currentVaultPage(): number | undefined {
      return (this.$store.state as IStore).vaultItem.paging?.current;
    },
    totalVaultItems(): number | undefined {
      return (this.$store.state as IStore).vaultItem.paging?.totalItems;
    },
    vaultPageItems(): number | undefined {
      return (this.$store.state as IStore).vaultItem.paging?.pageItems;
    }
  }
})
</script>