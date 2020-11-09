<template>
  <div
    v-if="hasForm"
    class="row"
  >
    <div
      class="col-md-12"
      v-if="hasLanguages"
    >
      <div
        class="form-check form-check-inline"
        v-for="lang of languages"
        :key="lang"
      >
        <label class="form-check-label">
          <input
            class="form-check-input"
            name="language"
            type="radio"
            :value="lang"
            v-model="selectedLanguage"
          >
          {{lang}}
        </label>
      </div>
    </div>
    <div class="row">
      <form-builder-gui :form="form"></form-builder-gui>
    </div>
  </div>
  <spinner v-else-if="isLoading" />
  <div
    v-else
    class="alert alert-warning"
    role="alert"
  >
    It seems the schema with DRI <code>{{item.schemaDri}}</code> is not a valid OCA schema.
  </div>
</template>
<script lang="ts">
import { VaultItem } from 'vaultifier';
import Vue, { PropType } from 'vue'
import Spinner from './Spinner.vue';
import { SchemaService } from '../services/schema-service';
// @ts-ignore
import { FormBuilderGui } from '@gebsl/oca.js-vue';
import { getLanguages, renderForm } from '../utils';

interface Data {
  overlays?: any[],
  selectedLanguage?: string,
  isLoading: boolean,
}

export default Vue.extend({
  data: (): Data => ({
    overlays: undefined,
    selectedLanguage: undefined,
    isLoading: true,
  }),
  props: {
    item: Object as PropType<VaultItem | undefined>,
    schemaDri: String as PropType<string>,
  },
  components: {
    FormBuilderGui,
    Spinner,
  },
  created() {
    this.getOverlays();
  },
  watch: {
    schemaDri() {
      this.getOverlays();
    },
    overlays() {
      this.selectedLanguage = this.hasLanguages && this.languages ? this.languages[0] : undefined;
    },
  },
  methods: {
    async getOverlays() {
      this.isLoading = true;
      this.overlays = await SchemaService.getOverlays(this.schemaDri);
      this.isLoading = false;
    },
  },
  computed: {
    form(): any {
      if (!this.overlays)
        return;

      return renderForm(this.overlays, this.item, this.selectedLanguage);
    },
    hasForm(): boolean {
      return !!this.form;
    },
    languages(): string[] | undefined {
      return this.overlays ? getLanguages(this.overlays) : undefined;
    },
    hasLanguages(): boolean {
      return !!(this.languages && this.languages.length > 0);
    },
  }
})
</script>

<style scoped>
.form-check {
  margin-bottom: 2em;
}
</style>