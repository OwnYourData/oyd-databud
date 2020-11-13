<template>
  <div class="row">
    <section class="col-md-4">
      <inline-group>
        <refresh-button
          @click="fetchRepos"
          type="refresh"
        ></refresh-button>
      </inline-group>
      <repo-list
        class="list"
        :items="repos"
        :isLoading="isRepoListLoading"
        :selected="selectedRepo"
        @select="selectRepo"
      ></repo-list>
    </section>
    <section class="col-md-8">
      <inline-group>
        <refresh-button
          @click="fetchVaultItems"
          type="refresh"
        ></refresh-button>
      </inline-group>
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
import RefreshButton from '../components/Button.vue';
import InlineGroup from '../components/InlineGroup.vue';
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
    RefreshButton,
    InlineGroup,
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
      this.fetchRepos();
    },
    async selectRepo(item?: VaultRepo) {
      this.selectedRepo = item;

      this.fetchVaultItems();
    },
    async selectVaultItem(item?: VaultMinMeta) {
      this.$store.dispatch(ActionType.FETCH_VAULT_ITEM, item);
    },
    async fetchRepos() {
      this.selectedRepo = undefined;
      this.$store.dispatch(ActionType.FETCH_REPOS);
    },
    async fetchVaultItems() {
      this.$store.dispatch(ActionType.FETCH_VAULT_ITEMS_BY_REPO, this.selectedRepo);
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