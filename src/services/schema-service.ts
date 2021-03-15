import { getTitle } from '../utils';

interface CacheItem {
  schemaDri: string,
  overlays: any[],
}

export interface SuggestItem {
  schemaBaseDri: string,
  title: string,
}

const ocaDefaultUrl = 'https://repository.oca.argo.colossi.network';

export class SchemaService {
  getItemUrl = (schemaDri: string) => `${this.baseUrl}/api/v3/schemas/${schemaDri}`;
  
  getSuggestUrl = (query: string) => `${this.baseUrl}/api/v3/schemas?suggest=${query}`;
  getOverlaysForSchemaBase = (schemaBaseDri: string) => `${this.baseUrl}/api/v3/schemas?q=${schemaBaseDri}`;
  
  private static INSTANCE = new SchemaService();
  
  private overlaysCache: CacheItem[] = [];
  private baseUrl = ocaDefaultUrl;

  private getSuggestions = async (query: string): Promise<SuggestItem[]> => {
    const res = await fetch(this.getSuggestUrl(query));
    const data = await res.json();

    return data.map((x: any): SuggestItem => ({
      schemaBaseDri: x.DRI,
      title: x.schema.name,
    }));
  }

  private getOverlaySchemaDRIsFromSchemaBase = async (schemaBaseDri: string): Promise<string[]> => {
    const res = await fetch(this.getOverlaysForSchemaBase(schemaBaseDri));
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
      const url = this.getItemUrl(schemaDri);
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
  static setBaseUrl = (baseUrl?: string) => SchemaService.getInstance().baseUrl = baseUrl ?? ocaDefaultUrl;
}