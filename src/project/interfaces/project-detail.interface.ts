import { AreaUnit, HouseType } from '../types/project-detail.type';

export interface ProjectDetailInterface {
  projectId: string;
  projectName: string;
  projectSlug: string;
  projectDescription: string;
  propertyType: string;
  projectTitle: string;
  projectPicture: string;
  images: string;
  floorPlans: string;
  customMap: string | null;
  projectPlan: string | null;
  brochure: string | null;
  launchStatus: string;
  hidePrice: boolean;
  minimumPrice: number;
  maximumPrice: number;
  reraRegistrationNumbers: string;
  houseType: HouseType;
  minimumBedrooms: number;
  maximumBedrooms: number;
  minimumBathrooms: number;
  maximumBathrooms: number;
  minimumCarpetArea: number;
  maximumCarpetArea: number;
  areaUnit: AreaUnit;
  locality: string;
  latitude: number;
  longitude: number;
  developerName: string;
  developerSlug: string;
  developerWebsite: string;
  developerLogo: string;
  developerAddressLine1: string;
  developerAddressLine2: string;
  developerAddressCity: string;
  developerAddressState: string;
  developerAddressPinCode: string;
  threeSixtyImage: string | null;
  localitySlug?: string; // TODO remove optional
  furnishingLevel?: string[]
}
