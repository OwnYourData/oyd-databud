<template>
  <label>
    {{control.label}}

    <b-form-input
      :id="control.id + '-input'"
      :disabled="!control.enabled"
      :required="control.required"
      :maxLength="control.schema.maxLength"
      :pattern="control.schema.pattern"
      :state="state"
      v-model="control.data"
      @input="onChange"
      ref="input"
    />

    <b-form-invalid-feedback>
      Input could not be validated.
    </b-form-invalid-feedback>
  </label>
</template>

<script lang="ts">
import {
  ControlElement,
  JsonFormsRendererRegistryEntry,
  rankWith,
  isStringControl,
} from '@jsonforms/core';
import { defineComponent, ref } from '@vue/composition-api';
import { rendererProps, useJsonFormsControl, RendererProps } from '@jsonforms/vue2';

const InputControlRenderer = defineComponent({
  name: 'input-control-renderer',
  props: {
    ...rendererProps(),
  },
  data: () => ({
    state: false,
  }),
  setup(props: RendererProps<ControlElement>) {
    const input = ref(null);

    return {
      ...useJsonFormsControl(props),
      input,
    }
  },
  mounted() {
    this.validate();
  },
  methods: {
    validate() {
      // @ts-expect-error
      this.state = this.input?.checkValidity() || false;
    },
    onChange(value: string) {
      this.validate();
      this.handleChange(
        this.control.path,
        value,
      );
    }
  },
});
export default InputControlRenderer;
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: InputControlRenderer,
  tester: rankWith(10, isStringControl)
};
</script>