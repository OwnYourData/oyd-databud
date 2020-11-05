<template>
  <div class="inline-group">
    <slot />
  </div>
</template>

<style scoped>
.inline-group > :not(:last-child) {
  margin-right: 1em;
}
</style>