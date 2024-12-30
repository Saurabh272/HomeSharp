import { AreaUnit, HouseType } from './project-detail.type';

type CurrentStatus = 'Under Construction' | 'Newly Launched' | 'Ready to Move' | 'Resale' | '';

export type ProjectIndexDetail = {
  projectId: string;
  projectName: string;
  projectSlug: string;
  propertyType: string;
  summary: string;
  developer: string;
  coordinates: Array<number>;
  latitude: number;
  longitude: number;
  microMarket: string;
  localityName: string;
  localitySlug: string;
  categories: string[];
  categorySlug: string[];
  noOfUnits: number;
  noOfUnitsSold: number;
  percentageSold: number;
  carpetAreaMin: number;
  carpetAreaMax: number;
  carpetAreaUnit: AreaUnit;
  bedRoomMin: number;
  bedRoomMax: number;
  houseType: HouseType;
  bathRoomMin: number;
  bathRoomMax: number;
  hidePrice: boolean;
  priceMin: number;
  priceMax: number;
  address: string;
  currentStatus: CurrentStatus;
  developerSlug: string;
  completionDate: string;
  featured: boolean;
  mostSearched: boolean;
  newlyLaunched: boolean;
  images: string;
  thumbnail: string;
  furnishingLevel: string[]
};
