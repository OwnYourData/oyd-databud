import SchemaList from '../views/SchemaList.vue';
import DataList from '../views/DataList.vue';

export enum RoutePath {
  SCHEMA_LIST = '/',
  DATA_LIST = '/data-list',
}

export const routes = [
  { path: RoutePath.SCHEMA_LIST, component: SchemaList },
  { path: RoutePath.DATA_LIST, component: DataList },
];