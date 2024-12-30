import { GetByIdDetails, TransformRequestResult } from '../interfaces/saved-search.interface';

export const transformRequest: TransformRequestResult = {
  name: 'MySavedSearch',
  searchString: 'Luxury Apartment',
  microMarket: 'Downtown',
  microMarkets: ['Suburb A', 'Suburb B'],
  bedRooms: [2, 3],
  houseType: 'Condo',
  bathRooms: [2, 2.5, 3],
  categories: ['Residential', 'New Construction'],
  launchStatus: ['Upcoming', 'Under Construction'],
  price: [150000, 300000],
  developer: 'ABC Developers',
  boundSouthWestLat: 34.0522,
  boundSouthWestLng: -118.2437,
  boundNorthEastLat: 34.103,
  boundNorthEastLng: -118.1907,
  distance: 5
};

export const createSavedSearchDetails: any = {
  id: '706410cf-0dc8-4d8e-8188-de0a394bd012',
  status: 'draft',
  sort: null,
  user_created: 'c5b6fab4-0ce6-43e0-8594-5f7fa7330658',
  date_created: '2023-10-31T02:48:21.154Z',
  user_updated: null,
  date_updated: null,
  customer_id: '99e3807c-6d42-4af1-b39d-82be90a96b0a',
  name: 'MySavedSearch',
  micro_market: 'Downtown',
  search_string: 'Luxury Apartments',
  price: '[150000,300000]',
  house_type: 'Condo',
  bathrooms: '[2,2.5,3]',
  categories: '["Residential","New Construction"]',
  launch_status: '["Upcoming","Under Construction"]',
  developer: 'ABC Developers',
  bedrooms: '[2,3]',
  distance: 5,
  micro_markets: '["Suburb A","Suburb B"]',
  south_west_lng: -118.2437,
  south_west_lat: 34.0522,
  north_east_lat: 34.103,
  north_east_lng: -118.1907
};
export const transformedResponse: any = {
  id: '706410cf-0dc8-4d8e-8188-de0a394bd012',
  name: 'MySavedSearch',
  dateCreated: '2023-10-31T02:48:21.154Z',
  filters: {
    searchString: 'Luxury Apartment',
    microMarket: 'Downtown',
    microMarkets: ['Suburb A', 'Suburb B'],
    bedRooms: [2, 3],
    houseType: 'Condo',
    bathRooms: [2, 2.5, 3],
    categories: ['Residential', 'New Construction'],
    launchStatus: ['Upcoming', 'Under Construction'],
    price: [150000, 300000],
    developer: 'ABC Developers',
    bounds: {
      sw: {
        lat: 34.0522,
        lng: -118.243
      },
      ne: {
        lat: 34.103,
        lng: -118.19
      }
    },
    distance: 5
  }
};

export const mockGetByIdResult: GetByIdDetails = {
  id: '7862df64-c372-4624-ad47-31fa171f052c',
  status: 'draft',
  sort: null,
  user_created: 'c5b6fab4-0ce6-43e0-8594-5f7fa7330658',
  date_created: '2023-10-30T12:26:59.151Z',
  user_updated: 'c5b6fab4-0ce6-43e0-8594-5f7fa7330658',
  date_updated: '2023-10-30T14:03:08.104Z',
  customer_id: '99e3807c-6d42-4af1-b39d-82be90a96b0a',
  name: 'UpdateMySavedSearchq1',
  micro_market: 'Downtown',
  search_string: 'Luxury Apartments',
  price: '[150000,300000]',
  house_type: 'Condo',
  bathrooms: '[2,2.5,3]',
  categories: '["Residential","New Construction"]',
  launch_status: '["Upcoming","Under Construction"]',
  developer: 'ABC ',
  bedrooms: '[2,3]',
  distance: 5,
  micro_markets: '["Suburb A","Suburb B"]',
  south_west_lng: -118.243,
  south_west_lat: 34.0522,
  north_east_lat: 34.103,
  north_east_lng: -118.19
};

export const mockGetByIdTransformedResponse: any = {
  id: '7862df64-c372-4624-ad47-31fa171f052c',
  name: 'UpdateMySavedSearchq1',
  dateCreated: '2023-10-30T12:26:59.151Z',
  filters: {
    searchString: 'Luxury Apartments',
    microMarket: 'Downtown',
    microMarkets: ['Suburb A', 'Suburb B'],
    bedRooms: [2, 3],
    houseType: 'Condo',
    bathRooms: [2, 2.5, 3],
    categories: ['Residential', 'New Construction'],
    launchStatus: ['Upcoming', 'Under Construction'],
    price: [150000, 300000],
    developer: 'ABC ',
    bounds: {
      sw: {
        lat: 34.0522,
        lng: -118.243
      },
      ne: {
        lat: 34.103,
        lng: -118.19
      }
    },
    distance: 5
  }
};

export const expectedTransformedResult = {
  name: 'MySavedSearch',
  searchString: 'Luxury Apartments',
  microMarket: 'Downtown',
  microMarkets: ['Suburb A', 'Suburb B'],
  bedRooms: [2, 3],
  houseType: 'Condo',
  bathRooms: [2, 2.5, 3],
  categories: ['Residential', 'New Construction'],
  launchStatus: ['Upcoming', 'Under Construction'],
  price: [150000, 300000],
  developer: 'ABC Developers',
  boundSouthWestLat: 34.0522,
  boundSouthWestLng: -118.2437,
  boundNorthEastLat: 34.103,
  boundNorthEastLng: -118.1907,
  distance: 5
};

export const requestData = {
  name: 'MySavedSearch',
  filters: {
    searchString: 'Luxury Apartments',
    microMarket: 'Downtown',
    microMarkets: ['Suburb A', 'Suburb B'],
    bedRooms: [2, 3],
    houseType: 'Condo',
    bathRooms: [2, 2.5, 3],
    categories: ['Residential', 'New Construction'],
    launchStatus: ['Upcoming', 'Under Construction'],
    price: [150000, 300000],
    developer: 'ABC Developers',
    bounds: {
      sw: { lat: 34.0522, lng: -118.2437 },
      ne: { lat: 34.103, lng: -118.1907 }
    },
    distance: 5
  }
};

export const mockRequestData = {
  name: 'MySavedSearch',
  filters: {
    searchString: 'Luxury Apartments',
    microMarket: 'Downtown',
    microMarkets: ['Suburb A', 'Suburb B'],
    bedRooms: [2, 3],
    houseType: 'Condo',
    bathRooms: [2, 2.5, 3],
    categories: ['Residential', 'New Construction'],
    launchStatus: ['Upcoming', 'Under Construction'],
    price: [150000, 300000],
    developer: 'ABC Developers',
    bounds: undefined,
    distance: 5
  }
};

export const mockTransformedResult = {
  name: 'MySavedSearch',
  searchString: 'Luxury Apartments',
  microMarket: 'Downtown',
  microMarkets: ['Suburb A', 'Suburb B'],
  bedRooms: [2, 3],
  houseType: 'Condo',
  bathRooms: [2, 2.5, 3],
  categories: ['Residential', 'New Construction'],
  launchStatus: ['Upcoming', 'Under Construction'],
  price: [150000, 300000],
  developer: 'ABC Developers',
  boundSouthWestLat: null,
  boundSouthWestLng: null,
  boundNorthEastLat: null,
  boundNorthEastLng: null,
  distance: 5
};
