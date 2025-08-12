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
    const { spreadsheetId } = body;
    if (!spreadsheetId) throw new Error("spreadsheetId is required");

    const easyBrokerService = new EasyBrokerService(env.EASYBROKER_API_KEY);
    const metaCatalogService = new MetaCatalogSheetsService({
      serviceAccountEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: env.GOOGLE_PRIVATE_KEY,
    });

    console.log("Obteniendo todas las propiedades de EasyBroker...");
    const properties = await easyBrokerService.getAllProperties();
    console.log(`Se encontraron ${properties.length} propiedades`);

    console.log("Obteniendo detalles de cada propiedad...");
    const detailedProperties = await Promise.all(properties.map((property) => easyBrokerService.getPropertyDetails(property.public_id)));

    console.log("Formateando datos para Meta Catalog Feed...");
    const metaFeedData = MetaPropertyFeedFormatter.formatForMetaCatalog(properties, detailedProperties);

    console.log("Limpiando Meta Catalog Feed...");
    await metaCatalogService.clearMetaCatalogFeed(spreadsheetId);

    console.log("Insertando datos del feed de propiedades...");
    await metaCatalogService.insertMetaPropertyFeed(spreadsheetId, metaFeedData);

    const catalogInfo = await metaCatalogService.getMetaCatalogInfo(spreadsheetId);

    const message = `✅ Meta Catalog Feed sincronizado exitosamente!\n📊 Propiedades procesadas: ${properties.length}\n📋 Feed: ${catalogInfo.title}\n📝 Filas totales: ${catalogInfo.rowCount}`;
    console.log(message);

    return buildResponse({
      statusCode: 200,
      body: { message, propertiesCount: properties.length, catalogTitle: catalogInfo.title, totalRows: catalogInfo.rowCount },
    });
  } catch (error) {
    console.error(error);
    let message = errorMessages.defaultError;
    if (error instanceof Error) message += ` ${error.message}`;

    return buildResponse({ statusCode: 500, body: { message } });
  }
};
