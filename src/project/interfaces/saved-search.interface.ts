export interface GetAllDetails {
  id: string;
  name: string;
  date_created: string;
}

export interface Bounds {
  sw?: {
    lat?: number;
    lng?: number;
  };
  ne?: {
    lat?: number;
    lng?: number;
  };
}

export interface ResponseTransformer {
  id: string;
  name: string;
  dateCreated: string;
  filters: {
    searchString?: string;
    microMarket?: string;
    microMarkets?: string[];
    bedRooms?: number[];
    houseType?: string;
    bathRooms: number[];
    categories?: string[];
    launchStatus?: string[];
    price?: number[];
    developer?: string;
    bounds?: Bounds;
    distance?: number;
  };
  message?: string;
}

export interface GetAllDetailsTransformer {
  data?: ResponseTransformer[]
}

export interface GetByIdDetails {
  id: string;
  status: string;
  sort: null;
  user_created: string;
  date_created: string;
  user_updated: string | null;
  date_updated: string | null;
  customer_id: string;
  name: string;
  micro_market: string;
  search_string: string;
  price: string;
  house_type: string;
  bathrooms: string;
  categories: string[] | string;
  launch_status: string[] | string;
  developer: string;
  bedrooms: string[] | string;
  distance: number;
  micro_markets: string[] | string;
  south_west_lng: number;
  south_west_lat: number;
  north_east_lat: number;
  north_east_lng: number;
}

export interface SavedSearchResponse {
  message?: string;
  error?: string;
  id?: string;
  data?: ResponseTransformer
}

export interface TransformRequestResult {
  name: string;
  searchString?: string;
  microMarket?: string;
  microMarkets?: string[];
  bedRooms?: number[];
  houseType?: string;
  bathRooms?: number[];
  categories?: string[];
  launchStatus?: string[];
  price?: number[];
  developer?: string;
  boundSouthWestLat?: number;
  boundSouthWestLng?: number;
  boundNorthEastLat?: number;
  boundNorthEastLng?: number;
  distance?: number;
}

export interface ParsedBounds {
  sw: {
    lat: number | null;
    lng: number | null;
  };
  ne: {
    lat: number | null;
    lng: number | null;
  };
}
