import { Vaultifier } from 'vaultifier/dist/module';
import { VaultifierWeb } from 'vaultifier/dist/module/environments';

let vaultifier: Vaultifier;

export const getInstance = (): Vaultifier => vaultifier;
export const initialize = async (
  repo: string,
): Promise<Vaultifier> => {
  vaultifier = VaultifierWeb.create(
    repo,
  );

  await vaultifier.initialize();

  return vaultifier;
}