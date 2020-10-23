<template>
  <div class="row">
    <section class="col-md-4">
      <repo-list
        class="list"
        :items="repos"
        :isLoading="isRepoListLoading"
        :selected="selectedRepo"
        @select="selectRepo"
      ></repo-list>
    </section>
    <section class="col-md-8">
      <data-list
        class="list"
        :items="vaultItems"
        :isLoading="isVaultItemListLoading"
        :selected="selectedVaultItem"
        @select="selectVaultItem"
      ></data-list>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { IStore } from '../store';
import { createList } from '../components/List.vue';
import { Vaultifier, VaultItem, VaultMinMeta, VaultRepo, VaultSchema } from 'vaultifier/dist/module';
import { ActionType } from '@/store/action-type';
import { FetchState } from '@/store/fetch-state';

interface IData {
  selectedRepo?: VaultRepo,
}

export default Vue.extend({
  mounted() {
    this.initialize();
  },
  data: (): IData => ({
    selectedRepo: undefined,
  }),
  components: {
    RepoList: createList<VaultRepo>({
      getTitle: (item) => item.name,
      getId: (item) => item.id.toString(),
    }),
    DataList: createList<VaultItem>({
      getTitle: (item) => item.id.toString(),
      getId: (item) => item.id.toString(),
    }),
  },
  methods: {
    async initialize() {
      this.$store.dispatch(ActionType.FETCH_REPOS);
    },
    async selectRepo(item?: VaultRepo) {
      this.selectedRepo = item;

      this.$store.dispatch(ActionType.FETCH_VAULT_ITEMS_BY_REPO, item);
    },
    async selectVaultItem(item?: VaultMinMeta) {
      this.$store.dispatch(ActionType.FETCH_VAULT_ITEM, item);
    }
  },
  computed: {
    store(): IStore {
      return this.$store.state as IStore;
    },
    repos(): VaultRepo[] | undefined {
      return this.store.repo.all;
    },
    isRepoListLoading(): boolean {
      return this.store.repo.state === FetchState.FETCHING;
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
  }
})
</script>

<style scoped>
.list {
  max-height: 250px;
  overflow-y: auto;
}
</style>