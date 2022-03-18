<template>
  <b-form-group
    :label="control.label"
    :description="control.uischema.description"
  >
    <b-input-group class="mb-3">
      <b-form-input
        :id="control.id + '-input'"
        :disabled="!control.enabled"
        :required="control.required"
        :state="state"
        v-model="control.data"
        type="text"
        placeholder="YYYY-MM-DD"
        autocomplete="off"
        ref="input"
        @input="onChange"
      ></b-form-input>
      <b-input-group-append>
        <b-form-datepicker
          :disabled="!control.enabled"
          :required="control.required"
          v-model="control.data"
          @input="onChange"
          locale="en"
          button-only
          right
          today-button
          reset-button
          close-button
        />
      </b-input-group-append>
    </b-input-group>

    <b-form-invalid-feedback>
      Input could not be validated.
    </b-form-invalid-feedback>
  </b-form-group>
</template>

<script lang="ts">
import {
  ControlElement,
  JsonFormsRendererRegistryEntry,
  rankWith,
  isDateControl,
} from '@jsonforms/core';
import { defineComponent, ref } from '@vue/composition-api';
import { rendererProps, useJsonFormsControl, RendererProps } from '@jsonforms/vue2';

const DateControlRenderer = defineComponent({
  name: 'date-control-renderer',
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
    async validate() {
      // we must await the change in the vue reactivity system
      // to notice the new value
      await this.$nextTick();
      // @ts-expect-error
      this.state = this.input?.checkValidity() || false;

      // TODO: also check if it is a valid date value
    },
    onChange(value: string) {
      this.handleChange(
        this.control.path,
        value,
      );
      this.validate();
    }
  }
});
export default DateControlRenderer;
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: DateControlRenderer,
  tester: rankWith(20, isDateControl)
};
</script>