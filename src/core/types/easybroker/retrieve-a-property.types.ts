export interface EasyBrokerPropertyLocation {
  name: string;
  latitude: number;
  longitude: number;
  street: string;
  postal_code: string;
  show_exact_location: boolean;
  hide_exact_location: boolean;
  exterior_number: string;
  interior_number: string | null;
}

export interface EasyBrokerAgentCommission {
  type: "percentage" | "fixed" | string;
  value: string;
}

export interface EasyBrokerDetailedOperation {
  type: "sale" | "rent" | string;
  amount: number;
  currency: string;
  formatted_amount: string;
  commission: EasyBrokerAgentCommission;
  unit: string;
}

export interface EasyBrokerPropertyImage {
  title: string;
  url: string;
}

export interface EasyBrokerAgent {
  id: number;
  name: string;
  full_name: string;
  mobile_phone: string;
  profile_image_url: string;
  email: string;
}

export interface EasyBrokerPropertyFeature {
  name: string;
  category: string;
}

export interface EasyBrokerPropertyDetails {
  public_id: string;
  title: string;
  description: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  half_bathrooms: number | null;
  parking_spaces: number | null;
  lot_size: number | null;
  construction_size: number | null;
  lot_length: number | null;
  lot_width: number | null;
  floors: number | null;
  floor: number | null;
  age: string | null;
  internal_id: string;
  expenses: string | null;
  location: EasyBrokerPropertyLocation;
  property_type: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  operations: EasyBrokerDetailedOperation[];
  property_files: any[];
  videos: any[];
  virtual_tour: string | null;
  collaboration_notes: string | null;
  public_url: string;
  shared_commission_percentage: number | null;
  exclusive: boolean | null;
  foreclosure: boolean;
  tags: string[];
  private_description: string | null;
  show_prices: boolean;
  share_commission: boolean;
  property_images: EasyBrokerPropertyImage[];
  images: EasyBrokerPropertyImage[];
  agent: EasyBrokerAgent;
  features: EasyBrokerPropertyFeature[];
}
