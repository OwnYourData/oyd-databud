<template>
  <label>
    {{control.label}}

    <b-form-select
      :id="control.id + '-input'"
      :disabled="!control.enabled"
      :options="items"
      v-model="control.data"
      @input="onChange"
    />
  </label>
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

const InputControlRenderer = defineComponent({
  name: 'input-control-renderer',
  props: {
    ...rendererProps(),
  },
  setup(props: RendererProps<ControlElement>) {
    return useJsonFormsControl(props);
  },
  methods: {
    onChange(value: string) {
      this.handleChange(
        this.control.path,
        value,
      );
    }
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
    }
  }
});
export default InputControlRenderer;
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: InputControlRenderer,
  tester: rankWith(20, isEnumControl)
};
</script>