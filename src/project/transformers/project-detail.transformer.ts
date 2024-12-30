import { Injectable } from '@nestjs/common';
import config from '../../app/config';
import { ITransformer } from '../../app/interfaces/transformer.interface';
import {
  Address,
  Category,
  Configuration,
  Developer,
  Feature,
  FeatureCategory,
  KeyHighlight,
  ProjectDetail,
  Wing,
  WingConfiguration
} from '../types/project-detail.type';
import { WingConfigurationInterface } from '../interfaces/wing-configuration.interface';
import { ProjectDetailInterface } from '../interfaces/project-detail.interface';
import { FieldChoiceInterface } from '../interfaces/field-choice.interface';
import { ProjectConfig } from '../config/project.config';

@Injectable()
export class ProjectDetailTransformer implements ITransformer {
  private projectStatuses: FieldChoiceInterface[] = [];

  process(
    data: {
      projectDetail: ProjectDetailInterface,
      wingsConfigurations: WingConfigurationInterface[],
      features: any,
      projectStatuses: FieldChoiceInterface[],
      whatsAppMessage: string
    }
  ) {
    if (!data || !data.projectDetail) {
      return {};
    }
    this.projectStatuses = data.projectStatuses;
    const projectImages = this.getProjectImages({
      projectPicture: data.projectDetail.projectPicture,
      images: data.projectDetail.images
    });
    const floorPlans = this.getProjectImages({
      images: data.projectDetail.floorPlans
    });
    const developerAddress: Address = {
      line1: data.projectDetail.developerAddressLine1 || '',
      line2: data.projectDetail.developerAddressLine2 || '',
      city: data.projectDetail.developerAddressCity || '',
      state: data.projectDetail.developerAddressState || '',
      pincode: data.projectDetail.developerAddressPinCode || ''
    };

    const developer: Developer = {
      name: data.projectDetail.developerName,
      slug: data.projectDetail.developerSlug,
      website: data.projectDetail.developerWebsite,
      address: developerAddress,
      thumbnail: this.getFileUrl(data.projectDetail.developerLogo)
    };

    const featureCategories: Array<FeatureCategory> = data.features
      ? this.getFeatureCategories(data.features) : [];

    const configurations: Array<Configuration> = data.wingsConfigurations
      ? this.getConfigurations(data.wingsConfigurations) : [];

    const keyHighlights: Array<KeyHighlight> = this.getKeyHighLights(data.features);

    const projectDetails: ProjectDetail = {
      name: data.projectDetail.projectName,
      description: data.projectDetail.projectDescription,
      propertyType: data.projectDetail.propertyType,
      images: projectImages,
      brochureUrl: this.getFileUrl(data.projectDetail.brochure).url,
      reraRegistrationNumbers: data.projectDetail.reraRegistrationNumbers?.split(','),
      projectPlan: this.getFileUrl(data.projectDetail.projectPlan),
      customMap: this.getFileUrl(data.projectDetail.customMap),
      launchStatus: data.projectDetail.propertyType === ProjectConfig.resalePropertyType
        ? ProjectConfig.resaleLaunchStatus
        : this.getProjectStatus(data.wingsConfigurations),
      completionDate: this.getMinimumCompletionDate(data.wingsConfigurations),
      hidePrice: data.projectDetail.hidePrice,
      priceRange: {
        min: data.projectDetail.minimumPrice
      },
      locality: {
        name: data.projectDetail.locality,
        slug: data?.projectDetail?.localitySlug
      },
      geoLocation: {
        latitude: data.projectDetail.latitude,
        longitude: data.projectDetail.longitude
      },
      bedrooms: {
        min: data.projectDetail.minimumBedrooms,
        max: data.projectDetail.maximumBedrooms,
        houseType: data.projectDetail.houseType || ProjectConfig.houseType
      },
      carpetArea: {
        min: data.projectDetail.minimumCarpetArea,
        max: data.projectDetail.maximumCarpetArea,
        unit: data.projectDetail.areaUnit || ProjectConfig.areaUnit
      },
      threeSixtyImage: {
        thumbnail: this.getFileUrl(data.projectDetail.projectPicture),
        imageUrl: data.projectDetail.threeSixtyImage || ''
      },
      developer,
      configurations,
      floorPlans,
      featureCategories,
      keyHighlights,
      message: data.whatsAppMessage,
      furnishingLevel: data?.projectDetail?.furnishingLevel
    };
    if (projectDetails.hidePrice) {
      delete projectDetails.priceRange;
    }
    return projectDetails;
  }

  // TODO: This method is duplicated in multiple transformers (developer-detail.transformer.ts)
  getFileUrl(image: string) {
    if (image?.length) {
      // TODO: Store ":" in a constant and use that here and other places where we are splitting the project images
      const fileName = image.split(':')[0];
      const alt = image.split(':')[1] || '';
      if (fileName?.length) {
        return {
          url: `${config.DIRECTUS_URL}/assets/${fileName}`,
          alt
        };
      }
    }
    return {
      url: '',
      alt: ''
    };
  }

  getProjectImages(projectImage: { projectPicture?: string, images: string }) {
    const imagesArray = projectImage.images ? projectImage.images.split(',') : [];

    if (projectImage.projectPicture && projectImage.projectPicture.length) {
      imagesArray.unshift(projectImage.projectPicture);
    }
    if (!imagesArray.length) {
      return [];
    }
    return imagesArray
      .map((image) => (this.getFileUrl(image)));
  }

  getLaunchStatus(launchStatus: string) {
    switch (launchStatus) {
      case 'UNDER_CONSTRUCTION':
        return 'Under Construction';
      case 'OC_RECEIVED':
        return 'OC Received';
      case 'READY_TO_MOVE':
        return 'Ready to Move';
      default:
        return 'Under Construction';
    }
  }

  getConfigurations(wingsConfigurations: WingConfigurationInterface[]) {
    if (!wingsConfigurations || !wingsConfigurations.length) {
      return [];
    }
    const configurations: Array<Configuration> = wingsConfigurations.reduce((result: any, configuration: any) => {
      const {
        bedrooms, houseType, wingName, bathrooms, carpetArea, areaUnit, floorPlan, configurationId,
        completionDate, projectStatus
      } = configuration;

      const existingConfigurations = result?.find(
        (existingConfiguration: any) => (
          existingConfiguration.bedrooms === bedrooms && existingConfiguration.houseType === houseType
        )
      );

      const wing: Wing = {
        name: wingName,
        reraStage: this.getWingStatus(projectStatus),
        completionDate: completionDate ? new Date(completionDate).toISOString() : ''
      };

      const wingConfiguration: WingConfiguration = {
        wing,
        bathrooms,
        configurationId,
        carpetArea: {
          area: carpetArea,
          unit: areaUnit
        },
        floorPlan: this.getFileUrl(floorPlan)
      };

      if (existingConfigurations) {
        existingConfigurations.wingsConfigurations.push(wingConfiguration);
      } else {
        result.push({
          bedrooms,
          houseType,
          wingsConfigurations: [wingConfiguration]
        });
      }

      return result;
    }, []);

    return configurations;
  }

  getFeatureCategories(features: any) {
    if (!features || !features.length) {
      return [];
    }
    const featureCategories: FeatureCategory[] = [];

    // group features based on feature category id
    const groupedFeatures = features.reduce((groups: any, feature: any) => {
      const { featureCategoryId } = feature;
      if (!groups[featureCategoryId]) {
        groups[featureCategoryId] = [];
      }
      groups[featureCategoryId].push(feature);
      return groups;
    }, {});

    Object.keys(groupedFeatures).forEach((categoryId) => {
      const categoryFeatures = groupedFeatures[categoryId];

      // for each category, make category object
      const category: Category = {
        id: categoryId,
        label: categoryFeatures[0].featureCategory
      };

      // for each category, generate feature array
      const featuresArray: Feature[] = categoryFeatures.map((feature: any) => {
        const transformedFeature: Feature = {
          image: this.getFileUrl(feature.featureImage),
          title: feature.featureName,
          subFeatures: feature.featureList
        };
        return transformedFeature;
      });

      // push category, feature object
      const featureCategory: FeatureCategory = {
        category,
        features: featuresArray
      };

      featureCategories.push(featureCategory);
    });
    return featureCategories;
  }

  getKeyHighLights(features: any): Array<KeyHighlight> {
    if (!features || !features.length) {
      return [];
    }
    return features
      .filter((feature: any) => feature.keyHighlight === true)
      .map((feature: any) => {
        const transformedFeature: KeyHighlight = {
          image: this.getFileUrl(feature.featureImage),
          title: feature.featureName
        };
        return transformedFeature;
      });
  }

  getMinimumCompletionDate(wingsConfigurations: WingConfigurationInterface[]) {
    if (!wingsConfigurations || !wingsConfigurations.length) {
      return '';
    }
    const dates = wingsConfigurations
      .map((configuration) => configuration.completionDate)
      .filter((completionDate) => completionDate && typeof completionDate === 'string')
      .map((completionDate) => new Date(completionDate).getTime());
    if (!dates.length) {
      return '';
    }
    const minimumDate = new Date(Math.min.apply(null, dates));
    return minimumDate.toISOString();
  }

  getWingStatus(projectStatus: string) {
    if (!this.projectStatuses || !this.projectStatuses.length) {
      return '';
    }
    if (!projectStatus) {
      return '';
    }
    const currentStatus = this.projectStatuses.find((status) => status.value === projectStatus.toString());

    return currentStatus?.text || '';
  }

  getProjectStatus(wingsConfigurations: WingConfigurationInterface[]) {
    if (!wingsConfigurations || !wingsConfigurations.length) {
      return '';
    }
    const statuses = wingsConfigurations
      .map((configuration) => +configuration.projectStatus)
      .filter((status) => status !== 0);

    if (!statuses.length) {
      return '';
    }
    const latestStatus = Math.min.apply(null, statuses);
    const currentStatus = this.projectStatuses.find((status) => status.value === latestStatus.toString());

    return currentStatus?.text || '';
  }
}
