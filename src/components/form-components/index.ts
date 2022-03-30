import { entry as inputControlRenderer } from './InputControlRenderer.vue';
import { entry as dateControlRenderer } from './DateControlRenderer.vue';
import { entry as dateTimeControlRenderer } from './DateTimeControlRenderer.vue';
// import { entry as timeControlRenderer } from './TimeControlRenderer.vue';
import { entry as multiSelectControlRenderer } from './SelectControlRenderer.vue';

export const formRenderers = [
  inputControlRenderer,
  dateControlRenderer,
  dateTimeControlRenderer,
  // TODO: we need to define how we'll save times
  // ISO format does not seem to be appropriate
  // timeControlRenderer,
  multiSelectControlRenderer,
]