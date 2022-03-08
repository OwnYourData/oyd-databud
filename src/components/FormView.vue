<template>
  <spinner v-if="isLoading" />
  <div v-else-if="hasForm">
    <b-form-group
      v-if="hasLanguages"
      label="Language"
      class="languages"
    >
      <b-form-select
        :options="languageOptions"
        v-model="selectedLanguage"
      />
    </b-form-group>
    <b-form
      class="row"
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
  </div>
  <b-alert
    variant="danger"
    v-else-if="isError"
    show
  >
    Can not render a form.
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

import { SoyaForm, Soya } from 'soya-js';
import { defineComponent } from '@vue/composition-api';

interface Data {
  renderers: readonly any[],
  form?: SoyaForm,
  selectedLanguage?: string,
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

export default defineComponent({
  data: (): Data => ({
    form: undefined,
    selectedLanguage: undefined,
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
          this.form = await new Soya().getForm(this.schemaDri, {
            language: this.selectedLanguage,
          });
          this.selectedLanguage = this.selectedLanguage ?? (this.form.languages ? this.form.languages[0] : undefined);
        } catch {
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
    }
  },
  computed: {
    hasForm(): boolean {
      return !!this.form;
    },
    hasLanguages(): boolean {
      return (this.form?.languages?.length ?? 0) > 0;
    },
    languageOptions(): { value: string, text: string }[] {
      if (!this.hasLanguages || !this.form?.languages)
        return [];
      else
        return this.form.languages.map(x => ({
          value: x,
          text: x,
        }));
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
.languages {
  max-width: 8em;
}
</style>