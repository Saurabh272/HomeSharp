import config from '../../app/config';
import { ProjectListingInterface } from '../../project/interfaces/project-listing.interface';
import { ProjectListing } from '../../project/types/project-listing.type';
import { Developer } from '../contracts/developer-detail.type';

export const developerDetailData = [{
  id: '1',
  name: 'Aim Realtors',
  slug: 'aim-realtors',
  foundedYear: '2017',
  reraCertified: true,
  summary: 'Some random summary',
  description: 'Some random description',
  logo: 'image-url:Aim Realtors',
  developerType: 'Developer'
}];

export const projectList: Array<ProjectListingInterface> = [{
  id: '1',
  name: 'Project 1',
  projectSlug: 'project-1',
  projectSummary: 'Project 1 summary',
  projectPicture: 'project-1-image',
  minPrice: 1000000,
  maxPrice: 2000000,
  minBedrooms: 1,
  maxBedrooms: 2,
  minBathrooms: 1,
  maxBathrooms: 2,
  minCarpetArea: 1000,
  maxCarpetArea: 2000,
  carpetAreaUnit: 'sq. ft.',
  localityName: 'Locality 1',
  localitySlug: 'locality-1',
  lat: 12.345678,
  lng: 12.345678,
  completionDate: '2020-01-01',
  featured: true,
  mostSearched: true,
  launchStatus: 'ready_to_move',
  images: 'image-1,image-2,image-3'
}];

export const transformedProjectList: ProjectListing = {
  projects: [{
    slug: 'project-1',
    name: 'Project 1',
    summary: 'Project 1 summary',
    thumbnail: {
      url: 'project-1-image',
      alt: 'Project 1'
    },
    priceRange: {
      min: 1000000,
      max: 2000000
    },
    bedrooms: {
      min: 1,
      max: 2,
      houseType: 'Beds'
    },
    bathrooms: {
      min: 1,
      max: 2
    },
    carpetArea: {
      min: 1000,
      max: 2000,
      unit: 'sq. ft.'
    },
    locality: {
      name: 'Locality 1',
      slug: 'locality-1'
    },
    geoLocation: {
      lat: 12.345678,
      lng: 12.345678
    },
    featured: true,
    mostSearched: true,
    launchStatus: 'Ready to move'
  }]
};

export const transformedDeveloperDetail: Developer = {
  name: 'Aim Realtors',
  slug: 'aim-realtors',
  foundedYear: '2017',
  developerType: 'Developer',
  reraCertified: true,
  summary: 'Some random summary',
  description: 'Some random description',
  image: {
    url: `${config.DIRECTUS_URL}/assets/image-url`,
    alt: 'Aim Realtors'
  },
  projects: [{
    slug: 'project-1',
    name: 'Project 1',
    summary: 'Project 1 summary',
    thumbnail: {
      alt: 'Project 1',
      url: 'project-1-image'
    },
    priceRange: {
      min: 1000000,
      max: 2000000
    },
    bedrooms: {
      min: 1,
      max: 2,
      houseType: 'Beds'
    },
    bathrooms: {
      min: 1,
      max: 2
    },
    carpetArea: {
      min: 1000,
      max: 2000,
      unit: 'sq. ft.'
    },
    locality: {
      name: 'Locality 1',
      slug: 'locality-1'
    },
    geoLocation: {
      lat: 12.345678,
      lng: 12.345678
    },
    launchStatus: 'Ready to move'
  }]
};

export const transformedDeveloperDetailWithoutProjects: Developer = {
  name: 'Aim Realtors',
  slug: 'aim-realtors',
  foundedYear: '2017',
  reraCertified: true,
  developerType: 'Developer',
  summary: 'Some random summary',
  description: 'Some random description',
  image: {
    url: `${config.DIRECTUS_URL}/assets/image-url`,
    alt: 'Aim Realtors'
  },
  projects: []
};
