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
      <list
        :isLoading="isVaultItemListLoading"
        :totalItems="totalVaultItems"
        :currentPage="currentVaultPage"
        :pageItems="vaultPageItems"
        @refresh="fetchVaultItems"
      >
        <b-list-group-item
          v-for="item of vaultItems"
          :key="item.id"
          :active="selectedVaultItem && item.id === selectedVaultItem.id"
          @click="() => selectVaultItem(item)"
        >
          {{item.id}}
        </b-list-group-item>
      </list>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { IFetchVaultItems, IStore } from '../store';
import List, { RefreshObj } from '../components/List.vue';
import { Vaultifier, VaultItem, VaultMinMeta, VaultTable } from 'vaultifier/dist/module';
import { ActionType } from '@/store/action-type';
import { FetchState } from '@/store/fetch-state';

interface IData {
  selectedTable?: VaultTable,
}

export default Vue.extend({
  mounted() {
    this.initialize();
  },
  data: (): IData => ({
    selectedTable: undefined,
  }),
  components: {
    List,
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
    async fetchVaultItems(refreshObj?: RefreshObj) {
      const fetchObj: IFetchVaultItems = {
        table: this.selectedTable,
        page: refreshObj?.page,
      };

      this.$store.dispatch(ActionType.FETCH_VAULT_ITEMS, fetchObj);
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