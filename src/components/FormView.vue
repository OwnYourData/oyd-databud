<template>
  <spinner v-if="isLoading" />
  <!-- p-0 removes padding -->
  <b-container
    v-else-if="hasForm"
    class="p-0"
  >
    <b-row v-if="hasTags && hasLanguages">
      <b-col
        v-if="hasTags"
        md="3"
      >
        <b-form-group
          label="Tag"
          class="soya-form-option"
        >
          <b-form-select
            :options="tagOptions"
            v-model="selectedTag"
          />
        </b-form-group>
      </b-col>
      <b-col
        v-if="hasLanguages"
        md="3"
      >
        <b-form-group
          label="Language"
          class="soya-form-option"
        >
          <b-form-select
            :options="languageOptions"
            v-model="selectedLanguage"
          />
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-form
          class="form"
          ref="form"
          @submit.prevent
        >
          <json-forms
            :data="this.data"
            :renderers="renderers"
            :schema="form.schema"
            :uischema="form.ui"
            @change="onDataChange"
          />
        </b-form>
      </b-col>
    </b-row>
  </b-container>
  <b-alert
    variant="danger"
    v-else-if="isError"
    show
  >
    Can not render a form. Find more information in the developer tools.
  </b-alert>
  <b-alert
    variant="primary"
    v-else
    show
  >
    Please select a form.
  </b-alert>
</template>
<script lang="ts">
import Spinner from './Spinner.vue';
import { JsonForms, JsonFormsChangeEvent } from "@jsonforms/vue2";
import {
  defaultStyles,
  mergeStyles,
  vanillaRenderers,
} from "@jsonforms/vue2-vanilla";
import { formRenderers } from './form-components';

import { SoyaFormResponse, Soya } from 'soya-js';
import { defineComponent } from '@vue/composition-api';

interface Data {
  renderers: readonly any[],
  form?: SoyaFormResponse,
  selectedLanguage: string | null,
  selectedTag: string | null,
  isLoading: boolean,
  isError: boolean,
}

// mergeStyles combines all classes from both styles definitions into one
const myStyles = mergeStyles(defaultStyles, { control: { label: "mylabel" } });
const renderers = [
  ...vanillaRenderers,
  // here you can add custom renderers
  ...formRenderers,
];

interface SelectOption {
  value: string | null,
  text: string,
}

const toSelectOption = (text: string): SelectOption => ({
  value: text,
  text,
});

const withEmpty = (options: SelectOption[]): SelectOption[] => {
  return [
    { value: null, text: 'Default' },
    ...options,
  ]
}

export default defineComponent({
  data: (): Data => ({
    form: undefined,
    selectedLanguage: null,
    selectedTag: null,
    isLoading: true,
    isError: false,
    renderers: Object.freeze(renderers),
  }),
  props: {
    data: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    schemaDri: String,
  },
  components: {
    JsonForms,
    Spinner,
  },
  created() {
    this.getForm();
  },
  methods: {
    async getForm() {
      this.form = undefined;
      this.isLoading = true;
      this.isError = false;

      if (this.schemaDri) {
        try {
          const soya = new Soya();
          const doc = await soya.pull(this.schemaDri);
          this.form = await soya.getForm(doc, {
            language: this.selectedLanguage || undefined,
            tag: this.selectedTag || undefined,
          });
        } catch (e) {
          console.error(e);
          this.isError = true;
        }
      }

      this.isLoading = false;
    },
    onDataChange(event: JsonFormsChangeEvent) {
      this.$emit('change', event);
    },
    validate(): boolean {
      const form = (this.$refs.form as HTMLFormElement);
      return form.reportValidity();
    }
  },
  watch: {
    schemaDri() {
      this.getForm();
    },
    selectedLanguage() {
      this.getForm();
    },
    selectedTag() {
      // if-else prevents hitting the watcher twice in a row
      // yeah, this could be solved more intelligently possibly...
      if (this.selectedLanguage)
        this.selectedLanguage = null;
      else
        this.getForm();
    }
  },
  computed: {
    hasForm(): boolean {
      return !!this.form;
    },
    hasTags(): boolean {
      return this._tagOptions.length > 0;
    },
    _tagOptions(): string[] {
      return this.form?.options
        .filter(x => x.tag)
        .map(x => x.tag as string) ?? [];
    },
    tagOptions(): SelectOption[] {
      return withEmpty(this._tagOptions.map(x => toSelectOption(x)));
    },
    hasLanguages(): boolean {
      return this._languageOptions.length > 0;
    },
    _languageOptions(): string[] {
      return this.form?.options
        .filter(x => x.language && x.tag == this.selectedTag)
        .map(x => x.language as string) ?? [];
    },
    languageOptions(): SelectOption[] {
      return withEmpty(this._languageOptions.map(x => toSelectOption(x)));
    }
  },
  provide() {
    return {
      styles: myStyles,
    }
  }
})
</script>

<style scoped>
.soya-form-option {
  max-width: 12em;
}

.form {
  max-width: 30em;
}
</style>