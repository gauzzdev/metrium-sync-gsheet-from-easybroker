import { EasyBrokerPropertiesListResponse, EasyBrokerPropertySummary } from "../core/types/easybroker/list-all-properties.types";
import { EasyBrokerPropertyDetails } from "../core/types/easybroker/retrieve-a-property.types";

export class EasyBrokerService {
  private apiKey: string;
  private baseUrl = "https://api.easybroker.com/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getPropertiesByPageRange(startPage: number = 1, endPage: number = 1): Promise<EasyBrokerPropertySummary[]> {
    const allProperties: EasyBrokerPropertySummary[] = [];
    
    // Validate page range
    if (startPage < 1 || endPage < startPage || (endPage - startPage + 1) > 10) {
      throw new Error("Invalid page range. Maximum 10 pages and end page must be >= start page");
    }

    for (let page = startPage; page <= endPage; page++) {
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
        
        console.log(`Página ${page} procesada: ${response.content.length} propiedades`);
        
        // If no more pages available, break early
        if (!response.pagination.next_page) {
          console.log(`No hay más páginas después de la página ${page}`);
          break;
        }
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
