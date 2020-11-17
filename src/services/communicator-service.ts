import { Vaultifier } from 'vaultifier/dist/module';
import { VaultifierWeb } from 'vaultifier/dist/module/environments';
import { ConfigService } from './config-service';

let vaultifier: Vaultifier;

export const getInstance = (): Vaultifier => vaultifier;
export const create = async (): Promise<Vaultifier> => {
  let isValid: boolean = false;

  try {
    // first of all trying to create an instance out of url params or default values
    vaultifier = await VaultifierWeb.create();
    isValid = await vaultifier.isValid()
  }
  catch { /* */ }

  if (isValid)
    return vaultifier;

  return vaultifier = new Vaultifier(ConfigService.get('endpoint', 'url') || undefined);
}