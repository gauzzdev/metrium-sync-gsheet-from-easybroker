import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import env from "./config/environment.config";
import { errorMessages } from "./core/constants/messages.constants";
import { buildResponse } from "./core/utils/build-lambda-function-url-response.util";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
  try {
    const message = "Hi there!";

    // Test get properties
    const url = "https://api.easybroker.com/v1/properties?page=1&limit=50";
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        "X-Authorization": env.EASYBROKER_API_KEY,
      },
    };

    const response = await fetch(url, options);
    console.log(await response.json());

    // Test input data on GSheet

    const serviceAccountAuth = new JWT({
      email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: env.GOOGLE_PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const doc = new GoogleSpreadsheet("shit id from url", serviceAccountAuth);

    await doc.loadInfo();
    console.log(doc.title);
    await doc.updateProperties({ title: "testing" });

    const sheet = doc.sheetsByIndex[0];
    console.log(sheet.title);
    console.log(sheet.rowCount);

    const newSheet = await doc.addSheet({ title: "another sheet" });
    await newSheet.delete();

    return buildResponse({ statusCode: 200, body: { message } });
  } catch (error) {
    let message = errorMessages.defaultError;
    if (error instanceof Error) message += `: ${error.message}`;

    return buildResponse({ statusCode: 500, body: { message } });
  }
};
