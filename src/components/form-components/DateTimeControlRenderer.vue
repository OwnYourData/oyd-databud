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
        v-bind:value="textValue"
        type="text"
        placeholder="YYYY-MM-DD HH:mm:ss"
        autocomplete="off"
        ref="input"
        @input="onTextUpdate"
      ></b-form-input>
      <b-input-group-append>
        <b-form-datepicker
          :disabled="!control.enabled"
          :required="control.required"
          v-bind:value="dateValue"
          @input="onDateUpdate"
          locale="en"
          button-only
          right
          today-button
          reset-button
          close-button
        />
        <b-form-timepicker
          :disabled="!control.enabled"
          :required="control.required"
          v-bind:value="timeValue"
          @input="onTimeUpdate"
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
  isDateTimeControl,
} from '@jsonforms/core';
import { defineComponent, ref } from '@vue/composition-api';
import { rendererProps, useJsonFormsControl, RendererProps } from '@jsonforms/vue2';

interface Data {
  state: boolean,
  dateValue?: string,
  timeValue?: string,
}

const DateTimeControlRenderer = defineComponent({
  name: 'date-control-renderer',
  props: {
    ...rendererProps(),
  },
  data: (): Data => ({
    state: false,
    dateValue: undefined,
    timeValue: undefined,
  }),
  setup(props: RendererProps<ControlElement>) {
    const input = ref(null);

    return {
      ...useJsonFormsControl(props),
      input,
    }
  },
  computed: {
    textValue(): string {
      return `${this.dateValue ?? ''}${this.timeValue ? ` ${this.timeValue}` : ''}`;
    }
  },
  mounted() {
    this.validate();

    if (this.control.data) {
      // split ISO date
      const parts = this.control.data.split(/[TZ.]/g);
      this.dateValue = parts[0];
      this.timeValue = parts[1];
    }
  },
  watch: {
    textValue() {
      let date: string | undefined = undefined;

      if (this.dateValue && this.timeValue)
        date = `${this.dateValue}T${this.timeValue}Z`;

      this.handleChange(
        this.control.path,
        date,
      );
      this.validate();
    }
  },
  methods: {
    onTimeUpdate(value?: string) {
      this.timeValue = value;
    },
    onDateUpdate(value?: string) {
      this.dateValue = value;
    },
    onTextUpdate(value?: string) {
      if (!value)
        return this.dateValue = this.timeValue = undefined;

      const parts = value.split(' ').filter(x => x !== '');
      this.dateValue = parts[0];
      this.timeValue = parts[1];
    },

    async validate() {
      // we must await the change in the vue reactivity system
      // to notice the new value
      await this.$nextTick();
      // @ts-expect-error
      this.state = this.input?.checkValidity() || false;

      // TODO: also check if it is a valid date value
    },
  }
});
export default DateTimeControlRenderer;
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: DateTimeControlRenderer,
  tester: rankWith(20, isDateTimeControl)
};
</script>