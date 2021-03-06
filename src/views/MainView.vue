<template>
  <div class="container">

    <b-card no-body>
      <b-tabs
        pills
        card
        lazy
        @activate-tab="handleActivateTab"
      >
        <b-tab title="Tables">
          <table-view />
        </b-tab>
        <b-tab title="Schemas">
          <schema-view @showEditView="handleShowEditView"></schema-view>
        </b-tab>
        <b-tab
          title="Repos"
          v-if="hasRepoSupport"
        >
          <repo-view></repo-view>
        </b-tab>
      </b-tabs>
    </b-card>

    <div
      class="center"
      v-if="isVaultItemLoading"
    >
      <Spinner></Spinner>
    </div>
    <data-visualizer
      class="data-visualizer"
      v-if="hasSelectedVaultItem"
      :item="selectedVaultItem"
      @selectVaultItem="selectVaultItem"
    ></data-visualizer>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { IStore, MutationType } from '../store';
import DataVisualizer from '../components/DataVisualizer.vue';
import Spinner from '../components/Spinner.vue';
import SchemaView from '../components/SchemaView.vue';
import RepoView from '../components/RepoView.vue';
import TableView from '../components/TableView.vue';
import { VaultItem, VaultMinMeta } from 'vaultifier/dist/module';
import { renderForm } from '../utils';
import { FetchState } from '@/store/fetch-state';

import { getInstance } from '@/services';
import { ActionType } from '@/store/action-type';

interface Data {
  hasRepoSupport: boolean,
}

export default Vue.extend({
  components: {
    DataVisualizer,
    Spinner,
    SchemaView,
    RepoView,
    TableView,
  },
  data: (): Data => ({
    hasRepoSupport: false,
  }),
  async created() {
    this.hasRepoSupport = (await getInstance().getVaultSupport()).repos;
  },
  computed: {
    selectedVaultItem(): VaultItem | undefined {
      return (this.$store.state as IStore).vaultItem.current;
    },
    hasSelectedVaultItem(): boolean {
      return !!this.selectedVaultItem;
    },
    isVaultItemLoading(): boolean {
      return (this.$store.state as IStore).vaultItem.currentState == FetchState.FETCHING;
    }
  },
  methods: {
    handleShowEditView(isShown: boolean) {
      if (isShown)
        this.$store.commit(MutationType.SET_VAULT_ITEM, undefined);
    },
    handleActivateTab() {
      this.$store.dispatch(ActionType.RESET_VAULT_ITEMS);
    },
    selectVaultItem(item: VaultMinMeta) {
      this.$store.dispatch(ActionType.FETCH_VAULT_ITEM, item);
    }
  }
})
</script>

<style scoped>
.center {
  display: flex;
  justify-content: center;
}

.data-visualizer {
  margin-top: 1em;
}
</style>