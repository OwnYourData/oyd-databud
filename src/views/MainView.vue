<template>
  <div class="container">

    <card-panel>
      <panel-tab title="Schemas">
        <schema-view></schema-view>
      </panel-tab>
      <panel-tab
        title="Repos"
        v-if="hasRepoSupport"
      >
        <repo-view></repo-view>
      </panel-tab>
    </card-panel>

    <div
      class="center"
      v-if="isVaultItemLoading"
    >
      <Spinner></Spinner>
    </div>
    <data-visualizer
      v-if="hasSelectedVaultItem"
      :item="selectedVaultItem"
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
import { VaultItem } from 'vaultifier/dist/module';
import { renderForm } from '../utils';
import { FetchState } from '@/store/fetch-state';

import CardPanel from '../components/CardPanel.vue';
import PanelTab from '../components/PanelTab.vue';
import { getInstance } from '@/services';

interface Data {
  hasRepoSupport: boolean,
}

export default Vue.extend({
  components: {
    CardPanel,
    PanelTab,
    DataVisualizer,
    Spinner,
    SchemaView,
    RepoView
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
  }
})
</script>

<style scoped>
.center {
  display: flex;
  justify-content: center;
}

.vert-container {
  display: flex;
  flex-direction: column;
}

.vert-container > .ld-item:nth-of-type(2) {
  margin-left: 0;
  margin-top: 2em;
}
</style>