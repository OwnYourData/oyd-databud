<template>
  <b-form-group
    :label="control.label"
    :description="control.uischema.description"
  >
    <b-form-select
      :id="control.id + '-input'"
      :disabled="!control.enabled"
      :options="items"
      :multiple="isMultiple"
      :select-size="selectSize"
      v-model="model"
      @input="onChange"
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
  methods: {
    onChange(value: string | string[]) {
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

      return items.map(value => ({
        value,
        text: value,
      }));
    },
    isMultiple(): boolean {
      return this.control.schema.type === 'array';
    },
    selectSize(): number {
      return this.isMultiple ? 5 : 1;
    },
  }
});
export default SelectControlRenderer;
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: SelectControlRenderer,
  tester: rankWith(20, isEnumControl)
};
</script>