<template>
  <div class="row">
    <section class="col-md-4">
      <custom-button @click="fetchSchemas">Refresh</custom-button>
      <schema-list
        class="list"
        :items="schemaDRIs"
        :isLoading="isSchemaListLoading"
        :selected="selectedSchema"
        @select="selectSchema"
      ></schema-list>
    </section>
    <section class="col-md-8">
      <custom-button @click="fetchVaultItems">Refresh</custom-button>
      <custom-button
        @click="addItem"
        :disabled="isAddItemButtonDisabled"
      >New</custom-button>
      <custom-button
        type="danger"
        @click="deleteSelectedVaultItem"
        :disabled="isDeleteButtonDisabled"
      >Delete</custom-button>
      <data-list
        class="list"
        :items="vaultItems"
        :isLoading="isVaultItemListLoading"
        :selected="selectedVaultItem"
        @select="selectVaultItem"
      ></data-list>
    </section>
    <oca-edit-view
      v-if="showEditView"
      class="col-md-12"
      :schemaDri="selectedSchema.dri"
      @save="saveVaultItem"
      @cancel="hideEditView"
    ></oca-edit-view>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { IStore } from '../store';
import { createList } from '../components/List.vue';
import CustomButton from '../components/Button.vue';
import OcaEditView from '../components/OCAEditView.vue';
import { Vaultifier, VaultItem, VaultMinMeta, VaultPostItem, VaultSchema } from 'vaultifier/dist/module';
import { ActionType } from '@/store/action-type';
import { FetchState } from '@/store/fetch-state';

interface IData {
  selectedSchema?: VaultSchema,
  showEditView: boolean,
}

export default Vue.extend({
  mounted() {
    this.initialize();
  },
  data: (): IData => ({
    selectedSchema: undefined,
    showEditView: false,
  }),
  components: {
    CustomButton,
    OcaEditView,
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
      this.fetchSchemas();
    },
    async selectSchema(schema: VaultSchema) {
      this.selectedSchema = schema;

      this.fetchVaultItems();
    },
    async selectVaultItem(item?: VaultMinMeta) {
      this.$store.dispatch(ActionType.FETCH_VAULT_ITEM, item);
    },
    async fetchSchemas() {
      this.selectedSchema = undefined;
      this.$store.dispatch(ActionType.FETCH_SCHEMA_DRIS);
    },
    async fetchVaultItems() {
      this.$store.dispatch(ActionType.FETCH_VAULT_ITEMS_BY_SCHEMA, this.selectedSchema);
    },
    async deleteSelectedVaultItem() {
      await this.$store.dispatch(ActionType.DELETE_VAULT_ITEM, this.selectedVaultItem);
      this.fetchSchemas();
    },
    async addItem() {
      if (!this.selectedSchema)
        return;

      this.selectVaultItem(undefined);
      this.showEditView = true;
    },
    async saveVaultItem(postItem: VaultPostItem) {
      await this.$store.dispatch(ActionType.UPDATE_VAULT_ITEM, postItem);

      this.fetchVaultItems();
      this.hideEditView();
    },
    hideEditView() {
      this.showEditView = false;
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
    isDeleteButtonDisabled(): boolean {
      return !this.hasSelectedVaultItem;
    },
    hasSelectedSchema(): boolean {
      return !!this.selectedSchema;
    },
    isAddItemButtonDisabled(): boolean {
      return !this.hasSelectedSchema;
    }
  }
})
</script>

<style scoped>
.list {
  max-height: 250px;
  overflow-y: auto;
}
</style>