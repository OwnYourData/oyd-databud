export * from './vue';
export * from './i18n';

export function tryGet(obj: any, ...path: string[]) {
  path = path || [];
  return path.reduce((prev, curr) => {
    if (!prev)
      return undefined;

    return prev[curr];
  }, obj);
}