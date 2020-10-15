import SchemaView from '../views/SchemaView.vue';
// import DataList from '../views/DataList.vue';

export enum RoutePath {
  SCHEMA_VIEW = '/',
  DATA_LIST = '/data-list',
}

export const routes = [
  { path: RoutePath.SCHEMA_VIEW, component: SchemaView },
  // { path: RoutePath.DATA_LIST, component: DataList },
];