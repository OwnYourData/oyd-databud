<template>
  <div class="row">
    <section class="col-md-4">
      <inline-group>
        <custom-button
          type="refresh"
          @click="fetchSchemas"
        ></custom-button>
      </inline-group>
      <schema-list
        class="list"
        :items="schemaDRIs"
        :isLoading="isSchemaListLoading"
        :selected="selectedSchema"
        @select="selectSchema"
      ></schema-list>
    </section>
    <section class="col-md-8">
      <inline-group>
        <custom-button
          @click="fetchVaultItems"
          type="refresh"
        ></custom-button>
        <custom-button @click="addItem">New</custom-button>
        <custom-button
          type="danger"
          @click="deleteSelectedVaultItem"
          :disabled="isDeleteButtonDisabled"
        >Delete</custom-button>
      </inline-group>
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
      class="col-md-12 oca-edit-view"
      :schemaDri="editViewSchemaDri"
      :isSaving="isSaving"
      @save="saveVaultItem"
      @cancel="() => _showEditView(false)"
    ></oca-edit-view>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { IStore } from '../store';
import { createList } from '../components/List.vue';
import CustomButton from '../components/Button.vue';
import OcaEditView from '../components/OCAEditView.vue';
import InlineGroup from '../components/InlineGroup.vue';
import { Vaultifier, VaultItem, VaultMinMeta, VaultPostItem, VaultSchema } from 'vaultifier/dist/module';
import { ActionType } from '@/store/action-type';
import { FetchState } from '@/store/fetch-state';

interface IData {
  selectedSchema?: VaultSchema,
  showEditView: boolean,
  editViewSchema?: VaultSchema,
  isSaving: boolean,
}

export default Vue.extend({
  mounted() {
    this.initialize();
  },
  data: (): IData => ({
    selectedSchema: undefined,
    showEditView: false,
    editViewSchema: undefined,
    isSaving: false,
  }),
  components: {
    CustomButton,
    OcaEditView,
    InlineGroup,
    SchemaList: createList<VaultSchema>({
      getTitle: (item) => item.title || item.dri,
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
      this.selectVaultItem(undefined);
      this._showEditView(true);
    },
    async saveVaultItem(postItem: VaultPostItem) {
      this.isSaving = true;
      await this.$store.dispatch(ActionType.UPDATE_VAULT_ITEM, postItem);

      this.fetchVaultItems();
      this._showEditView(false);
      this.isSaving = false;
    },
    _showEditView(show: boolean) {
      this.showEditView = show;
      this.editViewSchema = this.selectedSchema;

      this.$emit('showEditView', this.showEditView);
    },
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
    editViewSchemaDri(): string | undefined {
      return this.editViewSchema?.dri;
    }
  }
})
</script>

<style scoped>
.list {
  max-height: 250px;
  overflow-y: auto;
}

.oca-edit-view {
  margin-top: 2em;
}
</style>