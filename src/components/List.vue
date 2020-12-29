<template>
  <div>
    <inline-group>
      <custom-button
        :disabled="isLoading"
        type="refresh"
        @click="() => refresh()"
      ></custom-button>
      <slot name="header-end" />
    </inline-group>
    <div class="list-container">
      <spinner v-if="isLoading" />
      <b-list-group
        v-else
        class="list"
      >
        <slot>
          <b-list-group-item>No items available</b-list-group-item>
        </slot>
      </b-list-group>
    </div>
    <b-pagination
      v-if="totalItems && page && pageItems"
      :disabled="isLoading"
      :total-rows="totalItems"
      :per-page="pageItems"
      v-model="page"
      @page-click="changePage"
      align="fill"
    />
  </div>
</template>

<script lang="ts">
import { BvEvent } from 'bootstrap-vue';
import Vue, { PropType } from 'vue';
import Spinner from './Spinner.vue';
import CustomButton from '../components/Button.vue';
import InlineGroup from '../components/InlineGroup.vue';

export interface RefreshObj {
  page?: number,
}

interface Data {
  page?: number,
}

export default Vue.extend({
  props: {
    isLoading: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    totalItems: Number as PropType<number | undefined>,
    currentPage: Number as PropType<number | undefined>,
    pageItems: Number as PropType<number | undefined>,
  },
  data: (): Data => ({
    page: undefined,
  }),
  components: {
    Spinner,
    CustomButton,
    InlineGroup,
  },
  created() {
    this.page = this.currentPage;
  },
  watch: {
    currentPage() {
      this.page = this.currentPage;
    }
  },
  methods: {
    changePage(evt: BvEvent, page: number) {
      this.refresh(page);
    },
    refresh(page?: number) {
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

.list > * {
  overflow-x: hidden;
  text-overflow: ellipsis;
}
</style>