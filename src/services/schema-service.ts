import { getTitle } from '../utils';

interface CacheItem {
  schemaDri: string,
  overlays: any[],
}

export interface SuggestItem {
  schemaBaseDri: string,
  title: string,
}

const baseUrl = 'https://repository.oca.argo.colossi.network';

const getItemUrl = (schemaDri: string) => `${baseUrl}/api/v2/schemas/_any/${schemaDri}`;

const getSuggestUrl = (query: string) => `${baseUrl}/api/v2/schemas?suggest=${query}`;
const getOverlaysForSchemaBase = (schemaBaseDri: string) => `${baseUrl}/api/v2/schemas?_index=branch&schema_base=${schemaBaseDri}`;

export class SchemaService {
  private static INSTANCE = new SchemaService();

  private overlaysCache: CacheItem[] = [];

  private getSuggestions = async (query: string): Promise<SuggestItem[]> => {
    const res = await fetch(getSuggestUrl(query));
    const data = await res.json();

    return data.map((x: any): SuggestItem => ({
      schemaBaseDri: x.DRI,
      title: x.schema.name,
    }));
  }

  private getOverlaySchemaDRIsFromSchemaBase = async (schemaBaseDri: string): Promise<string[]> => {
    const res = await fetch(getOverlaysForSchemaBase(schemaBaseDri));
    const data = await res.json();

    return data.map((x: any) => x.DRI);
  }

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
      const url = getItemUrl(schemaDri);
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
  static getSuggestions = async (query: string) => SchemaService.getInstance().getSuggestions(query);
  static getOverlaySchemaDRIsFromSchemaBase = async (schemaBaseDri: string) => SchemaService.getInstance().getOverlaySchemaDRIsFromSchemaBase(schemaBaseDri);
}