export interface EasyBrokerPropertiesListResponse {
  pagination: {
    limit: number;
    page: number;
    total: number;
    next_page?: string;
  };
  content: EasyBrokerPropertySummary[];
}

export interface EasyBrokerPropertySummary {
  public_id: string;
  title: string;
  title_image_full: string;
  title_image_thumb: string;
  location: string;
  operations: EasyBrokerPropertyOperation[];
  bedrooms: number;
  bathrooms: number;
  parking_spaces: number;
  property_type: string;
  lot_size: number | null;
  construction_size: number | null;
  updated_at: string;
  agent: string;
  show_prices: boolean;
  share_commission: boolean;
  status?: string;
}

export interface EasyBrokerPropertyOperation {
  type: string;
  amount: number;
  currency: string;
  formatted_amount: string;
  commission?: EasyBrokerPropertyCommission;
  unit: string;
}

export type EasyBrokerPropertyCommission =
  | {
      type: "percentage";
      value?: string;
    }
  | {
      type: "amount";
      value: number;
      currency: string;
    };
