<template>
  <b-card no-body>
    <b-tabs
      pills
      card
    >
      <b-tab
        title="Raw Data"
        v-if="showRawView"
      >
        <raw-data :item="item"></raw-data>
      </b-tab>
      <b-tab
        title="OCA-Form"
        v-if="hasSchema"
      >
        <oca-view
          :item="item"
          :schemaDri="schemaDri"
        ></oca-view>
      </b-tab>
    </b-tabs>
  </b-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { VaultItem } from 'vaultifier';
import RawData from './RawData.vue';

import OcaView from '../components/OCAView.vue';

export default Vue.extend({
  props: {
    item: Object as PropType<VaultItem>,
    showRawView: {
      default: true,
      type: Boolean as PropType<boolean>,
    },
  },
  components: {
    RawData,
    OcaView,
  },
  computed: {
    schemaDri(): string | undefined {
      return this.item.schemaDri;
    },
    hasSchema(): boolean {
      return !!this.schemaDri;
    }
  },
})
</script>