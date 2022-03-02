<template>
  <label>
    {{control.label}}

    <b-form-input
      :id="control.id + '-input'"
      :disabled="!control.enabled"
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
  isStringControl,
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
  }
});
export default InputControlRenderer;
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: InputControlRenderer,
  tester: rankWith(10, isStringControl)
};
</script>