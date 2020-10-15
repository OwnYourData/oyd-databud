<script lang="ts">
import { dummyComponent } from '../utils';
import Vue, { PropType, VNode } from 'vue'

export interface ListAdapter<T> {
  getTitle: (item: T) => string,
  getId: (item: T) => string,
}

export function createList<T>(adapter: ListAdapter<T>) {
  return Vue.extend({
    props: {
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

      if (!this.items || this.items.length === 0)
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

      return h('ul', {
        class: 'list-group'
      }, listItems);
    }
  });
}

// This default is necessary to satisfy vue. Vue always expects a default export
export default dummyComponent;
</script>