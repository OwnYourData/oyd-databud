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
          :items="dataItems"
          :selected="selectedDataItem"
          @select="selectDataItem"
        ></data-list>
      </section>
    </div>

    <data-view
      class="ld-item"
      v-if="hasSelectedDataItem"
      :item="selectedDataItem"
    ></data-view>
  </div>
</template>

<script lang="ts">
import { getInstance } from '../services';
import Vue from 'vue';
import { MutationType } from '../store';
import { createList } from '../components/List.vue';
import DataView from '../components/DataView.vue';
import { Vaultifier, VaultItem, VaultMinMeta, VaultSchema } from 'vaultifier/dist/module';
import { renderForm } from '../utils';

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
    DataView,
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
      this.$store.commit(MutationType.SET_SCHEMA_DRIS, await getInstance().getSchemas());
    },
    async selectSchema(schema: VaultSchema) {
      this.selectedSchema = schema;

      this.$store.commit(MutationType.SET_DATA_ITEMS, await getInstance().getValues({
        schemaDri: schema.dri,
      }));
    },
    async selectDataItem(item?: VaultMinMeta) {
      let vaultItem: VaultItem | undefined;

      if (item)
        vaultItem = await getInstance().getItem({
          id: item.id,
        });

      this.$store.commit(MutationType.SET_SELECTED_DATA_ITEM, vaultItem);
    }
  },
  computed: {
    schemaDRIs(): VaultSchema[] {
      return this.$store.state.schemaDRIs;
    },
    dataItems(): VaultItem[] | undefined {
      return this.$store.state.dataItems;
    },
    selectedDataItem(): VaultItem | undefined {
      return this.$store.state.selectedDataItem;
    },
    hasSelectedDataItem(): boolean {
      return !!this.selectedDataItem;
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