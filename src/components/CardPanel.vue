<script lang="ts">
import Vue, { PropType } from 'vue';

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

    const tabs = children.map((x, idx) => h('li', {
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
      x.componentOptions.propsData.title,
    )]
    ));

    const panelChildren = children.map((x, idx) => {
      // @ts-ignore
      x.componentOptions.propsData.isActive = this.selectedPanelIndex === idx;

      return { ...x };
    });

    return h('div', { staticClass: "card" }, [
      h('ul', { staticClass: 'card-header nav nav-pills' }, tabs),
      h('div', { staticClass: 'tab-content card-body' }, panelChildren),
    ]);
  },
})
</script>