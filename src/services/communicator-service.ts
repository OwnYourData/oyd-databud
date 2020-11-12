import { Vaultifier } from 'vaultifier/dist/module';
import { VaultifierWeb } from 'vaultifier/dist/module/environments';
import { ConfigService } from './config-service';

let vaultifier: Vaultifier;

export const getInstance = (): Vaultifier => vaultifier;
export const create = async (): Promise<Vaultifier> => {
  try {
    // first of all trying to create an instance out of url params
    return vaultifier = await VaultifierWeb.create();
  }
  catch {
    // if url params do not work, we try to get the url from our config
    let endpoint = ConfigService.get('endpoint', 'url');

    // ...still not working? Just take the document's origin
    if (!endpoint)
      endpoint = window.location.origin;

    return vaultifier = new Vaultifier(endpoint);
  }
}