import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod";

const SERVER_CONFIG = {
  title: "Metrium | Sincronización de Easybroker con Google Sheets",
  name: "sync-gsheet-from-easybroker",
  version: "1.0.0",
};

const EASYBROKER_API_ENDPOINT = "https://3a4eeoseundplud3llhiatycp40husfx.lambda-url.us-east-1.on.aws/";

const PROPERTY_STATUSES = ["published", "not_published", "reserved", "sold", "rented", "suspended"] as const;

const PROPERTY_TYPES = [
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
] as const;

const SyncOptionsSchema = z.object({
  spreadsheetId: z.string().describe("ID of the Google Sheets spreadsheet to sync with Easybroker properties."),
  resetSpreadsheet: z.boolean().optional().default(false).describe("Whether to reset the Google Sheets spreadsheet before syncing."),
  statuses: z
    .array(z.enum(PROPERTY_STATUSES))
    .optional()
    .default(["published"])
    .describe("List of statuses to sync from Easybroker to Google Sheets."),
  propertyTypes: z
    .array(z.enum(PROPERTY_TYPES))
    .optional()
    .default([])
    .describe("List of property types to sync from Easybroker to Google Sheets."),
});

type SyncOptions = z.infer<typeof SyncOptionsSchema>;

async function syncEasybrokerData(options: SyncOptions) {
  try {
    const response = await fetch(EASYBROKER_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to sync Easybroker data: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

function createSuccessResponse(spreadsheetId: string, responseData: any) {
  return {
    content: [
      {
        type: "text" as const,
        text: `✅ Successfully synced Google Sheets with Easybroker properties for spreadsheet ID: ${spreadsheetId}`,
      },
      {
        type: "text" as const,
        text: `📊 Sync Results: ${JSON.stringify(responseData, null, 2)}`,
      },
    ],
  };
}

function createErrorResponse(error: Error, spreadsheetId: string) {
  return {
    content: [
      {
        type: "text" as const,
        text: `❌ Failed to sync Google Sheets (ID: ${spreadsheetId}) with Easybroker properties`,
      },
      {
        type: "text" as const,
        text: `🔍 Error Details: ${error.message}`,
      },
    ],
  };
}

function createServer() {
  const server = new McpServer(SERVER_CONFIG);

  server.tool(
    "sync-gsheet-from-easybroker",
    "Sync Google Sheets Meta Catalog Source from Easybroker",
    SyncOptionsSchema.shape,
    async (options: SyncOptions) => {
      try {
        const responseData = await syncEasybrokerData(options);
        return createSuccessResponse(options.spreadsheetId, responseData);
      } catch (error) {
        return createErrorResponse(error instanceof Error ? error : new Error("Unknown error occurred"), options.spreadsheetId);
      }
    }
  );

  return server;
}

async function main() {
  try {
    const server = createServer();
    const transport = new StdioServerTransport();

    await server.connect(transport);
    console.log("🚀 MCP Server started successfully");
  } catch (error) {
    console.error("💥 Failed to start MCP Server:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("🔥 Unhandled error:", error);
  process.exit(1);
});
