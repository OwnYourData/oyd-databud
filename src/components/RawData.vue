<template>
  <div class="row">
    <div class="col-md-6">
      <h3 class="heading">Meta</h3>
      <raw-json :data="meta" />
    </div>
    <div class="col-md-6">
      <h3 class="heading">Content</h3>
      <span
        class="text-muted"
        v-if="isEncrypted"
      > (encrypted)</span>
      <raw-json :data="item.content" />
    </div>
  </div>
</template>

<script lang="ts">
// @ts-ignore
import { VaultItem } from 'vaultifier';
import Vue, { PropType } from 'vue'
import RawJson from './RawJson.vue';

export default Vue.extend({
  components: {
    RawJson,
  },
  props: {
    item: {
      type: Object as PropType<VaultItem>,
    }
  },
  computed: {
    meta(): any {
      const copy = { ...this.item };
      delete copy.content;
      delete copy.raw;

      return copy;
    },
    isEncrypted(): boolean {
      return this.item.isEncrypted;
    }
  }
});
</script>

<style scoped>
.heading {
  display: inline-block;
}
</style>