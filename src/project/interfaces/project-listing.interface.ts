import { AreaUnit } from '../types/project-detail.type';

export interface ProjectListingInterface {
  id: string;
  name: string;
  projectSlug: string;
  projectSummary: string;
  projectPicture: string;
  images: string;
  minPrice: number;
  maxPrice: number;
  launchStatus: string;
  minBedrooms: number;
  maxBedrooms: number;
  minBathrooms: number;
  maxBathrooms: number;
  minCarpetArea: number;
  maxCarpetArea: number;
  carpetAreaUnit: AreaUnit;
  localityName: string;
  localitySlug: string;
  lat: number;
  lng: number;
  completionDate: string;
  featured: boolean;
  mostSearched: boolean;
}
