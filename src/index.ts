import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { userMessages, devMessages } from "./core/constants/messages.constants";
import { buildResponse } from "./core/utils/build-lambda-function-url-response.util";
import getEnv from "./config/environment.config";
import { EasyBrokerService } from "./services/easybroker.service";
import { MetaCatalogSheetsService } from "./services/google-sheets.service";
import { MetaPropertyFeedFormatter } from "./services/property-formatter.service";

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
  try {
    if (event.requestContext.http.method === "OPTIONS") return buildResponse({ statusCode: 200 });

    const env = getEnv();
    const body = JSON.parse(event.body || "{}");
    const { spreadsheetId, statuses = ["published"], propertyTypes = [], resetSpreadsheet = true } = body;

    if (!spreadsheetId) throw new Error(userMessages.errors.spreadsheetRequired);

    const validStatuses = ["published", "not_published", "reserved", "sold", "rented", "suspended"];
    const statusArray = Array.isArray(statuses) ? statuses : [statuses];

    if (!statusArray.every((status) => validStatuses.includes(status))) throw new Error(userMessages.errors.invalidStatus(validStatuses));

    const validPropertyTypes = [
      "Bodega comercial",
      "Bodega industrial",
      "Casa",
      "Casa con uso de suelo",
      "Casa en condominio",
      "Departamento",
      "Edificio",
      "Huerta",
      "Local comercial",
      "Local en centro comercial",
      "Nave industrial",
      "Oficina",
      "Otro",
      "Quinta",
      "Rancho",
      "Terreno",
      "Terreno comercial",
      "Terreno industrial",
      "Villa",
    ];
    const propertyTypesArray = Array.isArray(propertyTypes) ? propertyTypes : [propertyTypes];

    if (propertyTypesArray.length > 0 && !propertyTypesArray.every((type) => validPropertyTypes.includes(type)))
      throw new Error(userMessages.errors.invalidPropertyType(validPropertyTypes));

    const easyBrokerService = new EasyBrokerService(env.EASYBROKER_API_KEY);
    const metaCatalogService = new MetaCatalogSheetsService({
      serviceAccountEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: env.GOOGLE_PRIVATE_KEY,
    });

    console.log(devMessages.logs.fetchingProperties(statusArray, propertyTypesArray));
    const properties = await easyBrokerService.getAllProperties(statusArray, propertyTypesArray);
    console.log(devMessages.logs.propertiesFound(properties.length));

    console.log(devMessages.logs.fetchingDetails);
    const detailedProperties = await Promise.all(properties.map((property) => easyBrokerService.getPropertyDetails(property.public_id)));

    console.log(devMessages.logs.formattingData);
    const metaFeedData = MetaPropertyFeedFormatter.formatForMetaCatalog(properties, detailedProperties);

    if (resetSpreadsheet) {
      console.log(devMessages.logs.resettingSpreadsheet);
      await metaCatalogService.clearMetaCatalogFeed(spreadsheetId);
    }

    console.log(devMessages.logs.appendingData);
    await metaCatalogService.appendMetaPropertyFeed(spreadsheetId, metaFeedData);

    const catalogInfo = await metaCatalogService.getMetaCatalogInfo(spreadsheetId);

    const message = userMessages.success.propertiesAdded(
      properties.length,
      statusArray,
      propertyTypesArray,
      catalogInfo.title,
      catalogInfo.rowCount
    );

    console.log(message);

    return buildResponse({
      statusCode: 200,
      body: {
        message,
        propertiesAdded: properties.length,
        statuses: statusArray,
        propertyTypes: propertyTypesArray,
        catalogTitle: catalogInfo.title,
        totalRows: catalogInfo.rowCount,
      },
    });
  } catch (error) {
    console.error(error);
    let message = userMessages.errors.defaultError;
    if (error instanceof Error) message += ` ${error.message}`;

    return buildResponse({ statusCode: 500, body: { message } });
  }
};
