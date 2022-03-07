export * from './vue';
export * from './i18n';
export * from './deflate';
export * from './plantuml';

export function tryGet(obj: any, ...path: string[]) {
  path = path || [];
  return path.reduce((prev, curr) => {
    if (!prev)
      return undefined;

    return prev[curr];
  }, obj);
}