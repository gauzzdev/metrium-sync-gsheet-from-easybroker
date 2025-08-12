import { EasyBrokerPropertySummary } from "../core/types/easybroker/list-all-properties.types";
import { EasyBrokerPropertyDetails } from "../core/types/easybroker/retrieve-a-property.types";
import { MetaPropertyFeedItem } from "../core/types/meta-catalog/meta-property-feed.types";

export class MetaPropertyFeedFormatter {
  static formatForMetaCatalog(
    properties: EasyBrokerPropertySummary[],
    detailedProperties: EasyBrokerPropertyDetails[]
  ): MetaPropertyFeedItem[] {
    return properties.map((property, index) => {
      const detailedProperty = detailedProperties[index];

      // Clean description text - preserve line breaks but remove invalid characters
      const cleanDescription = (detailedProperty?.description || "")
        .replace(/[^\x20-\x7E\u00A0-\uFFFF\r\n]/g, '') // Remove non-printable characters but keep line breaks
        .replace(/\r\n/g, '\n') // Normalize line breaks to \n
        .replace(/\r/g, '\n') // Convert remaining \r to \n
        .replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space, but preserve line breaks
        .replace(/\n{3,}/g, '\n\n') // Limit excessive line breaks to maximum 2
        .trim()
        .substring(0, 5000); // Limit to 5000 characters as per Meta requirements

      return {
        home_listing_id: property.public_id || "",
        name: property.title || "",
        description: cleanDescription,
        availability: "available",
        price: property.operations[0]?.formatted_amount || "0 MXN",
        property_type: property.property_type || "",
        garden_type: "none",
        url: detailedProperty?.public_url || "",
        num_baths: property.bathrooms || null,
        num_beds: property.bedrooms || null,
        num_rooms: null,
        pet_policy: "",
        area_size: property.construction_size || null,
        land_area_size: property.lot_size || null,
        parking_spaces: property.parking_spaces || null,
        area_unit: "m2",
        year_built: detailedProperty?.age || "",
        "address.addr1": detailedProperty?.location?.street || "",
        "address.city": detailedProperty?.location?.name?.split(",")[0]?.trim() || "",
        "address.region": detailedProperty?.location?.name?.split(",")[1]?.trim() || "",
        "address.country": "Mexico",
        "neighborhood[0]": "",
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
    });
  }
}
