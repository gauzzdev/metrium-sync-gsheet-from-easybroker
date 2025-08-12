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

  async insertMetaPropertyFeed(spreadsheetId: string, data: MetaPropertyFeedItem[]): Promise<void> {
    const doc = new GoogleSpreadsheet(spreadsheetId, this.auth);
    await doc.loadInfo();
    
    const sheet = doc.sheetsByIndex[0];
    
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
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