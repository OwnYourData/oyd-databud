<template>
  <b-form-group
    :label="control.label"
    :description="control.uischema.description"
  >
    <b-form-datepicker
      :id="control.id + '-input'"
      :disabled="!control.enabled"
      v-model="control.data"
      @input="onChange"
    />
  </b-form-group>
</template>

<script lang="ts">
import {
  ControlElement,
  JsonFormsRendererRegistryEntry,
  rankWith,
  isDateControl,
} from '@jsonforms/core';
import { defineComponent } from '@vue/composition-api';
import { rendererProps, useJsonFormsControl, RendererProps } from '@jsonforms/vue2';

const DateControlRenderer = defineComponent({
  name: 'date-control-renderer',
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
export default DateControlRenderer;
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: DateControlRenderer,
  tester: rankWith(20, isDateControl)
};
</script>