<template>
  <div>
    <inline-group>
      <b-form
        inline
        @submit.prevent
        v-if="allowSelectSchema && (showTypeahead || !hasSelectedStructure)"
      >
        <b-typeahead
          prepend="Search SOyA structure..."
          v-model="editableText"
          :serializer="s => s.name"
          :data="suggestItems"
          @hit="selectFromTypeahead"
        >{{editableText}}</b-typeahead>
      </b-form>
      <b-button
        v-else
        @click="showTypeahead = true"
      >{{selectedStructureName}}</b-button>
      <div class="spacer"></div>
      <custom-button
        @click="saveEdit"
        :type="isSaving ? 'primary-outline' : undefined"
        :disabled="!hasSelectedStructure || isSaving"
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
      ref="ocaView"
      :data="data"
      :schemaDri="selectedStructure ? selectedStructure.dri : undefined"
      @change="onDataChange"
    ></oca-view>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { MimeType, VaultItem, VaultPostItem, crypto } from 'vaultifier';
import OcaView from './FormView.vue';
import InlineGroup from './InlineGroup.vue';
import CustomButton from './Button.vue';
import Spinner from './Spinner.vue';
import { JsonFormsChangeEvent } from '@jsonforms/vue2';
import { Soya, SoyaQueryResult } from 'soya-js';

interface SoyaStructure {
  name?: string;
  dri: string;
}

interface Data {
  editableText?: string,
  selectedStructure?: SoyaStructure,
  suggestItems: SoyaQueryResult[],
  isLoading: boolean,
  showTypeahead: boolean,
  data: any,
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
    selectedStructure: undefined,
    suggestItems: [],
    isLoading: false,
    showTypeahead: false,
    data: undefined,
  }),
  created() {
    this.data = this.item?.content;
  },
  mounted() {
    if (this.schemaDri)
      this.selectStructure({
        name: undefined,
        dri: this.schemaDri,
      });
  },
  methods: {
    async saveEdit() {
      if (!this.selectedStructure)
        return;

      // TODO: We should let the user decide whether DRI should be calculated automatically or not
      const postItem: VaultPostItem = {
        content: this.data,
        id: this.item?.id,
        dri: await crypto.generateHashlink(this.data),
        schemaDri: this.selectedStructure.dri,
        mimeType: MimeType.JSON,
      };

      this.$emit('save', postItem);

    },
    cancelEdit(): void {
      this.$emit('cancel');
    },
    selectStructure(structure?: SoyaStructure) {
      this.selectedStructure = structure;

      this.showTypeahead = false;
    },
    async selectFromTypeahead(result: SoyaQueryResult): Promise<void> {
      this.isLoading = true;

      this.selectStructure(result);

      this.isLoading = false;
    },
    onDataChange(event: JsonFormsChangeEvent) {
      this.data = event.data;
    }
  },
  computed: {
    hasSelectedStructure(): boolean {
      return !!this.selectedStructure;
    },
    selectedStructureName(): string | undefined {
      return this.selectedStructure ? (this.selectedStructure.name || this.selectedStructure.dri) : undefined;
    }
  },
  watch: {
    schemaDri(value?: string) {
      if (value)
        this.selectStructure({
          name: undefined,
          dri: value,
        });
      else
        this.selectStructure(undefined);
    },
    async editableText(value: string) {
      if (!value)
        this.suggestItems = [];
      // type at least 3 characters
      else if (value.length >= 3)
        this.suggestItems = await new Soya().query({ name: value });
    }
  }
})
</script>

<style scoped>
.spacer {
  flex: 1;
}
</style>