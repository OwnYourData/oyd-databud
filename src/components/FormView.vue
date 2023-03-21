<template>
  <div>
    <spinner v-if="isLoading" />
    <!-- p-0 removes padding -->
    <b-container
      v-show="hasSchemaDri"
      class="p-0"
    >
      <b-row>
        <b-col>
          <b-form
            class="form"
            ref="form"
            @submit.prevent
          >
            <iframe
              ref="iframe"
              class="iframe"
              :src="iFrameSrc"
            />
          </b-form>
        </b-col>
      </b-row>
    </b-container>
    <b-alert
      variant="primary"
      v-if="!hasSchemaDri"
      show
    >
      Please select a form.
    </b-alert>
  </div>
</template>

<script lang="ts">
import Spinner from './Spinner.vue';

import { defineComponent } from '@vue/composition-api';

interface Data {
  selectedLanguage: string | null,
  selectedTag: string | null,
  isLoading: boolean,
  iFrameSrc: string | null,
}

export default defineComponent({
  data: (): Data => ({
    selectedLanguage: null,
    selectedTag: null,
    isLoading: false,
    iFrameSrc: null,
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
    Spinner,
  },
  mounted() {
    window.addEventListener('message', (evt) => {
      const iframe = (this.$refs.iframe as unknown as HTMLElement);

      switch (evt.data?.type) {
        case 'update':
          this.isLoading = false;
          if (iframe)
            iframe.style.height = evt.data.documentHeight + 'px';
          break;
        case 'data':
          this.$emit('change', evt.data.evt);
          break;
      }
    });
  },
  methods: {
    async reload() {
      if (!this.schemaDri)
        return;

      this.isLoading = true;

      const url = new URL('https://form.ownyourdata.unterholzer.dev');
      const { searchParams: params } = url;

      params.append('viewMode', 'embedded');
      params.append('schemaDri', this.schemaDri);
      params.append('data', JSON.stringify(this.data));

      this.iFrameSrc = url.toString();
    },
  },
  watch: {
    schemaDri() {
      this.reload();
    },
  },
  computed: {
    hasSchemaDri(): boolean {
      return !!this.schemaDri;
    },
  },
})
</script>

<style scoped>
.soya-form-option {
  max-width: 12em;
}

.iframe {
  width: 100%;
  min-height: 500px;

  border: none;
}
</style>