import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { MetaCatalogFeedConfig } from "../core/types/google-sheets/meta-catalog-feed.types";
import { MetaPropertyFeedItem } from "../core/types/meta-catalog/meta-property-feed.types";
import { devMessages } from "../core/constants/messages.constants";

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

  private async ensureSheetSize(sheet: GoogleSpreadsheetWorksheet, requiredColumns: number, requiredRows: number): Promise<void> {
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

    if (currentRows === 0) {
      await sheet.setHeaderRow(headers);
    } else {
      try {
        await sheet.loadHeaderRow();
        if (!sheet.headerValues || sheet.headerValues.length === 0) {
          await sheet.setHeaderRow(headers);
        }
      } catch (error) {
        console.warn(devMessages.errors.loadingHeaders, error);
        await sheet.setHeaderRow(headers);
      }
    }

    const rowData = data.map((item) => Object.values(item).map((value) => (value === null ? "" : String(value))));
    await sheet.addRows(rowData);
    await sheet.updateDimensionProperties("ROWS", { pixelSize: 21 } as any, { startIndex: 0, endIndex: sheet.rowCount });
  }

  async getMetaCatalogInfo(spreadsheetId: string): Promise<{ title: string; rowCount: number }> {
    const doc = new GoogleSpreadsheet(spreadsheetId, this.auth);
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    return {
      title: doc.title,
      rowCount: rows.length + 1,
    };
  }
}
