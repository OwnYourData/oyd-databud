import { VaultItem } from 'vaultifier'
// @ts-ignore
import * as oca from '@gebsl/oca.js-vue';

const iterateForm = (form: any, callback: (control: any) => void) => {
  for (const section of form.sections) {
    for (const control of section.row.controls) {
      callback(control);
    }
  }
}

const fillForm = (form: any, content: any) => {
  iterateForm(form, (control) => {
    if (!content[control.attrName])
      // TODO: Error handling
      return;

    control.value = content[control.attrName];
  });
}

export const getObjectFromForm = (form: any) => {
  const obj: any = {}
  
  iterateForm(form, (control) => {
    obj[control.attrName] = control.value;
  });

  return obj;
}

export const getLanguages = (overlays: any[]) => {
  return overlays.reduce((prev: string[], curr: any) => {
    if (curr.language && prev.indexOf(curr.language) === -1)
      return [...prev, curr.language];

    return prev;
  }, []);
}

export const fetchOverlays = async (schemaDri: string): Promise<any[] | undefined> => {
  // TODO: this url should be configurable
  const url = `https://repository.oca.argo.colossi.network/api/v2/schemas/_any/${schemaDri}`;
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

export const renderForm = (overlays: any[], item?: VaultItem, language?: string): any => {
  if (language)
    overlays = overlays.filter((x: any) => !x.language || x.language === language);

  const form = oca.renderForm(overlays).form;

  if (item?.content)
    fillForm(form, item.content);

  return form;
}