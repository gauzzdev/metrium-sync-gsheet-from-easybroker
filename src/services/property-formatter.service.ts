import { EasyBrokerPropertySummary } from "../core/types/easybroker/list-all-properties.types";
import { EasyBrokerPropertyDetails } from "../core/types/easybroker/retrieve-a-property.types";
import { MetaPropertyFeedItem } from "../core/types/meta-catalog/meta-property-feed.types";

export class MetaPropertyFeedFormatter {
  private static statusToAvailabilityMap = {
    for_sale: ["published"],
    sale_pending: ["reserved"],
    recently_sold: ["sold"],
    for_rent: ["published"],
    off_market: ["rented", "suspended", "not_published"],
  };

  private static propertyTypeMap = {
    Casa: "house",
    Departamento: "apartment",
    Terreno: "land",
  };

  private static REQUIRED_FIELDS = [
    "home_listing_id",
    "name",
    "availability",
    "price",
    "url",
    "address.city",
    "address.country",
    "neighborhood[0]",
    "image[0].url",
    "image[0].tag[0]",
  ];

  static formatForMetaCatalog(
    properties: EasyBrokerPropertySummary[],
    detailedProperties: EasyBrokerPropertyDetails[]
  ): MetaPropertyFeedItem[] {
    const data = properties.map((property, index) => {
      const detailedProperty = detailedProperties[index];

      const cleanDescription = (detailedProperty?.description || "")
        .replace(/[^\x20-\x7E\u00A0-\uFFFF\r\n]/g, "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .trim()
        .substring(0, 5000);

      const row = {
        home_listing_id: property.public_id || "",
        name: property.title || "",
        description: cleanDescription,
        availability: this.mapAvailability(property.status, property.operations[0]?.type),
        price: property.operations[0]?.formatted_amount ? `${property.operations[0]?.formatted_amount.replace(/[^\d]/g, "")} MXN` : "0 MXN",
        property_type: this.mapPropertyType(property.property_type),
        garden_type: "",
        url: detailedProperty?.public_url || "",
        num_baths: property.bathrooms ? Math.floor(property.bathrooms) : null,
        num_beds: property.bedrooms ? Math.floor(property.bedrooms) : null,
        num_rooms: detailedProperty?.floors ? Math.floor(detailedProperty.floors) : null,
        pet_policy: "",
        area_size: property?.construction_size ? Math.floor(property.construction_size) : null,
        land_area_size: property?.lot_size ? Math.floor(property.lot_size) : null,
        parking_spaces: property?.parking_spaces ? Math.floor(property.parking_spaces) : null,
        area_unit: "sq_m",
        year_built: this.mapYearBuilt(detailedProperty?.age),
        "address.addr1": detailedProperty?.location?.street || "",
        "address.city": detailedProperty?.location?.name?.split(",")[1]?.trim() || "",
        "address.region": detailedProperty?.location?.name?.split(",")[1]?.trim() || "",
        "address.country": "Mexico",
        "neighborhood[0]": detailedProperty?.location?.name?.split(",")[0]?.trim() || "",
        virtual_tour_url: detailedProperty?.virtual_tour || "",
        "image[0].url": detailedProperty?.property_images?.[0]?.url || "",
        "image[0].tag[0]": detailedProperty?.property_images?.[0]?.title || "",
        "image[1].url": detailedProperty?.property_images?.[1]?.url || "",
        "image[1].tag[0]": detailedProperty?.property_images?.[1]?.title || "",
        "image[2].url": detailedProperty?.property_images?.[2]?.url || "",
        "image[2].tag[0]": detailedProperty?.property_images?.[2]?.title || "",
        "image[3].url": detailedProperty?.property_images?.[3]?.url || "",
        "image[3].tag[0]": detailedProperty?.property_images?.[3]?.title || "",
        "image[4].url": detailedProperty?.property_images?.[4]?.url || "",
        "image[4].tag[0]": detailedProperty?.property_images?.[4]?.title || "",
        "image[5].url": detailedProperty?.property_images?.[5]?.url || "",
        "image[5].tag[0]": detailedProperty?.property_images?.[5]?.title || "",
        "image[6].url": detailedProperty?.property_images?.[6]?.url || "",
        "image[6].tag[0]": detailedProperty?.property_images?.[6]?.title || "",
        "image[7].url": detailedProperty?.property_images?.[7]?.url || "",
        "image[7].tag[0]": detailedProperty?.property_images?.[7]?.title || "",
      };

      return row;
    });

    return data.filter((r) => this.isValidRow(r));
  }

  static isValidRow(row: any): boolean {
    for (const field of this.REQUIRED_FIELDS) {
      if (!row[field]) {
        return false;
      }
    }
    return true;
  }

  private static mapAvailability(status?: string, operationType?: string): string {
    if (!status) return "off_market";

    for (const [metaStatus, easybrokerStatuses] of Object.entries(this.statusToAvailabilityMap)) {
      if (easybrokerStatuses.includes(status)) {
        if (status === "published" && operationType === "rental") return "for_rent";

        return metaStatus;
      }
    }

    return "off_market";
  }

  private static mapPropertyType(propertyType?: string): string {
    if (!propertyType) return "other";
    return this.propertyTypeMap[propertyType as keyof typeof this.propertyTypeMap] || "other";
  }

  private static mapYearBuilt(age?: string | number | null): string {
    if (!age) return "";

    const ageStr = age.toString();

    if (ageStr === "new_construction" || ageStr === "under_construction") return new Date().getFullYear().toString();
    const yearMatch = ageStr.match(/\d{4}/);
    if (yearMatch) return yearMatch[0];

    return "";
  }
}
