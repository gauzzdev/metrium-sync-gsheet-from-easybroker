import { EasyBrokerPropertiesListResponse, EasyBrokerPropertySummary } from "../core/types/easybroker/list-all-properties.types";
import { EasyBrokerPropertyDetails } from "../core/types/easybroker/retrieve-a-property.types";
import { devMessages, userMessages } from "../core/constants/messages.constants";

export class EasyBrokerService {
  private apiKey: string;
  private baseUrl = "https://api.easybroker.com/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getPropertiesByPageRange(startPage: number = 1, endPage: number = 1): Promise<EasyBrokerPropertySummary[]> {
    const allProperties: EasyBrokerPropertySummary[] = [];

    if (startPage < 1 || endPage < startPage || endPage - startPage + 1 > 10) {
      throw new Error(userMessages.errors.invalidPageRange);
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

        console.log(devMessages.logs.pageProcessed(page, response.content.length));

        if (!response.pagination.next_page) {
          console.log(devMessages.logs.noMorePages(page));
          break;
        }
      } catch (error) {
        console.error(devMessages.errors.fetchingPage(page), error);
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
      console.error(devMessages.errors.fetchingProperty(publicId), error);
      throw error;
    }
  }
}
