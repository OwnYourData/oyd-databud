import { Vaultifier } from 'vaultifier/dist/module';
import { VaultifierWeb } from 'vaultifier/dist/module/environments';

let vaultifier: Vaultifier;

export const getInstance = (): Vaultifier => vaultifier;
export const initialize = async (
  repo: string,
  endpoint?: string,
  appKey?: string,
  appSecret?: string,
): Promise<Vaultifier> => {
  if (endpoint && appKey && appSecret)
    vaultifier = new Vaultifier(endpoint, repo, {
      appKey,
      appSecret,
    });
  else
    vaultifier = VaultifierWeb.create(
      repo,
    );

  await vaultifier.initialize();

  return vaultifier;
}