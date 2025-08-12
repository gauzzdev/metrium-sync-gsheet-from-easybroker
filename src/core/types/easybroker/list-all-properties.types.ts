export interface EasyBrokerListAllPropertiesResponse {
  pagination: {
    limit: number;
    page: number;
    total: number;
    next_page?: string;
  };
  content: EasyBrokerProperty[];
}

export interface EasyBrokerProperty {
  public_id: string;
  title: string;
  title_image_full: string;
  title_image_thumb: string;
  location: string;
  operations: EasyBrokerOperation[];
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
}

export interface EasyBrokerOperation {
  type: string;
  amount: number;
  currency: string;
  formatted_amount: string;
  commission?: EasyBrokerCommission;
  unit: string;
}

export type EasyBrokerCommission =
  | {
      type: "percentage";
      value?: string;
    }
  | {
      type: "amount";
      value: number;
      currency: string;
    };
