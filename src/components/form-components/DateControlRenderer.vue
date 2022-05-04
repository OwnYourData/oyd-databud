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
        v-model="dateValue"
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
          v-model="dateValue"
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

interface Data {
  state: boolean,
  dateValue?: string,
}

const DateControlRenderer = defineComponent({
  name: 'date-control-renderer',
  props: {
    ...rendererProps(),
  },
  data: (): Data => ({
    state: false,
    dateValue: undefined,
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
  watch: {
    control: {
      deep: true,
      immediate: true,
      handler: function (val) {
        if (val?.data) {
          // split ISO date
          const parts = val.data.split(/[TZ.]/g);
          this.dateValue = parts[0];
        }
        else
          this.dateValue = undefined;
      },
    }
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
        `${this.dateValue}Z00:00:00T`,
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