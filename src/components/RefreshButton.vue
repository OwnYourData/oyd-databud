<template>
  <button class="btn btn-outline-primary" @click="click">Refresh</button>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  methods: {
    click() {
      this.$emit('click', ...arguments);
    }
  }
})
</script>

<style scoped>
.btn {
  margin-bottom: 1em;
}
</style>