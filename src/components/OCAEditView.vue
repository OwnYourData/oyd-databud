<template>
  <div>
    <inline-group>
      <b-form
        inline
        @submit.prevent
        v-if="allowSelectSchema && (showTypeahead || !hasSelectedSchemaDri)"
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
      <div class="spacer"></div>
      <custom-button
        @click="saveEdit"
        :type="isSaving ? 'primary-outline' : undefined"
        :disabled="!hasSelectedSchemaDri || isSaving"
      >
        <spinner v-if="isSaving" />
        <template v-else>
          Save
        </template>
      </custom-button>
      <custom-button
        v-if="hasCancel"
        @click="cancelEdit"
        type="danger"
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

import { MimeType, VaultItem, VaultPostItem, crypto } from 'vaultifier';
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
    item: Object as PropType<VaultItem | undefined>,
    isSaving: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    hasCancel: {
      type: Boolean as PropType<boolean>,
      default: true
    },
    allowSelectSchema: {
      type: Boolean as PropType<boolean>,
      default: true,
    }
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

      const objectToSave = getObjectFromForm((this.$refs.ocaView as any).form);

      // TODO: We should let the user decide whether DRI should be calculated automatically or not
      const postItem: VaultPostItem = {
        content: objectToSave,
        id: this.item?.id,
        dri: await crypto.generateHashlink(objectToSave),
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

<style scoped>
.spacer {
  flex: 1;
}
</style>