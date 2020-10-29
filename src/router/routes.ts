import MainView from '../views/MainView.vue';
import SchemaView from '../views/SchemaView.vue';

export enum RoutePath {
  MAIN_VIEW = '/',
  SCHEMA_VIEW = '/schema',
}

export const routes = [
  {
    path: RoutePath.MAIN_VIEW,
    component: MainView
  },
  {
    path: RoutePath.SCHEMA_VIEW,
    component: SchemaView,
    props: () => {
      return { schemaDri: new URL(window.location.href).searchParams.get('schemaDri') }
    },
  },
];