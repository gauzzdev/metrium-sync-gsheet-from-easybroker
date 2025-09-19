import { EasyBrokerPropertiesListResponse, EasyBrokerPropertySummary } from "../core/types/easybroker/list-all-properties.types";
import { EasyBrokerPropertyDetails } from "../core/types/easybroker/retrieve-a-property.types";
import { devMessages } from "../core/constants/messages.constants";

export class EasyBrokerService {
  private apiKey: string;
  private baseUrl = "https://api.easybroker.com/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getAllProperties(
    statuses: string[],
    propertyTypes: string[] = []
  ): Promise<EasyBrokerPropertySummary[]> {
    const allProperties: EasyBrokerPropertySummary[] = [];

    for (const status of statuses) {
      const statusParams = `search[statuses][]=${encodeURIComponent(status)}`;
      const propertyTypeParams =
        propertyTypes.length > 0 ? propertyTypes.map((type) => `search[property_types][]=${encodeURIComponent(type)}`).join("&") : "";

      const allParams = [statusParams, propertyTypeParams].filter((param) => param).join("&");
      const initialUrl = `${this.baseUrl}/properties?page=1&limit=50&${allParams}`;

      const startTime = Date.now();
      const timeoutMs = 14.5 * 60 * 1000;

      const propertiesForStatus = await this.fetchPropertiesRecursively(initialUrl, [], 1, startTime, timeoutMs);
      const propertiesWithStatus = propertiesForStatus.map((property) => ({ ...property, status }));
      allProperties.push(...propertiesWithStatus);
    }

    return allProperties;
  }

  private async fetchPropertiesRecursively(
    url: string,
    accumulatedProperties: EasyBrokerPropertySummary[],
    currentPage: number,
    startTime: number,
    timeoutMs: number
  ): Promise<EasyBrokerPropertySummary[]> {
    if (Date.now() - startTime > timeoutMs) throw new Error(devMessages.errors.queryTimeout(currentPage));

    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        "X-Authorization": this.apiKey,
      },
    };

    try {
      const response: EasyBrokerPropertiesListResponse = await fetch(url, options).then((res) => res.json());
      const newProperties = [...accumulatedProperties, ...response.content];

      console.log(devMessages.logs.pageProcessed(currentPage, response.content.length));

      if (response.pagination.next_page)
        return this.fetchPropertiesRecursively(response.pagination.next_page, newProperties, currentPage + 1, startTime, timeoutMs);

      console.log(devMessages.logs.allPagesProcessed(currentPage, newProperties.length));
      return newProperties;
    } catch (error) {
      console.error(devMessages.errors.fetchingPage(currentPage), error);
      throw error;
    }
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
