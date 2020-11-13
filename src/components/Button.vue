<template>
  <b-button
    :variant="type"
    @click="click"
  >
    <slot />
  </b-button>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    type: {
      type: String,
      default: 'primary'
    }
  },
  methods: {
    click() {
      this.$emit('click', ...arguments);
    }
  },
})
</script>