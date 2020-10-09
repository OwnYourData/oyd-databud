<template>
  <div class="card">
    <div class="card-header">Data</div>
    <pre class="card-body">{{jsonified}}</pre>
  </div>
</template>

<script lang="ts">
import { VaultItem } from 'vaultifier/dist/module';
import { defineComponent, PropType } from 'vue'

export default defineComponent({
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