<template>
  <div class="container">
    <div class="jumbotron">
      <h1 class="display-5">DataBud Login</h1>

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
        <div
          v-if="scopes"
          class="form-group"
        >
          <label>Scope:
            <select
              class="form-control"
              v-model="scope"
            >
              <option
                v-for="scope of scopes"
                :key="scope"
              >{{scope}}</option>
            </select>
          </label>
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
  scope?: string,
}

import Vue, { PropType } from 'vue'
export default Vue.extend({
  props: {
    scopes: Array as PropType<string[] | undefined>
  },
  data: (): Data => ({
    appKey: '',
    appSecret: '',
    scope: undefined,
  }),
  created() {
    if (this.scopes && this.scopes.length > 0)
      this.scope = this.scopes[0];
  },
  methods: {
    submitForm(event: Event) {
      event.preventDefault();

      this.$emit('login', {
        appKey: this.appKey,
        appSecret: this.appSecret,
        scope: this.scope,
      } as Data);
    }
  }
})
</script>