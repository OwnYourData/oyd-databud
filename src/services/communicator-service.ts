import { Vaultifier } from 'vaultifier/dist/module';
import { VaultifierWeb } from 'vaultifier/dist/module/environments';
import { ConfigService } from './config-service';

let vaultifier: Vaultifier;

export const getInstance = (): Vaultifier => vaultifier;
export const create = (): Vaultifier => {
  const repo = '';

  try {
    // first of all trying to get data out of url params
    return vaultifier = VaultifierWeb.create(repo);
  }
  catch {
    // if url params do not work, we try to get the url from our config
    let endpoint = ConfigService.get('endpoint', 'url');

    // ...still not working? Just take the document's origin
    if (!endpoint)
      endpoint = window.location.origin;

    return vaultifier = new Vaultifier(endpoint, repo);
  }
}