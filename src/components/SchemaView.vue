<template>
  <div class="row">
    <section class="col-md-4">
      <list
        :isLoading="isSchemaListLoading"
        @refresh="fetchSchemas"
      >
        <b-list-group-item
          v-for="item of schemaDRIs"
          :key="item.dri"
          :active="selectedSchema && item.dri === selectedSchema.dri"
          @click="() => selectSchema(item)"
        >
          {{item.title || item.dri}}
        </b-list-group-item>
      </list>
    </section>
    <section class="col-md-8">
      <list
        :isLoading="isVaultItemListLoading"
        :totalItems="totalVaultItems"
        :currentPage="currentVaultPage"
        :pageItems="vaultPageItems"
        @refresh="fetchVaultItems"
      >
        <template v-slot:header-end>
          <custom-button @click="addItem">New</custom-button>
          <custom-button
            v-for="action of actions"
            :key="action.key"
            @click="executeAction(action)"
            :type="isExecutingAction ? 'success-outline' : 'success'"
            :disabled="isExecutingAction"
          >
            <spinner v-if="isExecutingAction" />
            <template v-else>
              {{action.title}}
            </template>
          </custom-button>
          <custom-button
            type="danger"
            @click="deleteSelectedVaultItem"
            :disabled="isDeleteButtonDisabled"
          >Delete</custom-button>
        </template>
        <b-list-group-item
          v-for="item of vaultItems"
          :key="item.id"
          :active="selectedVaultItem && item.id === selectedVaultItem.id"
          @click="() => selectVaultItem(item)"
        >
          {{item.id}}
        </b-list-group-item>
      </list>
    </section>
    <b-container v-if="showEditView">
      <b-alert
        v-if="saveMessage"
        show
        variant="danger"
      >
        {{saveMessage}}
      </b-alert>
      <oca-edit-view
        class="col-md-12 oca-edit-view"
        :schemaDri="editViewSchemaDri"
        :isSaving="isSaving"
        @save="saveVaultItem"
        @cancel="() => _showEditView(false)"
      ></oca-edit-view>
    </b-container>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { IFetchVaultItems, IStore } from '../store';
import List, { RefreshObj } from '../components/List.vue';
import CustomButton from '../components/Button.vue';
import OcaEditView from './FormEditView.vue';
import { Vaultifier, VaultItem, VaultMinMeta, VaultPostItem, VaultSchema } from 'vaultifier/dist/module';
import { ActionType } from '@/store/action-type';
import { FetchState } from '@/store/fetch-state';
import { getInstance } from '@/services';
import Spinner from './Spinner.vue';
import { ConfigService } from '@/services/config-service';
import { NetworkResponse } from 'vaultifier/dist/module/communicator';
import { Action, executeAction, getActionsFromConfig } from '@/utils/actions';

interface IData {
  selectedSchema?: VaultSchema,
  showEditView: boolean,
  editViewSchema?: VaultSchema,
  isSaving: boolean,
  isExecutingAction: boolean,
  saveMessage?: string,
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
    isExecutingAction: false,
    saveMessage: undefined,
  }),
  components: {
    CustomButton,
    OcaEditView,
    List,
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
    async fetchVaultItems(refreshObj?: RefreshObj) {
      let fetchObj: IFetchVaultItems = {
        schema: this.selectedSchema,
        page: refreshObj?.page,
      };

      this.$store.dispatch(ActionType.FETCH_VAULT_ITEMS, fetchObj);
    },
    async deleteSelectedVaultItem() {
      await this.$store.dispatch(ActionType.DELETE_VAULT_ITEM, this.selectedVaultItem);
      this.fetchSchemas();
    },
    async addItem() {
      this.selectVaultItem(undefined);
      this._showEditView(true);
    },
    async executeAction(action: Action) {
      this.isExecutingAction = true;

      const vaultifier = getInstance();
      const state = this.$store.state as IStore;
      let response: NetworkResponse | undefined;

      try {
        response = await executeAction(action, vaultifier, this);
      } catch (e) {
        console.error(e);
      }

      if (response) {
        const vaultItemId = response.data.id;
        const vaultItem = await vaultifier.getItem({ id: vaultItemId });

        if (!vaultItem.schemaDri) {
          console.error('Vault item does not have schema DRI!');
        } else {
          await this.fetchSchemas();
          const schema = state.schemaDRI.all.find(x => x.dri === vaultItem.schemaDri);

          if (!schema) {
            console.error('Could not find schema DRI in internal list!');
          } else {
            await this.selectSchema(schema);
            await this.selectVaultItem(vaultItem);
          }
        }
      }

      this.isExecutingAction = false;
    },
    async saveVaultItem(postItem: VaultPostItem) {
      this.saveMessage = undefined;
      this.isSaving = true;

      try {
        await this.$store.dispatch(ActionType.UPDATE_VAULT_ITEM, postItem);
        this._showEditView(false);
      } catch {
        this.saveMessage = 'Could not save item';
      }

      this.fetchVaultItems();
      this.isSaving = false;
    },
    _showEditView(show: boolean) {
      this.showEditView = show;
      this.saveMessage = undefined;
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
    },
    currentVaultPage(): number | undefined {
      return (this.$store.state as IStore).vaultItem.paging?.current;
    },
    totalVaultItems(): number | undefined {
      return (this.$store.state as IStore).vaultItem.paging?.totalItems;
    },
    vaultPageItems(): number | undefined {
      return (this.$store.state as IStore).vaultItem.paging?.pageItems;
    },
    actions(): Action[] {
      return getActionsFromConfig('settings', 'additionalListActions');
    }
  }
})
</script>

<style scoped>
.oca-edit-view {
  margin-top: 2em;
}
</style>