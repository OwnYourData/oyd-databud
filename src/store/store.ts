import Vue from 'vue';
import Vuex from 'vuex'
import { MutationType } from './mutation-type';

export const getStore = () => {
  Vue.use(Vuex);

  return new Vuex.Store({
    state: () => ({
      schemaDRIs: [],
      dataItems: [],
      selectedDataItem: undefined,
    }),
    mutations: {
      [MutationType.SET_SCHEMA_DRIS](state, payload) {
        state.schemaDRIs = payload;
      },
      [MutationType.SET_DATA_ITEMS](state, payload) {
        state.dataItems = payload;
      },
      [MutationType.SET_SELECTED_DATA_ITEM](state, payload) {
        state.selectedDataItem = payload;
      }
    }
  });
}