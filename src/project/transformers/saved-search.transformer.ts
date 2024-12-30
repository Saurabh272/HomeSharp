import { Injectable } from '@nestjs/common';
import {
  Bounds,
  GetAllDetailsTransformer, ParsedBounds, ResponseTransformer, TransformRequestResult
} from '../interfaces/saved-search.interface';

@Injectable()
export class SavedSearchTransformer {
  parseJsonArray(jsonArrayString: string): any[] {
    try {
      return jsonArrayString ? JSON.parse(jsonArrayString) : [];
    } catch (error) {
      return [];
    }
  }

  parseBounds(bounds: Bounds): ParsedBounds {
    return {
      sw: {
        lat: bounds?.sw?.lat || null,
        lng: bounds?.sw?.lng || null
      },
      ne: {
        lat: bounds?.ne?.lat || null,
        lng: bounds?.ne?.lng || null
      }
    };
  }

  private parseFields(data: any): ResponseTransformer {
    return {
      id: data?.id,
      name: data?.name,
      dateCreated: data?.date_created,
      filters: {
        searchString: data?.search_string,
        microMarket: data?.micro_market,
        microMarkets: this.parseJsonArray(data?.micro_markets),
        bedRooms: this.parseJsonArray(data?.bedrooms),
        houseType: data?.house_type,
        bathRooms: this.parseJsonArray(data?.bathrooms),
        categories: this.parseJsonArray(data?.categories),
        launchStatus: this.parseJsonArray(data?.launch_status),
        price: this.parseJsonArray(data?.price),
        developer: data?.developer,
        bounds: this.parseBounds({
          sw: { lat: data?.south_west_lat, lng: data?.south_west_lng },
          ne: { lat: data?.north_east_lat, lng: data?.north_east_lng }
        }),
        distance: data?.distance || 0
      }
    };
  }

  getAllDetails(payload: any): GetAllDetailsTransformer {
    if (!payload?.length) {
      return {
        data: []
      };
    }
    const result = payload.map((item: any) => this.parseFields(item));

    return {
      data: result
    };
  }

  transformedResponse(data: any): ResponseTransformer {
    if (!data) {
      return null;
    }
    return this.parseFields(data);
  }

  transformRequest(requestData: any): TransformRequestResult {
    const { name, filters } = requestData;
    const { sw, ne } = filters?.bounds || {};

    return {
      name,
      searchString: filters?.searchString,
      microMarket: filters?.microMarket,
      microMarkets: filters?.microMarkets,
      bedRooms: filters?.bedRooms,
      houseType: filters?.houseType,
      bathRooms: filters?.bathRooms,
      categories: filters?.categories,
      launchStatus: filters?.launchStatus,
      price: filters?.price,
      developer: filters?.developer,
      boundSouthWestLat: sw?.lat || null,
      boundSouthWestLng: sw?.lng || null,
      boundNorthEastLat: ne?.lat || null,
      boundNorthEastLng: ne?.lng || null,
      distance: filters?.distance
    };
  }
}
