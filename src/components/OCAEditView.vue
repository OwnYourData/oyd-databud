<template>
  <div>
    <inline-group>
      <b-form
        inline
        @submit.prevent
        v-if="showTypeahead || !hasSelectedSchemaDri"
      >
        <b-typeahead
          prepend="Search Schema..."
          v-model="editableText"
          :serializer="s => s.title"
          :data="suggestItems"
          @hit="selectFromTypeahead"
        >{{editableText}}</b-typeahead>

      </b-form>
      <b-button
        v-else
        @click="showTypeahead = true"
      >{{selectedSchemaTitle}}</b-button>

      <custom-button
        @click="saveEdit"
        :disabled="!hasSelectedSchemaDri"
      >Save</custom-button>
      <custom-button
        @click="cancelEdit"
        type="danger"
        :disabled="!hasSelectedSchemaDri"
      >Cancel</custom-button>
    </inline-group>

    <spinner v-if="isLoading" />
    <oca-view
      v-else-if="hasSelectedSchemaDri"
      ref="ocaView"
      :item="item"
      :schemaDri="selectedSchemaDri"
    ></oca-view>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { MimeType, VaultItem, VaultPostItem } from 'vaultifier';
import OcaView from './OCAView.vue';
import InlineGroup from './InlineGroup.vue';
import CustomButton from './Button.vue';
import { getObjectFromForm } from '@/utils';
import { SchemaService, SuggestItem } from '@/services/schema-service';
import Spinner from './Spinner.vue';

interface Data {
  editableText?: string,
  selectedSchemaTitle?: string,
  selectedSchemaDri?: string,
  suggestItems: SuggestItem[],
  isLoading: boolean,
  showTypeahead: boolean,
}

export default Vue.extend({
  components: {
    OcaView,
    CustomButton,
    InlineGroup,
    Spinner,
  },
  props: {
    schemaDri: String as PropType<string | undefined>,
    item: Object as PropType<VaultItem>,
  },
  data: (): Data => ({
    editableText: '',
    selectedSchemaTitle: undefined,
    selectedSchemaDri: undefined,
    suggestItems: [],
    isLoading: false,
    showTypeahead: false,
  }),
  mounted() {
    if (this.schemaDri)
      this.selectSchemaDri(this.schemaDri);
  },
  methods: {
    async saveEdit() {
      if (!this.selectedSchemaDri)
        return;

      const content = getObjectFromForm((this.$refs.ocaView as any).form);
      const postItem: VaultPostItem = {
        content: getObjectFromForm((this.$refs.ocaView as any).form),
        // TODO:
        dri: Date.now() + '___shouldbesetbyclient',
        schemaDri: this.selectedSchemaDri,
        mimeType: MimeType.JSON,
      };

      this.$emit('save', postItem);
    },
    cancelEdit(): void {
      this.$emit('cancel');
    },
    async selectSchemaDri(schemaDri?: string) {
      this.selectedSchemaDri = schemaDri;

      this.editableText = this.selectedSchemaTitle = schemaDri ? await SchemaService.getTitle(schemaDri) : '';
      this.showTypeahead = false;
    },
    async selectFromTypeahead(item: SuggestItem): Promise<void> {
      this.isLoading = true;

      const list = await SchemaService.getOverlaySchemaDRIsFromSchemaBase(item.schemaBaseDri);

      if (list && list.length > 0)
        this.selectSchemaDri(list[0]);
      else
        this.selectSchemaDri(undefined);

      this.isLoading = false;
    }
  },
  computed: {
    hasSelectedSchemaDri(): boolean {
      return !!this.selectedSchemaDri;
    },
  },
  watch: {
    schemaDri(value?: string) {
      this.selectSchemaDri(value);
    },
    async editableText(value: string) {
      if (!value)
        this.suggestItems = [];
      else
        this.suggestItems = await SchemaService.getSuggestions(value);
    }
  }
})
</script>