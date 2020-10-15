<template>
  <div class="container vert-container flex-container">
    <div class="flex-container ld-item">
      <section class="ld-item">
        <h2>Schemas</h2>
        <schema-list
          :items="schemaDRIs"
          :selected="selectedSchema"
          @select="selectSchema"
        ></schema-list>
      </section>
      <section class="ld-item">
        <h2>Items</h2>
        <data-list
          :items="vaultItems"
          :selected="selectedVaultItem"
          @select="selectVaultItem"
        ></data-list>
      </section>
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
import { MutationType } from '../store';
import { createList } from '../components/List.vue';
import DataVisualizer from '../components/DataVisualizer.vue';
import { Vaultifier, VaultItem, VaultMinMeta, VaultSchema } from 'vaultifier/dist/module';
import { renderForm } from '../utils';
import { ActionType } from '@/store/action-type';

interface IData {
  selectedSchema?: VaultSchema,
  selectedVaultItem?: VaultItem,
}

export default Vue.extend({
  created() {
    this.initialize();
  },
  data: (): IData => ({
    selectedSchema: undefined,
    selectedVaultItem: undefined,
  }),
  components: {
    DataVisualizer,
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
      let vaultItem: VaultItem | undefined;

      if (item)
        vaultItem = await getInstance().getItem({
          id: item.id,
        });

      this.selectedVaultItem = vaultItem;
    }
  },
  computed: {
    schemaDRIs(): VaultSchema[] {
      return this.$store.state.schemaDRI.all;
    },
    vaultItems(): VaultItem[] | undefined {
      return this.$store.state.vaultItem.all;
    },
    hasSelectedVaultItem(): boolean {
      return !!this.selectedVaultItem;
    },
  }
})
</script>

<style scoped>
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