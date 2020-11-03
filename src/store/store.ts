import { getInstance } from '@/services';
import { VaultItem, VaultMeta, VaultPostItem, VaultRepo, VaultSchema } from 'vaultifier';
import Vue from 'vue';
import Vuex, { Commit } from 'vuex'
import { ActionType } from './action-type';
import { FetchState } from './fetch-state';
import { MutationType } from './mutation-type';

export interface IStore {
  repo: {
    all?: VaultRepo[],
    state: FetchState,
  },
  schemaDRI: {
    all: VaultSchema[],
    state: FetchState,
  },
  vaultItem: {
    all: VaultMeta[],
    allState: FetchState,
    current?: VaultItem,
    currentState: FetchState,
  },
}

interface IFetchState {
  state: FetchState,
  setFetchState: (store: IStore, state: FetchState) => void,
}

async function doFetch<T>(
  commit: Commit,
  asyncFunc: () => Promise<T>,
  setState: (commit: Commit, data: T) => void,
  setFetchState: (store: IStore, state: FetchState) => void,
) {
  const commitObj: IFetchState = {
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
      repo: {
        all: [],
        state: FetchState.NONE,
      },
      schemaDRI: {
        all: [],
        state: FetchState.NONE,
      },
      vaultItem: {
        all: [],
        allState: FetchState.NONE,
        current: undefined,
        currentState: FetchState.NONE,
      },
    }),
    mutations: {
      [MutationType.SET_FETCH_STATE](state, payload: IFetchState) {
        payload.setFetchState(state, payload.state);
      },
      [MutationType.SET_REPOS](state, payload: VaultRepo[]) {
        state.repo.all = payload;
      },
      [MutationType.SET_SCHEMA_DRIS](state, payload: VaultSchema[]) {
        state.schemaDRI.all = payload;
      },
      [MutationType.SET_VAULT_ITEMS](state, payload: VaultItem[]) {
        state.vaultItem.all = payload;
      },
      [MutationType.SET_VAULT_ITEM](state, payload: VaultItem) {
        state.vaultItem.current = payload;
      },
    },
    actions: {
      [ActionType.RESET_VAULT_ITEMS]({ commit }) {
        commit(MutationType.SET_VAULT_ITEMS, undefined);
        commit(MutationType.SET_VAULT_ITEM, undefined);
      },
      async [ActionType.UPDATE_VAULT_ITEM]({state, commit, dispatch}, payload: VaultPostItem) {
        await getInstance().postItem(payload);
      },
      async [ActionType.DELETE_VAULT_ITEM]({ state, commit, dispatch }, payload: VaultMeta) {
        await getInstance().deleteItem({
          id: payload.id,
        });

        if (state.vaultItem.current?.id === payload.id)
          commit(MutationType.SET_VAULT_ITEM, undefined);
      },
      async [ActionType.FETCH_SCHEMA_DRIS]({ commit, dispatch }) {
        doFetch<VaultSchema[]>(
          commit,
          () => getInstance().getSchemas(),
          (commit, data) => {
            dispatch(ActionType.RESET_VAULT_ITEMS);
            commit(MutationType.SET_SCHEMA_DRIS, data);
          },
          (store, state) => store.schemaDRI.state = state
        );
      },
      async [ActionType.FETCH_REPOS]({ commit, dispatch }) {
        doFetch<VaultRepo[] | undefined>(
          commit,
          () => getInstance().getRepos(),
          (commit, data) => {
            dispatch(ActionType.RESET_VAULT_ITEMS);
            commit(MutationType.SET_REPOS, data);
          },
          (store, state) => store.repo.state = state
        );
      },
      async [ActionType.FETCH_VAULT_ITEMS_BY_REPO]({ commit }, payload: VaultRepo) {
        doFetch<VaultMeta[]>(
          commit,
          async () => (await getInstance().fromRepo(payload.name)).getMetaItems(),
          (commit, data) => commit(MutationType.SET_VAULT_ITEMS, data),
          (store, state) => store.vaultItem.allState = state,
        )
      },
      // the hell?
      // here i couldn't use destructuring, as typescript has always complained about having implicit "any" type
      // but for all other functions it works...that's strange
      async [ActionType.FETCH_VAULT_ITEMS_BY_SCHEMA](store, payload: VaultSchema) {
        doFetch<VaultMeta[]>(
          store.commit,
          () => getInstance().getMetaItems({ schemaDri: payload.dri }),
          (commit, data) => commit(MutationType.SET_VAULT_ITEMS, data),
          (store, state) => store.vaultItem.allState = state,
        )
      },
      async [ActionType.FETCH_VAULT_ITEM]({ commit }, payload: VaultMeta) {
        doFetch<VaultItem>(
          commit,
          () => getInstance().getItem({ id: payload.id }),
          (commit, data) => commit(MutationType.SET_VAULT_ITEM, data),
          (store, state) => store.vaultItem.currentState = state,
        )
      },
    }
  });
}