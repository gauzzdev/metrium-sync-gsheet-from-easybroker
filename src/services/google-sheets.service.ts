import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { MetaCatalogFeedConfig } from "../core/types/google-sheets/meta-catalog-feed.types";
import { MetaPropertyFeedItem } from "../core/types/meta-catalog/meta-property-feed.types";

export class MetaCatalogSheetsService {
  private auth: JWT;

  constructor(config: MetaCatalogFeedConfig) {
    this.auth = new JWT({
      email: config.serviceAccountEmail,
      key: config.privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  }

  async clearMetaCatalogFeed(spreadsheetId: string): Promise<void> {
    const doc = new GoogleSpreadsheet(spreadsheetId, this.auth);
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];
    await sheet.clear();
  }

  private async ensureSheetSize(sheet: any, requiredColumns: number, requiredRows: number): Promise<void> {
    const currentColumns = sheet.columnCount;
    const currentRows = sheet.rowCount;

    const needsResize = currentColumns < requiredColumns || currentRows < requiredRows;

    if (needsResize) {
      const newColumns = Math.max(currentColumns, requiredColumns);
      const newRows = Math.max(currentRows, requiredRows);

      await sheet.resize({
        rowCount: newRows,
        columnCount: newColumns,
      });
    }
  }

  private async applyTextClipFormat(sheet: any, rowCount: number, columnCount: number): Promise<void> {
    try {
      // Apply OVERFLOW format instead of CLIP to preserve line breaks but keep fixed row height
      await sheet.batchUpdate([
        {
          repeatCell: {
            range: {
              sheetId: sheet.sheetId,
              startRowIndex: 0,
              endRowIndex: rowCount,
              startColumnIndex: 0,
              endColumnIndex: columnCount,
            },
            cell: {
              userEnteredFormat: {
                wrapStrategy: "OVERFLOW_CELL",
                verticalAlignment: "TOP",
              },
            },
            fields: "userEnteredFormat.wrapStrategy,userEnteredFormat.verticalAlignment",
          },
        },
      ]);

      // Set fixed row heights to prevent auto-resizing
      const rowRequests = [];
      for (let i = 0; i < rowCount; i++) {
        rowRequests.push({
          updateDimensionProperties: {
            range: {
              sheetId: sheet.sheetId,
              dimension: "ROWS",
              startIndex: i,
              endIndex: i + 1,
            },
            properties: {
              pixelSize: 21, // Fixed height for single line
            },
            fields: "pixelSize",
          },
        });
      }

      if (rowRequests.length > 0) {
        await sheet.batchUpdate(rowRequests);
      }
    } catch (error) {
      console.warn("Could not apply text format:", error);
    }
  }

  async appendMetaPropertyFeed(spreadsheetId: string, data: MetaPropertyFeedItem[]): Promise<void> {
    const doc = new GoogleSpreadsheet(spreadsheetId, this.auth);
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];

    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const requiredColumns = headers.length;
    const currentRows = sheet.rowCount;
    const requiredRows = currentRows + data.length;

    await this.ensureSheetSize(sheet, requiredColumns, requiredRows);

    // Only set headers if sheet is empty
    if (currentRows === 0 || sheet.headerValues.length === 0) {
      await sheet.setHeaderRow(headers);
    }

    const rowData = data.map((item) => Object.values(item).map((value) => (value === null ? "" : String(value))));
    await sheet.addRows(rowData);

    await this.applyTextClipFormat(sheet, sheet.rowCount, headers.length);
  }

  async getMetaCatalogInfo(spreadsheetId: string): Promise<{ title: string; rowCount: number }> {
    const doc = new GoogleSpreadsheet(spreadsheetId, this.auth);
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];

    return {
      title: doc.title,
      rowCount: sheet.rowCount,
    };
  }
}
