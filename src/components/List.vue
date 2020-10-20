<script lang="ts">
import Vue, { PropType, VNode } from 'vue';
import Spinner from './Spinner.vue';
import { dummyComponent } from '../utils';

export interface ListAdapter<T> {
  getTitle: (item: T) => string,
  getId: (item: T) => string,
}

export function createList<T>(adapter: ListAdapter<T>) {
  return Vue.extend({
    props: {
      isLoading: {
        type: Boolean as PropType<boolean>,
        default: false,
      },
      items: {
        type: Array as PropType<T[]>,
      },
      selected: {
        type: Object as PropType<T>,
      }
    },
    render(h) {
      let listItems: VNode[];
      const listItemClass = 'list-group-item list-group-item-action';

      if (this.isLoading) {
        listItems = [
          h('div', {
            class: listItemClass,
          }, [h(Spinner)]),
        ];
      }
      else if (!this.items || this.items.length === 0)
        listItems = [
          h('div', {
            class: listItemClass,
          }, 'No items available')
        ];
      else
        listItems = (this.items as T[]).map(x => {
          const isSelected = !!this.selected && adapter.getId(x) === adapter.getId(this.selected);

          return h('button', {
            class: `${listItemClass}${isSelected ? ' active' : ''}`,
            key: adapter.getId(x),
            on: {
              click: () => this.$emit('select', x),
            }
          },
            adapter.getTitle(x),
          );
        });

      return h('div', undefined, [
        h('ul', {
          staticClass: 'list-group'
        }, listItems)]);
    }
  });
}

// This default is necessary to satisfy vue. Vue always expects a default export
export default dummyComponent;
</script>