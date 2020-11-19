<template>
  <div class="jumbotron">
    <h1 class="display-5">DataBud Login</h1>

    <b-form @submit="submitForm">
      <b-form-group label="App Key:">
        <b-form-input
          required
          name="username"
          v-model="appKey"
        ></b-form-input>
      </b-form-group>
      <b-form-group label="App Secret:">
        <b-form-input
          required
          name="password"
          type="password"
          v-model="appSecret"
        ></b-form-input>
      </b-form-group>
      <b-form-group
        label="Scope:"
        v-if="scopeOptions"
      >
        <b-form-select
          required
          :options="scopeOptions"
          v-model="scope"
        ></b-form-select>
      </b-form-group>

      <b-button
        type="submit"
        variant="primary"
      >Login</b-button>
    </b-form>
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
  },
  computed: {
    scopeOptions() {
      return this.scopes?.map((x) => ({
        text: x,
        value: x,
      }));
    }
  }
})
</script>