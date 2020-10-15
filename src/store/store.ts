import { getInstance } from '@/services';
import { VaultItem, VaultMinMeta, VaultSchema } from 'vaultifier';
import Vue from 'vue';
import Vuex, { Commit } from 'vuex'
import { ActionType } from './action-type';
import { FetchState } from './fetch-state';
import { MutationType } from './mutation-type';

export interface IStore {
  schemaDRI: {
    all: VaultSchema[],
    state: FetchState,
  },
  vaultItem: {
    all: VaultMinMeta[],
    state: FetchState,
  },
}

interface ISomething {
  state: FetchState,
  setFetchState: (store: IStore, state: FetchState) => void,
}

async function doFetch<T>(
  commit: Commit,
  asyncFunc: () => Promise<T>,
  setState: (commit: Commit, data: T) => void,
  setFetchState: (store: IStore, state: FetchState) => void,
) {
  const commitObj: ISomething = {
    setFetchState,
    state: FetchState.FETCHING,
  }

  commit(MutationType.SET_FETCH_STATE, commitObj);
  try {
    setState(commit, await asyncFunc());

    commitObj.state = FetchState.SUCCESS;
    commit(MutationType.SET_FETCH_STATE, commitObj)
  }
  catch {
    commitObj.state = FetchState.ERROR;
    commit(MutationType.SET_FETCH_STATE, commitObj);
  }
}

export const getStore = () => {
  Vue.use(Vuex);

  return new Vuex.Store({
    state: (): IStore => ({
      schemaDRI: {
        all: [],
        state: FetchState.NONE,
      },
      vaultItem: {
        all: [],
        state: FetchState.NONE,
      },
    }),
    mutations: {
      [MutationType.SET_FETCH_STATE](state, payload: ISomething) {
        payload.setFetchState(state, payload.state);
      },
      [MutationType.SET_SCHEMA_DRIS](state, payload: VaultSchema[]) {
        state.schemaDRI.all = payload;
      },
      [MutationType.SET_VAULT_ITEMS](state, payload: VaultItem[]) {
        state.vaultItem.all = payload;
      },
    },
    actions: {
      async [ActionType.FETCH_SCHEMA_DRIS]({ commit }) {
        doFetch<VaultSchema[]>(
          commit,
          () => getInstance().getSchemas(),
          (commit, data) => commit(MutationType.SET_SCHEMA_DRIS, data),
          (store, state) => store.schemaDRI.state = state
        );
      },
      async [ActionType.FETCH_VAULT_ITEMS]({ commit }, payload: VaultSchema) {
        doFetch<VaultMinMeta[]>(
          commit,
          () => getInstance().getValues({ schemaDri: payload.dri }),
          (commit, data) => commit(MutationType.SET_VAULT_ITEMS, data),
          (store, state) => store.vaultItem.state = state,
        )
      },
    }
  });
}