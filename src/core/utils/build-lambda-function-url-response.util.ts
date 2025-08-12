import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { ContentType } from "../enums/lambda.enums";

type BuildResponseParams = Omit<APIGatewayProxyStructuredResultV2, "body"> & {
  contentType?: ContentType;
  body?: object;
};

export const buildResponse = (params: BuildResponseParams): APIGatewayProxyStructuredResultV2 => {
  const { contentType = ContentType.JSON, headers, body, statusCode = 200 } = params;

  const response = {
    statusCode,
    headers: {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  console.log(response);
  return response;
};
