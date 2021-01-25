<template>
  <div class="row">
    <div class="col-md-6">
      <div class="top-container">
        <h3 class="heading">Meta</h3>
      </div>
      <raw-json :data="meta" />
    </div>
    <div class="col-md-6">
      <div class="top-container">
        <h3 class="heading">Content</h3>
        <span
          class="text-muted"
          v-if="isEncrypted"
        > (encrypted)</span>
        <b-checkbox
          class="check"
          v-model="isEditable"
        >Editable</b-checkbox>
        <custom-button
          class="btn-save"
          @click="save"
          :type="isSaving ? 'primary-outline' : undefined"
          v-if="isEditable"
          :disabled="isSaving"
        >
          <spinner v-if="isSaving" />
          <template v-else>
            Save
          </template>
        </custom-button>

      </div>

      <b-textarea
        v-if="isEditable"
        v-model="editableContent"
        rows="10"
        class="textarea"
      />
      <raw-json
        v-else
        :data="item.content"
      />
    </div>
  </div>
</template>

<script lang="ts">
// @ts-ignore
import { MimeType, VaultItem, VaultPostItem } from 'vaultifier';
import Vue, { PropType } from 'vue'
import RawJson from './RawJson.vue';
import CustomButton from './Button.vue';
import Spinner from './Spinner.vue';

interface Data {
  isEditable: boolean;
  editableContent: string;
}

export default Vue.extend({
  components: {
    RawJson,
    CustomButton,
    Spinner,
  },
  props: {
    item: {
      type: Object as PropType<VaultItem>,
    },
    isSaving: {
      type: Boolean as PropType<boolean>,
    }
  },
  data: (): Data => ({
    isEditable: false,
    editableContent: '',
  }),
  created() {
    this.resetEditableContent();
  },
  methods: {
    resetEditableContent() {
      this.editableContent = JSON.stringify(this.item.content, undefined, 2);
    },
    save() {
      console.log('save')
      const postItem: VaultPostItem = {
        ...this.item,
        mimeType: this.item.mimeType ?? MimeType.PLAIN,
      };

      this.$emit('save', postItem);
    },
  },
  watch: {
    editableContent(value: string) {
      try {
        this.item.content = JSON.parse(value);
      } catch { /* */ }
    },
    item() {
      this.resetEditableContent();
    },
  },
  computed: {
    meta(): any {
      const copy = { ...this.item };
      delete copy.content;
      // @ts-ignore
      delete copy.raw;

      return copy;
    },
    isEncrypted(): boolean {
      return this.item.isEncrypted;
    }
  }
});
</script>

<style scoped>
.top-container {
  display: flex;
  align-items: center;
  margin-bottom: 1em;
}

.check {
  margin-left: 1em;
}

.btn-save {
  margin-left: auto;
}

.textarea {
  font-family: monospace;
}
</style>