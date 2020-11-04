<template>
  <div>
    <custom-button @click="saveEdit">Save</custom-button>
    <custom-button @click="cancelEdit">Cancel</custom-button>

    <oca-view
      ref="ocaView"
      :item="item"
      :schemaDri="schemaDri"
    ></oca-view>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { MimeType, VaultItem, VaultPostItem} from 'vaultifier';
import OcaView from './OCAView.vue';
import CustomButton from './Button.vue';
import { getObjectFromForm } from '@/utils';

export default Vue.extend({
  components: {
    OcaView,
    CustomButton,
  },
  props: {
    schemaDri: String as PropType<string>,
    item: Object as PropType<VaultItem>,
  },
  methods: {
    async saveEdit() {
      const content = getObjectFromForm((this.$refs.ocaView as any).form);
      const postItem: VaultPostItem = {
        content: getObjectFromForm((this.$refs.ocaView as any).form),
        // TODO:
        dri: Date.now() + '___shouldbesetbyclient',
        schemaDri: this.schemaDri,
        mimeType: MimeType.JSON,
      };

      this.$emit('save', postItem);
    },
    cancelEdit() {
      this.$emit('cancel');
    },
  }
})
</script>