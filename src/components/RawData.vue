<template>
  <pre>{{ jsonified }}</pre>
</template>

<script lang="ts">
// @ts-ignore
import { VaultItem } from 'vaultifier';
import Vue, { PropType } from 'vue'

export default Vue.extend({
  props: {
    item: {
      type: Object as PropType<VaultItem>,
    }
  },
  computed: {
    jsonified(): string {
      return JSON.stringify(this.item, null, 2).trim();
    }
  }
});
</script>