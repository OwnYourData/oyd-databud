import { VaultItem } from 'vaultifier'
// @ts-ignore
import * as oca from '@gebsl/oca.js-vue';

const fillForm = (form: any, content: any) => {
  for (const section of form.sections) {
    for (const control of section.row.controls) {
      if (!content[control.attrName]) {
        // TODO: Error handling
      }
      else {
        let value = content[control.attrName];

        if (control.type === 'select') {
          const option = control.dataOptions.find((x: any) => x.text === value);
          
          value = option ? option.id : undefined;
        }

        control.value = value;
      }
    }
  }
}

export const getLanguages = (overlays: any[]) => {
  return overlays.reduce((prev: string[], curr: any) => {
    if (curr.type.indexOf('label') !== -1)
      return [...prev, curr.language];

    return prev;
  }, []);
}

export const fetchOverlays = async (item: VaultItem): Promise<any[] | undefined> => {
  if (!item.schemaDri)
    return;

  // TODO: this url should be configurable
  const url = `https://repository.oca.argo.colossi.network/api/v2/schemas/hcf/${item.schemaDri}`;
  const response = await fetch(url);
  const json = await response.json();

  let { schema_base, overlays } = json;

  if (!(schema_base && overlays))
    return;

  return [
    schema_base,
    ...overlays,
  ];
}

export const renderForm = (overlays: any[], item: VaultItem, language?: string): any => {
  if (language)
    overlays = overlays.filter((x: any) => !x.language || x.language === language);
    
  const form = oca.renderForm(overlays).form;

  if (item.content)
    fillForm(form, item.content);

  return form;
}