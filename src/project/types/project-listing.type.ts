import { Bedrooms, CarpetAreaRange, Image } from './project-detail.type';

type PriceRange = {
  min: number;
  max: number;
};

type Bathrooms = {
  min: number;
  max: number;
};

type Locality = {
  name: string;
  slug: string;
};

type GeoLocation = {
  lat: number;
  lng: number;
};

export type Metadata = {
  page: number;
  totalPages: number;
};

export type Project = {
  slug: string;
  name: string;
  summary: string;
  thumbnail?: Image;
  images?: Array<Image>,
  priceRange: PriceRange;
  bedrooms: Bedrooms;
  bathrooms: Bathrooms;
  carpetArea: CarpetAreaRange;
  locality: Locality;
  geoLocation: GeoLocation;
  completionDate?: string;
  featured?: boolean;
  mostSearched?: boolean;
  newlyLaunched?: boolean;
  launchStatus: string;
};

export type ProjectListing = {
  projects: Array<Project>;
  metadata?: Metadata;
};
