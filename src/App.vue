<template>
  <div
    class="container"
    v-if="isInitializing"
  >
    <div class="jumbotron">
      <h1 class="display-4">OwnYourData DataBud</h1>
      <p class="lead">DataBud is loading...</p>
    </div>
  </div>
  <router-view v-else></router-view>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VaultifierWeb, VaultSchema, MimeType } from "vaultifier/dist/module";
import { MutationType } from './store';
import { initialize } from './services';

interface IData {
  isInitializing: boolean,
}

export default defineComponent({
  created() {
    this.initialize();
  },
  data: (): IData => ({
    isInitializing: true,
  }),
  methods: {
    async initialize() {
      const vaultifier = await initialize('');

      this.isInitializing = false;
    },
  }
});
</script>