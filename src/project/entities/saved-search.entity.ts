import { Injectable } from '@nestjs/common';

@Injectable()
export class SavedSearchEntity {
  public readonly tableName: string = 'saved_searches';

  public readonly id: string = 'id';

  public readonly name: string = 'name';

  public readonly houseType: string = 'house_type';

  public readonly bathRooms: string = 'bathrooms';

  public readonly categories: string = 'categories';

  public readonly launchStatus: string = 'launch_status';

  public readonly developer: string = 'developer';

  public readonly bedRooms: string = 'bedrooms';

  public readonly boundSouthWestLat: string = 'south_west_lat';

  public readonly boundSouthWestLng: string = 'south_west_lng';

  public readonly boundNorthEastLat: string = 'north_east_lat';

  public readonly boundNorthEastLng: string = 'north_east_lng';

  public readonly distance: string = 'distance';

  public readonly searchString: string = 'search_string';

  public readonly microMarket: string = 'micro_market';

  public readonly microMarkets: string = 'micro_markets';

  public readonly price: string = 'price';

  public readonly customerId: string = 'customer_id';

  public readonly dateCreated: string = 'date_created';

  public readonly fieldMappings = {
    name: this.name,
    houseType: this.houseType,
    bathRooms: this.bathRooms,
    categories: this.categories,
    launchStatus: this.launchStatus,
    developer: this.developer,
    bedRooms: this.bedRooms,
    searchString: this.searchString,
    microMarket: this.microMarket,
    microMarkets: this.microMarkets,
    price: this.price,
    boundSouthWestLat: this.boundSouthWestLat,
    boundSouthWestLng: this.boundSouthWestLng,
    boundNorthEastLat: this.boundNorthEastLat,
    boundNorthEastLng: this.boundNorthEastLng,
    distance: this.distance
  };
}
