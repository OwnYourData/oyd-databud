<script lang="ts">
import Vue, { PropType, VNode } from 'vue'

export interface ListAdapter<T> {
  getTitle: (item: T) => string,
  getKey: (item: T) => string,
}

export default function createList<T>(adapter: ListAdapter<T>) {
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

      if (!this.items)
        listItems = [
          h('div', {
            class: listItemClass,
          }, 'Nothing to do here...')
        ];
      else
        listItems = (this.items as T[]).map(x =>
          h('button', {
            class: `${listItemClass}${x === this.selected ? ' active' : ''}`,
            key: adapter.getKey(x),
            on: {
              click: () => this.$emit('select', x),
            }
          },
            adapter.getTitle(x),
          )
        );

      return h('ul', {
        class: 'list-group'
      }, listItems);
    }
  });
}
</script>