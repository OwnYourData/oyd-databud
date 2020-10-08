<template>
<div>
  <span v-for="schema of schemas" :key="schema">{{schema}}</span>
</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VaultifierWeb, VaultSchema, MimeTypes } from "vaultifier/dist/module";

interface IData {
  schemas: VaultSchema[];
}

export default defineComponent({
  data: (): IData => ({
    schemas: [],
  }),
  created() {
    this.initialize();
  },
  methods: {
    async initialize() {
      const vaultifier = VaultifierWeb.create('');
      await vaultifier.initialize();

      vaultifier.postItem({
        dri: 'zQmbNDA8UVGsunvC43pekHs3hVtnFPWzPdizdwSqKVLAbWP',
        schemaDri: 'gffA2i9tCexTwQ1S6JsXxJ8JEMHfTdaMtggBjX6jvF8N',
        content: {foo: 'bar'},
        mimeType: MimeTypes.JSON,
      })

      this.schemas = await vaultifier.getSchemas();
    },
  },
});
</script>