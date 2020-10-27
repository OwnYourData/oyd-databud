import { VaultItem } from 'vaultifier'
// @ts-ignore
import * as oca from '@gebsl/oca.js-vue';

const fillForm = (form: any, content: any) => {
  for (const section of form.sections) {
    for (const control of section.row.controls) {
      if (!content[control.attrName]) {
        // TODO: Error handling
      }
      else
        control.value = content[control.attrName];
    }
  }
}

export const renderForm = async (item: VaultItem): Promise<any | undefined> => {
  if (!item.schemaDri)
    return;

  // TODO: this url should be configurable
  const url = `https://repository.oca.argo.colossi.network/api/v2/schemas/hcf/${item.schemaDri}`;
  const response = await fetch(url);
  const json = await response.json();

  const { schema_base, overlays } = json;

  if (!(schema_base && overlays))
    return;

  const allSchemas = [
    schema_base,
    ...overlays,
  ];

  const form = oca.renderForm(allSchemas).form;

  if (item.content)
    fillForm(form, item.content);

  return form;
}