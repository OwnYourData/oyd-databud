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
      track-by="value"
      label="text"
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
  or,
  isOneOfEnumControl,
  isOneOfControl,
  isEnumControl,
} from '@jsonforms/core';
import { defineComponent } from '@vue/composition-api';
import { rendererProps, useJsonFormsControl, RendererProps } from '@jsonforms/vue2';
import { sort } from '@/utils';

interface IData {
  model: string | string[] | SelectItem[] | undefined;
}

interface SelectItem {
  value: string;
  text: string;
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
    model(value?: string | string[] | SelectItem[]) {
      let val = value;

      if (Array.isArray(val))
        val = val.map(item => {
          // multiselect returns values as object
          // but we only want to save the values, not the whole object
          // therefore we extract it here
          if (typeof item === 'object')
            return item.value;
          else
            return item;
        });

      this.handleChange(
        this.control.path,
        val,
      );
    }
  },
  created() {
    if (this.isMultiple)
      if (Array.isArray(this.control.data))
        // we only save values as data
        // however the multiselect control expects objects (including the text) as model value
        // therefore we find the corresponding object for each value
        this.model = this.control.data
          .map(val => this.items.find(it => it.value === val))
          .filter(x => x !== undefined) as SelectItem[];
      else
        this.model = [];
    else
      this.model = this.control.data;
  },
  computed: {
    items(): SelectItem[] {
      const { schema } = this.control;
      // support both `enum` and `oneOf`
      const items: any[] | undefined = schema.enum || schema.oneOf;

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
  tester: rankWith(20, or(isOneOfControl, isEnumControl, isOneOfEnumControl))
};
</script>