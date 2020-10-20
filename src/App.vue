<template>
  <div
    class="container"
    v-if="isInitializing"
  >
    <div class="jumbotron">
      <h1 class="display-4">OwnYourData DataBud</h1>
      <p class="lead">DataBud is loading <spinner></spinner></p>
    </div>
  </div>
  <router-view v-else></router-view>
</template>

<script lang="ts">
import Vue from "vue";
import { initialize } from './services';
import Spinner from './components/Spinner.vue'

interface IData {
  isInitializing: boolean,
}

export default Vue.extend({
  components: {
    Spinner,
  },
  created() {
    this.initialize();
  },
  data: (): IData => ({
    isInitializing: true,
  }),
  methods: {
    async initialize() {
      await initialize('');

      this.isInitializing = false;
    },
  }
});
</script>

<style>
.list-group-item {
  overflow: hidden;
  text-overflow: ellipsis;
  word-wrap: initial;
}
</style>