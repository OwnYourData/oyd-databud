<template>
  <div class="row">
    <section class="col-md-4">
      <schema-list
        class="list"
        :items="schemaDRIs"
        :isLoading="isSchemaListLoading"
        :selected="selectedSchema"
        @select="selectSchema"
      ></schema-list>
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
import { Vaultifier, VaultItem, VaultMinMeta, VaultSchema } from 'vaultifier/dist/module';
import { ActionType } from '@/store/action-type';
import { FetchState } from '@/store/fetch-state';

interface IData {
  selectedSchema?: VaultSchema,
}

export default Vue.extend({
  mounted() {
    this.initialize();
  },
  data: (): IData => ({
    selectedSchema: undefined,
  }),
  components: {
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

      this.$store.dispatch(ActionType.FETCH_VAULT_ITEMS_BY_SCHEMA, schema);
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
  }
})
</script>

<style scoped>
.list {
  max-height: 250px;
  overflow-y: auto;
}
</style>