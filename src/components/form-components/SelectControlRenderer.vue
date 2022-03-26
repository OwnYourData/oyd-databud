<template>
  <b-form-group
    :label="control.label"
    :description="control.uischema.description"
  >
    <multiselect
      v-if="isMultiple"
      v-model="model"
      :id="control.id + '-input'"
      :options="items"
      :multiple="true"
      :disabled="!control.enabled"
      :close-on-select="false"
      :clear-on-select="false"
      :preserve-search="true"
      placeholder="Select from list"
    />
    <b-form-select
      v-else
      :id="control.id + '-input'"
      :disabled="!control.enabled"
      :options="items"
      v-model="model"
    />
  </b-form-group>
</template>

<script lang="ts">
import {
  ControlElement,
  JsonFormsRendererRegistryEntry,
  rankWith,
  isEnumControl,
} from '@jsonforms/core';
import { defineComponent } from '@vue/composition-api';
import { rendererProps, useJsonFormsControl, RendererProps } from '@jsonforms/vue2';
import { sort } from '@/utils';

interface IData {
  model: string | string[] | undefined;
}

const SelectControlRenderer = defineComponent({
  name: 'select-control-renderer',
  props: {
    ...rendererProps(),
  },
  data: (): IData => ({
    model: undefined,
  }),
  setup(props: RendererProps<ControlElement>) {
    return useJsonFormsControl(props);
  },
  watch: {
    model(value?: string) {
      this.handleChange(
        this.control.path,
        value,
      );
    }
  },
  created() {
    if (this.isMultiple && !Array.isArray(this.control.data))
      this.model = [];
    else
      this.model = this.control.data;
  },
  computed: {
    items(): { value: string, text: string }[] {
      const { enum: items } = this.control.schema;

      if (!items)
        return [];

      return sort(items, x => x.title ?? x).map(x => ({
        text: x.title ?? x,
        value: x.const ?? x,
      }));
    },
    isMultiple(): boolean {
      return this.control.schema.type === 'array';
    },
  }
});
export default SelectControlRenderer;
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: SelectControlRenderer,
  tester: rankWith(20, isEnumControl)
};
</script>