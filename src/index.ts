import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { errorMessages } from "./core/constants/messages.constants";
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
    const { spreadsheetId, startPage, endPage } = body;
    if (!spreadsheetId) throw new Error("spreadsheetId is required");
    if (!startPage || !endPage) throw new Error("startPage and endPage are required");
    
    const startPageNum = parseInt(startPage);
    const endPageNum = parseInt(endPage);
    
    if (startPageNum < 1 || endPageNum < startPageNum || (endPageNum - startPageNum + 1) > 10) {
      throw new Error("Invalid page range. Maximum 10 pages and end page must be >= start page");
    }

    const easyBrokerService = new EasyBrokerService(env.EASYBROKER_API_KEY);
    const metaCatalogService = new MetaCatalogSheetsService({
      serviceAccountEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: env.GOOGLE_PRIVATE_KEY,
    });

    console.log(`Obteniendo propiedades de EasyBroker (páginas ${startPageNum}-${endPageNum})...`);
    const properties = await easyBrokerService.getPropertiesByPageRange(startPageNum, endPageNum);
    console.log(`Se encontraron ${properties.length} propiedades`);

    console.log("Obteniendo detalles de cada propiedad...");
    const detailedProperties = await Promise.all(properties.map((property) => easyBrokerService.getPropertyDetails(property.public_id)));

    console.log("Formateando datos para Meta Catalog Feed...");
    const metaFeedData = MetaPropertyFeedFormatter.formatForMetaCatalog(properties, detailedProperties);

    console.log("Agregando datos al final de la lista existente...");
    await metaCatalogService.appendMetaPropertyFeed(spreadsheetId, metaFeedData);

    const catalogInfo = await metaCatalogService.getMetaCatalogInfo(spreadsheetId);

    const message = `✅ Propiedades agregadas exitosamente!\n📊 Propiedades añadidas: ${properties.length} (páginas ${startPageNum}-${endPageNum})\n📋 Feed: ${catalogInfo.title}\n📝 Filas totales en el sheet: ${catalogInfo.rowCount}`;
    console.log(message);

    return buildResponse({
      statusCode: 200,
      body: { 
        message, 
        propertiesAdded: properties.length, 
        pageRange: `${startPageNum}-${endPageNum}`,
        catalogTitle: catalogInfo.title, 
        totalRows: catalogInfo.rowCount 
      },
    });
  } catch (error) {
    console.error(error);
    let message = errorMessages.defaultError;
    if (error instanceof Error) message += ` ${error.message}`;

    return buildResponse({ statusCode: 500, body: { message } });
  }
};
