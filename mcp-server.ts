import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod";
import express, { Request, Response } from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const SERVER_CONFIG = {
  title: "Metrium | Sincronización de Easybroker con Google Sheets",
  name: "sync-gsheet-from-easybroker",
  version: "1.0.0",
};

const server = new McpServer(SERVER_CONFIG);

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
  resetSpreadsheet: z.boolean().optional().default(true).describe("Whether to reset the Google Sheets spreadsheet before syncing."),
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to sync Easybroker data: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

server.tool(
  "metrium-sync-gsheet-from-easybroker",
  "Sync Google Sheets Meta Catalog Source from Metrium Easybroker",
  SyncOptionsSchema.shape,
  async (options: SyncOptions) => {
    try {
      const responseData = await syncEasybrokerData(options);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(responseData, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: error.message,
          },
        ],
      };
    }
  }
);

const app = express();
const transports: { [sessionId: string]: SSEServerTransport } = {};

app.get("/sse", async (req: Request, res: Response) => {
  const transport = new SSEServerTransport("/messages", res);
  transports[transport.sessionId] = transport;

  console.log(`SSE session started: ${transport.sessionId}`);

  res.on("close", () => {
    console.log(" SSE session closed:", transport.sessionId);
    delete transports[transport.sessionId];
  });

  await server.connect(transport);
});

app.post("/messages", async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];

  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send("No transport found for sessionId");
  }
});

app.listen(8080, () => {
  console.log(`MCP Server running on port 8080`);
});
