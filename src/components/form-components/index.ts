import { entry as inputControlRenderer } from './InputControlRenderer.vue';
import { entry as dateControlRenderer } from './DateControlRenderer.vue';
import { entry as multiSelectControlRenderer } from './SelectControlRenderer.vue';

export const formRenderers = [
  inputControlRenderer,
  dateControlRenderer,
  multiSelectControlRenderer,
]