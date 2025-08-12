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
        columnCount: newColumns
      });
    }
  }

  async insertMetaPropertyFeed(spreadsheetId: string, data: MetaPropertyFeedItem[]): Promise<void> {
    const doc = new GoogleSpreadsheet(spreadsheetId, this.auth);
    await doc.loadInfo();
    
    const sheet = doc.sheetsByIndex[0];
    
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const requiredColumns = headers.length;
    const requiredRows = data.length + 1; // +1 for header row

    // Ensure sheet has enough columns and rows
    await this.ensureSheetSize(sheet, requiredColumns, requiredRows);
    
    await sheet.setHeaderRow(headers);
    
    const rowData = data.map(item => 
      Object.values(item).map(value => value === null ? '' : String(value))
    );
    await sheet.addRows(rowData);
  }

  async getMetaCatalogInfo(spreadsheetId: string): Promise<{ title: string; rowCount: number }> {
    const doc = new GoogleSpreadsheet(spreadsheetId, this.auth);
    await doc.loadInfo();
    
    const sheet = doc.sheetsByIndex[0];
    
    return {
      title: doc.title,
      rowCount: sheet.rowCount
    };
  }
}