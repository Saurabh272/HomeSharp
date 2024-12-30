import { ProjectListingInterface } from '../../project/interfaces/project-listing.interface';

export const mockConfigurationIdRequest = { configurationId: 'configurationId' };

export const mockProjectSlugRequest = { projectSlug: 'projectSlug' };

export const mockProjectsData: ProjectListingInterface[] = [{
  id: 'projectId1',
  name: 'Project1',
  projectSlug: 'project_1',
  projectSummary: 'project 1 summary',
  projectPicture: 'project_1.jpg',
  images: 'project_1.jpg,project_2.jpg',
  minPrice: 100000,
  maxPrice: 200000,
  launchStatus: '2',
  minBedrooms: 2,
  maxBedrooms: 4,
  minBathrooms: 2,
  maxBathrooms: 3,
  minCarpetArea: 800,
  maxCarpetArea: 1200,
  carpetAreaUnit: 'sq. ft.',
  localityName: 'Locality 1',
  localitySlug: 'locality_1',
  lat: 123.456,
  lng: 789.012,
  completionDate: '2020-01-01',
  featured: true,
  mostSearched: false
},
{
  id: 'projectId2',
  name: 'Project2',
  projectSlug: 'project_2',
  projectSummary: 'project 2 summary',
  projectPicture: 'project_2.jpg',
  images: 'project_1.jpg,project_2.jpg',
  minPrice: 100000,
  maxPrice: 200000,
  launchStatus: '2',
  minBedrooms: 2,
  maxBedrooms: 4,
  minBathrooms: 2,
  maxBathrooms: 3,
  minCarpetArea: 800,
  maxCarpetArea: 1200,
  carpetAreaUnit: 'sq. ft.',
  localityName: 'Locality 2',
  localitySlug: 'locality_2',
  lat: 123.456,
  lng: 789.012,
  completionDate: '2020-01-01',
  featured: true,
  mostSearched: false
}];

export const transformedData = {
  projects: [
    {
      carpetAreaUnit: 'sq. ft.',
      completionDate: '2020-01-01',
      featured: true,
      id: 'projectId1',
      images: 'project_1.jpg,project_2.jpg',
      lat: 123.456,
      launchStatus: '2',
      lng: 789.012,
      localityName: 'Locality 1',
      localitySlug: 'locality_1',
      maxBathrooms: 3,
      maxBedrooms: 4,
      maxCarpetArea: 1200,
      maxPrice: 200000,
      minBathrooms: 2,
      minBedrooms: 2,
      minCarpetArea: 800,
      minPrice: 100000,
      mostSearched: false,
      name: 'Project1',
      projectPicture: 'project_1.jpg',
      projectSlug: 'project_1',
      projectSummary: 'project 1 summary'
    },
    {
      carpetAreaUnit: 'sq. ft.',
      completionDate: '2020-01-01',
      featured: true,
      id: 'projectId2',
      images: 'project_1.jpg,project_2.jpg',
      lat: 123.456,
      launchStatus: '2',
      lng: 789.012,
      localityName: 'Locality 2',
      localitySlug: 'locality_2',
      maxBathrooms: 3,
      maxBedrooms: 4,
      maxCarpetArea: 1200,
      maxPrice: 200000,
      minBathrooms: 2,
      minBedrooms: 2,
      minCarpetArea: 800,
      minPrice: 100000,
      mostSearched: false,
      name: 'Project2',
      projectPicture: 'project_2.jpg',
      projectSlug: 'project_2',
      projectSummary: 'project 2 summary'
    }
  ]
};

export const mockProjectStatistics = [{
  latitude: {
    min: 1,
    max: 1,
    diff: 1
  },
  longitude: {
    min: 1,
    max: 1,
    diff: 1
  },
  minimumPrice: {
    min: 1,
    max: 1,
    diff: 1
  },
  maximumPrice: {
    min: 1,
    max: 1,
    diff: 1
  }
}];

export const mockConfigurationStatistics = [{
  bedrooms: {
    min: 1,
    max: 1,
    diff: 1
  },
  carpetArea: {
    min: 1,
    max: 1,
    diff: 1
  }
}];

export const mockProjectDetails = [{
  projectId: 'projectId1',
  projectName: 'Project1',
  projectSlug: 'project_1',
  wingId: 'wingId1',
  configurationId: 'configurationId1',
  projectLocation: 'POINT(1 1)',
  bedrooms: 1,
  carpetArea: 1,
  minimumPrice: 1,
  maximumPrice: 1
}];

export const mockSimilarProjects = [{
  projectId: 'projectId1'
},
{
  projectId: 'projectId2'
}];

export const mockConfigurationIds = [{
  configurationId: 'configurationId1'
},
{
  configurationId: 'configurationId2'
}];

export const projectList1 = [
  'projectId1',
  'projectId2',
  'projectId3',
  'projectId4',
  'projectId5',
  'projectId6',
  'projectId7'
];

export const projectList2 = [
  'projectId10',
  'projectId20',
  'projectId30',
  'projectId40',
  'projectId50',
  'projectId60',
  'projectId70'
];

export const projectList3 = [
  'projectId100',
  'projectId200',
  'projectId300',
  'projectId400',
  'projectId500'
];

export const mockCombinedProjectList = [
  'projectId1',
  'projectId10',
  'projectId2',
  'projectId20',
  'projectId3',
  'projectId30',
  'projectId4',
  'projectId40',
  'projectId5',
  'projectId50'
];

export const mockCombinedProjectList2 = [
  'projectId1',
  'projectId10',
  'projectId100',
  'projectId2',
  'projectId20',
  'projectId200',
  'projectId3',
  'projectId30',
  'projectId300',
  'projectId4'
];
