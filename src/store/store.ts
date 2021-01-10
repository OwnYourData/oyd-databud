import { getInstance } from '@/services';
import { SchemaService } from '@/services/schema-service';
import { getTitle } from '@/utils';
import { MultiResponse, Paging, VaultItem, VaultMeta, VaultMinMeta, VaultPostItem, VaultRepo, VaultSchema, VaultTable, } from 'vaultifier';
import Vue from 'vue';
import Vuex, { Commit } from 'vuex'
import { ActionType } from './action-type';
import { FetchState } from './fetch-state';
import { MutationType } from './mutation-type';

export interface IFetchVaultItems {
  page?: number;
  table?: VaultTable;
  repo?: VaultRepo;
  schema?: VaultSchema;
}
export interface IStore {
  repo: {
    all?: VaultRepo[],
    state: FetchState,
  },
  table: {
    all: VaultTable[],
    state: FetchState,
  }
  schemaDRI: {
    all: VaultSchema[],
    state: FetchState,
  },
  vaultItem: {
    all: VaultMeta[],
    allState: FetchState,
    current?: VaultItem,
    currentState: FetchState,
    paging?: Paging,
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
      table: {
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
        paging: undefined,
      },
    }),
    mutations: {
      [MutationType.SET_FETCH_STATE](state, payload: IFetchState) {
        payload.setFetchState(state, payload.state);
      },
      [MutationType.SET_REPOS](state, payload: VaultRepo[]) {
        state.repo.all = payload;
      },
      [MutationType.SET_TABLES](state, payload: VaultTable[]) {
        state.table.all = payload;
      },
      [MutationType.SET_SCHEMA_DRIS](state, payload: VaultSchema[]) {
        state.schemaDRI.all = payload;
      },
      [MutationType.SET_VAULT_ITEMS](state, payload: VaultMeta[]) {
        state.vaultItem.all = payload;
      },
      [MutationType.SET_VAULT_ITEM](state, payload: VaultItem) {
        state.vaultItem.current = payload;
      },
      [MutationType.SET_SCHEMA_DRI_TITLE](state, payload: VaultSchema) {
        const item = state.schemaDRI.all.find(x => x.dri === payload.dri);

        if (item)
          item.title = payload.title;
      },
      [MutationType.SET_VAULT_ITEMS_PAGING](state, payload?: Paging) {
        state.vaultItem.paging = payload;
      },
    },
    actions: {
      [ActionType.RESET_VAULT_ITEMS]({ commit }) {
        commit(MutationType.SET_VAULT_ITEMS, undefined);
        commit(MutationType.SET_VAULT_ITEM, undefined);
        commit(MutationType.SET_VAULT_ITEMS_PAGING, undefined);
      },
      async [ActionType.UPDATE_VAULT_ITEM]({ state, commit, dispatch }, payload: VaultPostItem) {
        if (payload.id) {
          await getInstance().updateItem(payload);
          dispatch(ActionType.FETCH_VAULT_ITEM, { id: payload.id } as VaultMinMeta);
        }
        else
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
            dispatch(ActionType.FETCH_SCHEMAS_TITLE);
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
      async [ActionType.FETCH_TABLES]({ commit, dispatch }) {
        doFetch<VaultTable[]>(
          commit,
          () => getInstance().getTables(),
          (commit, data) => {
            dispatch(ActionType.RESET_VAULT_ITEMS);
            commit(MutationType.SET_TABLES, data);
          },
          (store, state) => store.table.state = state
        );
      },
      async [ActionType.FETCH_VAULT_ITEMS]({ commit, state }, { page, table, repo, schema }: IFetchVaultItems) {
        // reset currently selected vault item if list of vault items is refreshed
        commit(MutationType.SET_VAULT_ITEM, undefined);

        doFetch<MultiResponse<VaultMeta>>(
          commit,
          async () => {
            if (repo)
              return (await getInstance().fromRepo(repo.name)).getMetaItems(page ? {
                page: {
                  page,
                },
              } : undefined)
            else if (schema || table)
              return getInstance().getMetaItems({
                schemaDri: schema?.dri,
                tableId: table?.id,
                page: {
                  page,
                },
              });
            else
              throw new Error('Schema, repo and table are undefined');
          },
          (commit, data) => {
            commit(MutationType.SET_VAULT_ITEMS, data.content);
            commit(MutationType.SET_VAULT_ITEMS_PAGING, data.paging);
          },
          (store, state) => store.vaultItem.allState = state,
        );
      },
      async [ActionType.FETCH_VAULT_ITEM]({ commit }, payload: VaultMinMeta) {
        doFetch<VaultItem>(
          commit,
          () => getInstance().getItem({ id: payload.id }),
          (commit, data) => commit(MutationType.SET_VAULT_ITEM, data),
          (store, state) => store.vaultItem.currentState = state,
        )
      },
      async [ActionType.FETCH_SCHEMAS_TITLE]({ commit, state }) {
        for (const schema of state.schemaDRI.all) {
          SchemaService.getOverlays(schema.dri).then(overlays => {
            if (overlays) {
              schema.title = getTitle(overlays);
              commit(MutationType.SET_SCHEMA_DRI_TITLE, schema);
            }
          });
        }
      },
    }
  });
}