<template>
  <div class="row">
    <div class="col-md-6">
      <h3 class="heading">Downstream</h3>
      <list
        @refresh="refreshRelations"
        :isLoading="isWorking"
      >
        <b-list-group-item
          v-for="id of downstreamIds"
          :key="id"
          @click="selectId(id)"
        >
          {{id}}
        </b-list-group-item>
      </list>
    </div>
    <div class="col-md-6">
      <h3 class="heading">Upstream</h3>
      <list
        @refresh="refreshRelations"
        :isLoading="isWorking"
      >
        <b-list-group-item
          v-for="id of upstreamIds"
          :key="id"
          @click="selectId(id)"
        >
          {{id}}
        </b-list-group-item>
      </list>
    </div>
  </div>
</template>

<script lang="ts">
import { getInstance } from '@/services'
import { VaultItem } from 'vaultifier'
import Vue, { PropType } from 'vue'
import List from './List.vue'

export interface Data {
  downstreamIds: number[];
  upstreamIds: number[];
  isWorking: boolean;
}

export default Vue.extend({
  components: {
    List,
  },
  props: {
    item: Object as PropType<VaultItem>,
  },
  data: (): Data => ({
    downstreamIds: [],
    upstreamIds: [],
    isWorking: false,
  }),
  created() {
    this.refreshRelations();
  },
  watch: {
    item() {
      this.refreshRelations();
    },
    downstreamIds() {
      this.emitUpdate();
    },
    upstreamIds() {
      this.emitUpdate();
    },
  },
  methods: {
    async refreshRelations() {
      this.isWorking = true;

      const res = await getInstance().getRelations(this.item.id);
      const relations = res.find(x => x.id === this.item.id);

      this.isWorking = false;

      if (!relations) {
        this.downstreamIds = this.upstreamIds = [];
        return;
      }

      this.downstreamIds = relations.downstream;
      this.upstreamIds = relations.upstream;
    },
    selectId(id: number) {
      this.$emit('selectId', id);
    },
    emitUpdate() {
      this.$emit('update', this.downstreamIds, this.upstreamIds);
    }
  }
})
</script>