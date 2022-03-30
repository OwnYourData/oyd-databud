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
        placeholder="HH:mm:ss"
        autocomplete="off"
        ref="input"
        @input="onChange"
      ></b-form-input>
      <b-input-group-append>
        <b-form-timepicker
          :disabled="!control.enabled"
          :required="control.required"
          v-model="control.data"
          @input="onChange"
          locale="de"
          button-only
          right
          show-seconds
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
  isTimeControl,
} from '@jsonforms/core';
import { defineComponent, ref } from '@vue/composition-api';
import { rendererProps, useJsonFormsControl, RendererProps } from '@jsonforms/vue2';

const TimeControlRenderer = defineComponent({
  name: 'time-control-renderer',
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

      // TODO: also check if it is a valid time value
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
export default TimeControlRenderer;
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: TimeControlRenderer,
  tester: rankWith(20, isTimeControl)
};
</script>