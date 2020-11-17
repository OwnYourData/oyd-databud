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
}