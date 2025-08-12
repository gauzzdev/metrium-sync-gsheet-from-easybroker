import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { ContentType } from "../enums/lambda.enums";

type BuildResponseParams = Omit<APIGatewayProxyStructuredResultV2, "body"> & {
  contentType?: ContentType;
  body: object | string;
};

export const buildResponse = (params: BuildResponseParams): APIGatewayProxyStructuredResultV2 => {
  const { contentType = ContentType.JSON, headers, body } = params;

  return {
    ...params,
    headers: {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      ...headers,
    },
    body: JSON.stringify(body),
  };
};
