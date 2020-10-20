<template>
  <div
    class="tab-pane active"
    v-if="isActive"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
export default Vue.extend({
  props: {
    title: String as PropType<string>,
    isActive: Boolean,
  },
})
</script>