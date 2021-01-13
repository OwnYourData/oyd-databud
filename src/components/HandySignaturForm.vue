<template>
  <form
    action="https://www.a-trust.at/mobile/https-security-layer-request/default.aspx"
    enctype="application/x-www-form-urlencoded"
    method="post"
    ref="form"
  >
    <input
      type="hidden"
      name="XMLRequest"
      v-model="xmlBody"
    />

    <input
      type="hidden"
      name="DataURL"
      v-model="responseUrl"
    />
  </form>

</template>

<script lang="ts">
import { getInstance } from '../services/communicator-service';
import { VaultItem } from 'vaultifier';
import Vue, { PropType } from 'vue'

interface Data {
  eidasToken?: string,
}

export default Vue.extend({
  props: {
    item: Object as PropType<VaultItem>,
  },
  data: (): Data => ({
    eidasToken: undefined,
  }),
  methods: {
    async sign(): Promise<void> {
      this.eidasToken = await getInstance().getEidasToken(this.item.id);
      // wait until vue has redrawn the HTML
      await Vue.nextTick();

      if (this.isValid) {
        (this.$refs.form as HTMLFormElement).submit();
        // if everything is fine we return a promise that will not be resolved
        // because the current page will be left and there is nothing more to do :-)
        return new Promise(() => undefined);
      }
    }
  },
  computed: {
    isValid(): boolean {
      return !!(this.responseUrl && this.xmlBody);
    },
    responseUrl(): string | undefined {
      if (this.eidasToken)
        return getInstance().urls.getEidasExternalUrl(this.item.id, this.eidasToken);

      return undefined;
    },
    xmlBody(): string | undefined {
      if (this.item.raw) {
        return `
<?xml version='1.0' encoding='UTF-8'?>
<sl:CreateCMSSignatureRequest xmlns:sl='http://www.buergerkarte.at/namespaces/securitylayer/1.2#' Structure='enveloping'>
  <sl:KeyboxIdentifier>SecureSignatureKeypair</sl:KeyboxIdentifier>
  <sl:DataObject>
    <sl:MetaInfo>
      <sl:MimeType>text/plain</sl:MimeType>
    </sl:MetaInfo>
    <sl:Content>
      <sl:Base64Content>${btoa(JSON.stringify(this.item.raw, undefined, 2))}</sl:Base64Content>
    </sl:Content>
  </sl:DataObject>
</sl:CreateCMSSignatureRequest>`.trim();
      }

      return undefined;
    }
  }
})
</script>