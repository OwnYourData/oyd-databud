export class TDAService {
  private static INSTANCE: TDAService = new TDAService();
  static getInstance = () => TDAService.INSTANCE;

  private constructor() { }

  private _tdaUrl?: string;

  setTDAUrl = (url: string) => {
    this._tdaUrl = url;
  }

  createAdminInvitationUrl = async (tdaFrontendUrl: string): Promise<string | undefined> => {
    let data: any;

    try {
      const res = await fetch(`${this._tdaUrl}/connections/create-admin-invitation-url`, { method: 'POST' });
      data = await res.json();
    }
    catch {
      return;
    }

    return `${tdaFrontendUrl}?invitation_url=${data.invitation_url}`;
  }

  setupPDSSettings = async (
    apiUrl: string,
    clientId: string,
    clientSecret: string,
    grantType: string,
    name: string = 'Data Store',
    scope?: string,
  ) => {
    const obj: any = {
      settings:
      {
        own_your_data: {
          api_url: apiUrl,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: grantType,
          optional_instance_name: name,
        }
      }
    };

    if (scope)
      obj.settings.own_your_data.scope = scope;

    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      await fetch(`${this._tdaUrl}/pds/settings`, {
        method: 'POST',
        body: JSON.stringify(obj),
        headers,
      });

      await fetch(`${this._tdaUrl}/pds/activate?type=own_your_data&optional_name=${name}`, {
        method: 'POST',
        headers,
      });
    }
    catch { /* */ }
  }
}