<template>
  <div
    class="tab-pane"
    :class="{'active': isActive}"
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