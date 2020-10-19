<template>
  <div class="container vert-container flex-container">
    <div class="row ld-item">
      <section class="col-md-4">
        <h2>Schemas</h2>
        <schema-list
          :items="schemaDRIs"
          :isLoading="isSchemaListLoading"
          :selected="selectedSchema"
          @select="selectSchema"
        ></schema-list>
      </section>
      <section class="col-md-8">
        <h2>Items</h2>
        <data-list
          :items="vaultItems"
          :isLoading="isVaultItemListLoading"
          :selected="selectedVaultItem"
          @select="selectVaultItem"
        ></data-list>
      </section>
    </div>

    <div
      class="center"
      v-if="isVaultItemLoading"
    >
      <Spinner></Spinner>
    </div>
    <data-visualizer
      class="ld-item"
      v-if="hasSelectedVaultItem"
      :item="selectedVaultItem"
    ></data-visualizer>
  </div>
</template>

<script lang="ts">
import { getInstance } from '../services';
import Vue from 'vue';
import { IStore, MutationType } from '../store';
import { createList } from '../components/List.vue';
import DataVisualizer from '../components/DataVisualizer.vue';
import Spinner from '../components/Spinner.vue';
import { Vaultifier, VaultItem, VaultMinMeta, VaultSchema } from 'vaultifier/dist/module';
import { renderForm } from '../utils';
import { ActionType } from '@/store/action-type';
import { FetchState } from '@/store/fetch-state';

interface IData {
  selectedSchema?: VaultSchema,
}

export default Vue.extend({
  created() {
    this.initialize();
  },
  data: (): IData => ({
    selectedSchema: undefined,
  }),
  components: {
    DataVisualizer,
    Spinner,
    SchemaList: createList<VaultSchema>({
      getTitle: (item) => item.dri,
      getId: (item) => item.dri,
    }),
    DataList: createList<VaultItem>({
      getTitle: (item) => item.id.toString(),
      getId: (item) => item.id.toString(),
    }),
  },
  methods: {
    async initialize() {
      this.$store.dispatch(ActionType.FETCH_SCHEMA_DRIS);
    },
    async selectSchema(schema: VaultSchema) {
      this.selectedSchema = schema;

      this.$store.dispatch(ActionType.FETCH_VAULT_ITEMS, schema);
    },
    async selectVaultItem(item?: VaultMinMeta) {
      this.$store.dispatch(ActionType.FETCH_VAULT_ITEM, item);
    }
  },
  computed: {
    schemaDRIs(): VaultSchema[] {
      return this.$store.state.schemaDRI.all;
    },
    isSchemaListLoading(): boolean {
      return (this.$store.state as IStore).schemaDRI.state === FetchState.FETCHING;
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

.flex-container {
  display: flex;
}

.ld-item:nth-of-type(1) {
  flex: 1;
}

.ld-item:nth-of-type(2) {
  flex: 2;
  margin-left: 2em;
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