<template>
  <div class="card">
    <ul
      class="card-header nav nav-pills"
      role="tablist"
    >
      <li
        class="nav-item"
        v-for="panel of panels"
        :key="panel.name"
      >
        <a
          class="nav-link"
          :class="{'active': activePanel.name === panel.name}"
          @click="selectPanel(panel)"
          href="#"
        >{{ panel.title }}</a>
      </li>
    </ul>
    <div class="tab-content card-body">
      <div class="tab-pane show active">
      <component
        :is="visiblePanelComponent"
        v-bind="visiblePanelProps"
      ></component>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { VaultItem } from 'vaultifier';
import RawData from './RawData.vue';
// @ts-ignore
import { FormBuilderGui } from 'odca-form';
import { renderForm } from '../utils';


interface Panel {
  name: string,
  title: string,
  view: Vue.Component,
  props: any,
}

interface IData {
  selectedPanel?: Panel,
  form?: any,
}

export default Vue.extend({
  props: {
    item: Object as PropType<VaultItem>,
  },
  components: {
    RawData,
    FormBuilderGui,
  },
  data: (): IData => ({
    selectedPanel: undefined,
    form: undefined,
  }),
  methods: {
    selectPanel(panel: Panel) {
      this.selectedPanel = panel;
    },
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
    activePanel(): Panel {
      return this.selectedPanel || this.panels[0];
    },
    hasForm(): boolean {
      return !!this.form;
    },
    panels(): Panel[] {
      const panels: Panel[] = [
        { name: 'raw-data', title: 'Raw-Data', view: RawData, props: { item: this.item } },
      ];

      if (this.hasForm)
        panels.push({ name: 'form-builder-gui', title: 'OCA-Form', view: FormBuilderGui, props: { form: this.form } });

      return panels;
    },
    visiblePanelComponent(): string {
      return this.activePanel.name;
    },
    visiblePanelProps(): any {
      return this.activePanel.props;
    }
  },
})
</script>