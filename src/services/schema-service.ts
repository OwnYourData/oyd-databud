import { getTitle } from '../utils';

interface CacheItem {
  schemaDri: string,
  overlays: any[],
}

export class SchemaService {
  private static INSTANCE = new SchemaService();

  private overlaysCache: CacheItem[] = [];

  private getTitle = async (schemaDri: string): Promise<string | undefined> => {
    const overlays = await this.getOverlays(schemaDri);

    if (overlays)
      return getTitle(overlays);

    return;
  }

  private getOverlays = async (schemaDri: string): Promise<any[] | undefined> => {
    let item = this.overlaysCache.find(x => x.schemaDri === schemaDri);

    if (!item) {
      // TODO: this url should be configurable
      const url = `https://repository.oca.argo.colossi.network/api/v2/schemas/_any/${schemaDri}`;
      const response = await fetch(url);
      const json = await response.json();

      let { schema_base, overlays } = json;

      if (!(schema_base && overlays))
        return;

      item = {
        schemaDri,
        overlays: [
          schema_base,
          ...overlays,
        ],
      };

      this.overlaysCache.push(item);
    }

    return item.overlays
  }

  static getInstance = () => SchemaService.INSTANCE;
  static getOverlays = async (schemaDri: string) => SchemaService.getInstance().getOverlays(schemaDri);
  static getTitle = async (schemaDri: string) => SchemaService.getInstance().getTitle(schemaDri);
}