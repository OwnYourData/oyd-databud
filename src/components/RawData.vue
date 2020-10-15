<template>
  <div class="row">
    <div class="col-md-6">
      <h3>Meta</h3>
      <pre class="card">{{jsonifiedMeta}}</pre>
    </div>
    <div class="col-md-6">
      <h3>Content</h3>
      <pre class="card">{{ jsonifiedData }}</pre>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-ignore
import { VaultItem } from 'vaultifier';
import Vue, { PropType } from 'vue'

export default Vue.extend({
  props: {
    item: {
      type: Object as PropType<VaultItem>,
    }
  },
  methods: {
    jsonify(obj: any) {
      return JSON.stringify(obj, null, 2).trim();
    }
  },
  computed: {
    jsonifiedMeta(): string {
      const copy = { ...this.item };
      delete copy.content;

      return this.jsonify(copy);
    },
    jsonifiedData(): string {
      return this.jsonify(this.item.content);
    }
  }
});
</script>

<style scoped>
.card {
  padding: 1em;

  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.card:hover {
  overflow: auto;
  text-overflow: clip;
}
</style>