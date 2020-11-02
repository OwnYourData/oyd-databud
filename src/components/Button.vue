<template>
  <button
    class="btn"
    :class="generatedClassList"
    @click="click"
  >
    <slot />
  </button>
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
  computed: {
    generatedClassList() {
      return `btn-outline-${this.type}`;
    }
  }
})
</script>

<style scoped>
.btn {
  margin-bottom: 1em;
}
</style>