<template>
  <div class="container">
    <div class="jumbotron">
      <h1 class="display-4">OwnYourData DataBud Login</h1>

      <form @submit="submitForm">
        <div class="form-group">
          <label>App Key:
            <input
              class="form-control"
              type="text"
              v-model="appKey"
            /></label>
        </div>
        <div class="form-group">
          <label>App Secret:
            <input
              class="form-control"
              type="password"
              v-model="appSecret"
            /></label>
        </div>

        <button
          type="submit"
          class="btn btn-primary"
        >Login</button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
export interface Data {
  appKey: string,
  appSecret: string,
}

import Vue from 'vue'
export default Vue.extend({
  data: () => ({
    appKey: '',
    appSecret: '',
  }),
  methods: {
    submitForm(event: Event) {
      event.preventDefault();

      this.$emit('login', {
        appKey: this.appKey,
        appSecret: this.appSecret,
      } as Data);
    }
  }
})
</script>