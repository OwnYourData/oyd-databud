declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}

import { VaultItem, VaultSchema } from 'vaultifier'
import { ComponentCustomProperties } from 'vue'
import { Store } from 'vuex'

declare module '@vue/runtime-core' {
  interface State {
    schemaDRIs: VaultSchema[],
    dataItems?: VaultItem[],
    selectedDataItem?: VaultItem,
  }

  interface ComponentCustomProperties {
    $store: Store<State>
  }
}