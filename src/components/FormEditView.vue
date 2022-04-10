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
        v-if="showVaccinationButton"
        @click="vaccinate"
        :type="isVaccinating ? 'success-outline' : 'success'"
        :disabled="isVaccinating"
      >
        <spinner v-if="isVaccinating" />
        <template v-else>
          Vaccinate
        </template>
      </custom-button>
      <custom-button
        v-if="hasCancel"
        @click="cancelEdit"
        type="danger"
      >Cancel</custom-button>
    </inline-group>

    <spinner v-if="isLoading" />
    <form-view
      :data="formData"
      :schemaDri="selectedStructure ? selectedStructure.dri : undefined"
      @change="onDataChange"
      ref="form"
    ></form-view>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { MimeType, VaultItem, VaultPostItem, crypto } from 'vaultifier';
import FormView from './FormView.vue';
import InlineGroup from './InlineGroup.vue';
import CustomButton from './Button.vue';
import Spinner from './Spinner.vue';
import { JsonFormsChangeEvent } from '@jsonforms/vue2';
import { Soya, SoyaQueryResult } from 'soya-js';
import { IStore } from '@/store';
import { getInstance } from '@/services';
import { ConfigService } from '@/services/config-service';

interface SoyaStructure {
  name?: string;
  dri: string;
}

interface Data {
  editableText?: string,
  selectedStructure?: SoyaStructure,
  suggestItems: SoyaQueryResult[],
  isLoading: boolean,
  isVaccinating: boolean,
  showTypeahead: boolean,
  formData: any,
}

export default Vue.extend({
  components: {
    FormView,
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
    isVaccinating: false,
    showTypeahead: false,
    formData: undefined,
  }),
  mounted() {
    if (this.schemaDri)
      this.selectStructure({
        name: undefined,
        dri: this.schemaDri,
      });
  },
  methods: {
    async saveEdit(): Promise<boolean> {
      if (!this.selectedStructure)
        return false;

      // @ts-expect-error
      if (!(this.$refs.form).validate()) {
        return false;
      }

      // TODO: We should let the user decide whether DRI should be calculated automatically or not
      const postItem: VaultPostItem = {
        content: this.formData,
        id: this.item?.id,
        dri: await crypto.generateHashlink(this.formData),
        schemaDri: this.selectedStructure.dri,
        mimeType: MimeType.JSON,
      };

      this.$emit('save', postItem);
      return true;
    },
    async vaccinate() {
      this.isVaccinating = true;

      // if saving did not work, we do not execute vaccination
      if (this.item && await this.saveEdit())
        try {
          await getInstance().put(`/api/update_vaccination/${this.item.id}`);
        } catch (e) {
          console.error(e);
        }

      this.isVaccinating = false;
    },
    cancelEdit(): void {
      this.$emit('cancel');
    },
    selectStructure(structure?: SoyaStructure) {
      this.selectedStructure = structure;

      if (structure && !structure.name) {
        const item = (this.$store.state as IStore).schemaDRI.all.find(x => x.dri === structure.dri);
        if (item)
          structure.name = item.title;
      }

      this.showTypeahead = false;
    },
    async selectFromTypeahead(result: SoyaQueryResult): Promise<void> {
      this.isLoading = true;

      this.selectStructure(result);

      this.isLoading = false;
    },
    onDataChange(event: JsonFormsChangeEvent) {
      this.formData = event.data;
    }
  },
  computed: {
    hasSelectedStructure(): boolean {
      return !!this.selectedStructure;
    },
    selectedStructureName(): string | undefined {
      return this.selectedStructure ? (this.selectedStructure.name || this.selectedStructure.dri) : undefined;
    },
    showVaccinationButton(): boolean {
      return this.schemaDri === ConfigService.get('settings', 'vaccinationSchema');
    }
  },
  watch: {
    item: {
      handler(value: VaultItem | undefined) {
        this.formData = value?.content;
      },
      immediate: true,
    },
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