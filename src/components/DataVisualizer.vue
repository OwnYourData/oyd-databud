<template>
  <card-panel>
    <panel-tab title="Raw Data">
      <raw-data :item="item"></raw-data>
    </panel-tab>
    <panel-tab
      title="OCA-Form"
      v-if="hasSchema"
    >
      <form-builder-gui
        v-if="hasForm"
        :form="form"
      ></form-builder-gui>
      <div
        v-else
        class="alert alert-warning"
        role="alert"
      >
        It seems the schema with DRI <code>{{item.schemaDri}}</code> is not a valid OCA schema.
      </div>
    </panel-tab>
  </card-panel>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { VaultItem } from 'vaultifier';
import RawData from './RawData.vue';
// @ts-ignore
import { FormBuilderGui } from '@gebsl/oca.js-vue';
import { renderForm } from '../utils';

import CardPanel from '../components/CardPanel.vue';
import PanelTab from '../components/PanelTab.vue';

interface IData {
  form?: any,
}

export default Vue.extend({
  props: {
    item: Object as PropType<VaultItem>,
  },
  components: {
    CardPanel,
    PanelTab,
    RawData,
    FormBuilderGui,
  },
  data: (): IData => ({
    form: undefined,
  }),
  methods: {
    async getForm() {
      this.form = this.item ? await renderForm(this.item) : undefined;
    }
  },
  created() {
    this.getForm()
  },
  watch: {
    item(item: VaultItem) {
      this.getForm();
    }
  },
  computed: {
    hasForm(): boolean {
      return !!this.form;
    },
    hasSchema(): boolean {
      return !!this.item.schemaDri;
    }
  },
})
</script>