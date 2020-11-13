<template>
  <div>
    <inline-group>
      <custom-button @click="saveEdit">Save</custom-button>
      <custom-button
        @click="cancelEdit"
        type="danger"
      >Cancel</custom-button>
    </inline-group>

    <b-form inline>
      <b-input-group :prepend="selectedSchemaTitle">
        <b-form-input
          placeholder="Schema DRI"
          v-model="editableSchemaDri"
        ></b-form-input>
        <b-input-group-append>
          <b-button @click="handleConfirm">Confirm</b-button>
        </b-input-group-append>
      </b-input-group>
    </b-form>

    <oca-view
      v-if="hasSelectedSchemaDri"
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
import { getObjectFromForm, getTitle } from '@/utils';
import { SchemaService } from '@/services/schema-service';

interface Data {
  editableSchemaDri?: string,
  selectedSchemaDri?: string,
  selectedSchemaTitle?: string,
}

export default Vue.extend({
  components: {
    OcaView,
    CustomButton,
    InlineGroup,
  },
  props: {
    schemaDri: String as PropType<string | undefined>,
    item: Object as PropType<VaultItem>,
  },
  data: (): Data => ({
    editableSchemaDri: undefined,
    selectedSchemaDri: undefined,
    selectedSchemaTitle: undefined,
  }),
  mounted() {
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
    cancelEdit() {
      this.$emit('cancel');
    },
    selectSchemaDri(schemaDri?: string) {
      this.selectedSchemaDri = this.editableSchemaDri = schemaDri;
    },
    handleConfirm() {
      this.selectSchemaDri(this.editableSchemaDri);
    }
  },
  computed: {
    hasSelectedSchemaDri(): boolean {
      return !!this.selectedSchemaDri;
    },
  },
  watch: {
    async selectedSchemaDri(value?: string) {
      if (!value) {
        this.selectedSchemaTitle = undefined;
        return;
      }

      this.selectedSchemaTitle = await SchemaService.getTitle(value);
    },
    schemaDri(value?: string) {
      this.selectSchemaDri(value);
    }
  }
})
</script>

<style scoped>
.form-inline {
  margin-bottom: 2em;
}
</style>