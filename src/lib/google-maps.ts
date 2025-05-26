"use server";

import {
  Client,
  PlaceAutocompleteType,
} from "@googlemaps/google-maps-services-js";

import { env } from "@/data/env/server";

const client = new Client();

export const autocompleteCities = async (
  input: string,
  countryCode?: string
) => {
  if (!input) return [];

  try {
    const response = await client.placeAutocomplete({
      params: {
        input,
        key: env.GOOGLE_API_KEY,
        types: PlaceAutocompleteType.cities,
        components:
          countryCode != null
            ? [`country:${countryCode.toLowerCase()}`]
            : undefined,
        language: "en",
      },
    });

    return response.data.predictions ?? [];
  } catch (error) {
    console.error("Autocomplete error:", error);
    return [];
  }
};

export const getPlaceCoordinates = async (placeId: string) => {
  try {
    const response = await client.placeDetails({
      params: {
        key: env.GOOGLE_API_KEY,
        place_id: placeId,
        fields: ["geometry"],
      },
    });

    const location = response.data.result.geometry?.location;

    if (!location) return null;

    return {
      lat: location.lat,
      lng: location.lng,
    };
  } catch (error) {
    console.error("Error getting place coordinates:", error);
    return null;
  }
};
