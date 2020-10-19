import MainView from '../views/MainView.vue';
// import DataList from '../views/DataList.vue';

export enum RoutePath {
  MAIN_VIEW = '/',
  DATA_LIST = '/data-list',
}

export const routes = [
  { path: RoutePath.MAIN_VIEW, component: MainView },
  // { path: RoutePath.DATA_LIST, component: DataList },
];