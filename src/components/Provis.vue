<template>
  <div>
    <b-alert
      v-if="error"
      variant="danger"
      show
    >{{error}}</b-alert>
    <spinner v-else-if="isLoading" />
    <b-img
      class="provenance-img"
      :hidden="isLoading && !error"
      :src="src"
      @load="() => isLoading = false"
    />
  </div>
</template>

<script lang="ts">
import { getInstance } from '@/services';
import Vue, { PropType } from 'vue'
import Spinner from './Spinner.vue';
import { getPlantUmlUrl } from '../utils';
import { VaultItem } from 'vaultifier';

interface Data {
  isLoading: boolean,
  src: string,
  error?: string,
}

export default Vue.extend({
  components: {
    Spinner
  },
  props: {
    item: Object as PropType<VaultItem>,
  },
  data: (): Data => ({
    isLoading: true,
    src: '',
    error: undefined,
  }),
  async created() {
    const plantUml = (await getInstance().getProvis({
      id: this.item.id,
    }))[0];

    if (plantUml)
      this.src = getPlantUmlUrl(plantUml);
    else
      this.error = 'Could not find PlantUML data.';
  },
  methods: {
    getImageUrl(value: string): string {
      return getPlantUmlUrl(value);
    }
  }
})
</script>

<style scoped>
.provenance-img {
  max-width: 100%;
}
</style>