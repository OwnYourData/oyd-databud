<template>
  <card-panel>
    <panel-tab
      title="Raw Data"
      v-if="showRawView"
    >
      <raw-data :item="item"></raw-data>
    </panel-tab>
    <panel-tab
      title="OCA-Form"
      v-if="hasSchema"
    >
      <oca-view
        :item="item"
        :schemaDri="schemaDri"
      ></oca-view>
    </panel-tab>
  </card-panel>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { VaultItem } from 'vaultifier';
import RawData from './RawData.vue';

import CardPanel from '../components/CardPanel.vue';
import PanelTab from '../components/PanelTab.vue';
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
    CardPanel,
    PanelTab,
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