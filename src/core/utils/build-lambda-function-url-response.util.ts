import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { ContentType } from "../enums/lambda.enums";

type BuildResponseParams = Omit<APIGatewayProxyStructuredResultV2, "body"> & {
  event: APIGatewayProxyEventV2;
  contentType?: ContentType;
  body: object | string;
};

export const buildResponse = (params: BuildResponseParams): APIGatewayProxyStructuredResultV2 => {
  const { event, contentType = ContentType.JSON, headers, body, statusCode = 200 } = params;

  if (event.requestContext.http.method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        ...headers,
      },
    };
  }

  return {
    statusCode,
    headers: {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      ...headers,
    },
    body: JSON.stringify(body),
  };
};
