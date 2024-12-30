import { ProjectForValidationInterface } from '../interfaces/project-for-validation.interface';
import { ProjectValidationRuleInterface } from '../interfaces/project-validation-rule.interface';

export const mockValidationRules: ProjectValidationRuleInterface = {
  fieldsToBeValidated: ['projectId'],
  fieldToLabelMap: new Map([['projectId', 'ProjectId']])
};

export const mockExtraValidationRule: ProjectValidationRuleInterface = {
  fieldsToBeValidated: ['testField'],
  fieldToLabelMap: new Map([['testField', 'Test Label']])
};

export const mockExtraValidationRules: ProjectValidationRuleInterface = {
  fieldsToBeValidated: ['testField1', 'testField2', 'testField3'],
  fieldToLabelMap: new Map([
    ['testField1', 'Test Label1'],
    ['testField2', 'Test Label2'],
    ['testField3', 'Test Label3']
  ])
};

export const mockExtraValidationRulesWithWingIds: ProjectValidationRuleInterface = {
  fieldsToBeValidated: ['testField1', 'testField2', 'testField3', 'wingIds'],
  fieldToLabelMap: new Map([
    ['testField1', 'Test Label1'],
    ['testField2', 'Test Label2'],
    ['testField3', 'Test Label3'],
    ['wingIds', 'Wings']
  ])
};

export const mockProject: ProjectForValidationInterface = {
  projectId: 'project-id',
  projectStatus: 'archive',
  projectName: 'project-name',
  projectSummary: 'Test Short description',
  projectSlug: 'project-slug',
  projectPicture: 'project-picture',
  images: 'images',
  projectPlan: 'project-plan',
  brochure: 'brochure',
  launchStatus: '1',
  minimumPrice: 2500000,
  maximumPrice: 5000000,
  wingIds: 'wing-ids',
  configurationIds: 'configuration-ids',
  wingsConfigurations: 'wings-configurations',
  microMarketId: 'micro-market-id',
  categories: 'categories',
  features: 'features',
  projectLocation: 'project-location',
  developerId: 'developer-id'
};

export const mockWingsConfigurationsWithArchiveStatus: [
  { project: ProjectForValidationInterface, wingConfigurations: any[] }
] = [
  {
    project: {
      projectId: 'project-id',
      projectStatus: 'archive',
      projectName: 'project-name',
      projectSummary: 'Test Short description',
      projectSlug: 'project-slug',
      projectPicture: 'project-picture',
      images: 'images',
      projectPlan: 'project-plan',
      brochure: 'brochure',
      launchStatus: '1',
      minimumPrice: 2500000,
      maximumPrice: 5000000,
      wingIds: 'wing-ids',
      configurationIds: 'configuration-ids',
      wingsConfigurations: 'wings-configurations',
      microMarketId: 'micro-market-id',
      categories: 'categories',
      features: 'features',
      projectLocation: 'project-location',
      developerId: 'developer-id'
    },
    wingConfigurations: [
      {
        wingId: 'wing-ids',
        wingProjectStatus: 1,
        completionDate: '2022-12-01',
        reraRegistrationNumber: 'TEST78210/34979',
        configurationId: 'configuration-ids',
        bedrooms: 2,
        bathrooms: 5,
        balconies: null,
        parkings: null,
        carpetArea: 10000
      }
    ]
  }
];

export const mockWingsConfigurationsWithDraftStatus: [
  { project: ProjectForValidationInterface, wingConfigurations: any[] }
] = [
  {
    project: {
      projectId: 'project-id',
      projectStatus: 'draft',
      projectName: 'project-name',
      projectSummary: 'Test Short description',
      projectSlug: 'project-slug',
      projectPicture: 'project-picture',
      images: 'images',
      projectPlan: 'project-plan',
      brochure: 'brochure',
      launchStatus: '1',
      minimumPrice: 2500000,
      maximumPrice: 5000000,
      wingIds: 'wing-ids',
      configurationIds: 'configuration-ids',
      wingsConfigurations: 'wings-configurations',
      microMarketId: 'micro-market-id',
      categories: 'categories',
      features: 'features',
      projectLocation: 'project-location',
      developerId: 'developer-id'
    },
    wingConfigurations: [
      {
        wingId: 'wing-ids',
        wingProjectStatus: 1,
        completionDate: '2022-12-01',
        reraRegistrationNumber: 'TEST78210/34979',
        configurationId: 'configuration-ids',
        bedrooms: 2,
        bathrooms: 5,
        balconies: null,
        parkings: null,
        carpetArea: 10000
      }
    ]
  }
];

export const mockWingsConfigurationsWithoutWings: [
  { project: ProjectForValidationInterface, wingConfigurations: any[] }
] = [
  {
    project: {
      projectId: 'project-id',
      projectStatus: 'draft',
      projectName: 'project-name',
      projectSummary: 'Test Short description',
      projectSlug: 'project-slug',
      projectPicture: 'project-picture',
      images: 'images',
      projectPlan: 'project-plan',
      brochure: 'brochure',
      launchStatus: '1',
      minimumPrice: 2500000,
      maximumPrice: 5000000,
      wingIds: 'wing-ids',
      configurationIds: 'configuration-ids',
      wingsConfigurations: 'wing-configurations',
      microMarketId: 'micro-market-id',
      categories: 'categories',
      features: 'features',
      projectLocation: 'project-location',
      developerId: 'developer-id'
    },
    wingConfigurations: []
  }
];

export const mockWingsConfigurationsFromDb = [
  {
    wingId: 'wing-id1',
    wingProjectStatus: 'draft',
    completionDate: '2021-01-01',
    reraRegistrationNumber: 'rera-registration-number',
    configurationId: 'configuration-id1',
    bedrooms: 2,
    bathrooms: 2,
    balconies: 2,
    parkings: 2,
    carpetArea: 1000
  },
  {
    wingId: 'wing-id2',
    wingProjectStatus: 'draft',
    completionDate: '2021-01-01',
    reraRegistrationNumber: 'rera-registration-number',
    configurationId: 'configuration-id2',
    bedrooms: 2,
    bathrooms: 2,
    balconies: 2,
    parkings: 2,
    carpetArea: 1000
  }
];
