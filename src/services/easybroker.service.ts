import { EasyBrokerPropertiesListResponse, EasyBrokerPropertySummary } from "../core/types/easybroker/list-all-properties.types";
import { EasyBrokerPropertyDetails } from "../core/types/easybroker/retrieve-a-property.types";

export class EasyBrokerService {
  private apiKey: string;
  private baseUrl = "https://api.easybroker.com/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getAllProperties(): Promise<EasyBrokerPropertySummary[]> {
    const allProperties: EasyBrokerPropertySummary[] = [];
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const url = `${this.baseUrl}/properties?page=${page}&limit=50`;
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          "X-Authorization": this.apiKey,
        },
      };

      try {
        const response: EasyBrokerPropertiesListResponse = await fetch(url, options).then((res) => res.json());
        
        allProperties.push(...response.content);
        
        hasMorePages = !!response.pagination.next_page;
        page++;
      } catch (error) {
        console.error(`Error fetching page ${page}:`, error);
        throw error;
      }
    }

    return allProperties;
  }

  async getPropertyDetails(publicId: string): Promise<EasyBrokerPropertyDetails> {
    const url = `${this.baseUrl}/properties/${publicId}`;
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        "X-Authorization": this.apiKey,
      },
    };

    try {
      return await fetch(url, options).then((res) => res.json());
    } catch (error) {
      console.error(`Error fetching property ${publicId}:`, error);
      throw error;
    }
  }
}