<script lang="ts">
import Vue, { PropType, VNodeChildren, VNode } from 'vue';
import { component } from 'vue/types/umd';

interface Tab {
  title: string,
  isSelected: boolean,
}

export default Vue.extend({
  data: () => ({
    selectedPanelIndex: 0,
  }),
  render(h) {
    const that = this;
    const children = this.$slots.default;

    if (!children)
      return h('div');

    const tabs: VNode[] = [];
    const panelChildren: VNode[] = [];

    let idx = -1;
    for (let idx = 0, size = children.length; idx < size; idx++) {
      const child = children[idx];
      
      if (!child.componentOptions)
        continue;

      const props = child.componentOptions.propsData;

      tabs.push(h('li', {
        staticClass: 'nav-item',
        key: idx,
      }, [h('a', {
        staticClass: 'nav-link',
        class: this.selectedPanelIndex === idx ? 'active' : null,
        on: {
          click: () => {
            that.selectedPanelIndex = idx;
          }
        },
        domProps: {
          href: '#'
        }
      },
        // @ts-ignore
        props.title,
      )]
      ));

      // @ts-ignore
      props.isActive = this.selectedPanelIndex === idx;
      panelChildren.push({
        ...child,
      });
    }

    return h('div', { staticClass: "card" }, [
      h('ul', { staticClass: 'card-header nav nav-pills' }, tabs),
      h('div', { staticClass: 'tab-content card-body' }, panelChildren),
    ]);
  },
})
</script>