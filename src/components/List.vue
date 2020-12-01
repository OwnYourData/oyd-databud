<template>
  <div>
    <div class="list-container">
      <spinner v-if="isLoading" />
      <b-list-group v-else>
        <slot />
      </b-list-group>
    </div>
    <b-pagination
      :disabled="isLoading"
      v-if="totalPages && currentPage"
      :total-rows="totalPages"
      v-model="currentPage"
      @page-click="changePage"
      align="fill"
    />
  </div>
</template>

<script lang="ts">
import { BvEvent } from 'bootstrap-vue';
import Vue, { PropType } from 'vue';
import Spinner from './Spinner.vue';

export interface RefreshObj {
  page: number,
}

export default Vue.extend({
  props: {
    isLoading: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    totalPages: Number as PropType<number | undefined>,
    currentPage: Number as PropType<number | undefined>,
  },
  components: {
    Spinner,
  },
  methods: {
    changePage(evt: BvEvent, page: number) {
      this.$emit('refresh', {
        page,
      });
    }
  }
});

</script>

<style scoped>
.list-container {
  height: 250px;
  overflow-y: auto;
}
</style>