import { Injectable } from '@nestjs/common';
import { ITransformer } from '../../app/interfaces/transformer.interface';
import { ProjectIndexDetail } from '../types/project-index-detail.type';
import config from '../../app/config';
import { ProjectForIndexingInterface } from '../interfaces/project-for-indexing.interface';
import { ProjectConfig } from '../config/project.config';
import { FieldChoiceInterface } from '../interfaces/field-choice.interface';

@Injectable()
export class ProjectIndexDetailTransformer implements ITransformer {
  private projectStatuses: FieldChoiceInterface[];

  process(data: {
    projectForIndexing: ProjectForIndexingInterface[],
    projectStatuses: FieldChoiceInterface[]
  }): Partial<ProjectIndexDetail>[] {
    this.projectStatuses = data.projectStatuses;

    return data.projectForIndexing
      .map((project) => this.processProject(project))
      .filter(Boolean);
  }

  processProject(project: ProjectForIndexingInterface): Partial<ProjectIndexDetail> {
    if (!project) {
      return null;
    }
    const address: string = [
      project.developerAddressLine1,
      project.developerAddressLine2,
      project.developerAddressCity,
      project.developerAddressState,
      project.developerAddressPinCode
    ]
      .filter(Boolean)
      .join(',');
    const categories = project.categories ? project.categories.split(',') : [];
    const categorySlugs = project.categorySlugs ? project.categorySlugs?.split(',') : [];
    const images = this.getProjectImages(project.projectPicture, project.images);
    const transformedProject = {
      projectId: project.projectId,
      projectName: project.projectName,
      projectSlug: project.projectSlug,
      propertyType: project.propertyType,
      summary: project.summary,
      developer: project.developer,
      coordinates: [project.latitude, project.longitude],
      latitude: project.latitude,
      longitude: project.longitude,
      microMarket: project.microMarket,
      localityName: project.localityName,
      localitySlug: project.localitySlug,
      categories,
      categorySlugs,
      noOfUnits: project.numberOfUnits,
      noOfUnitsSold: project.numberOfUnitsSold,
      percentageSold: +((+project.numberOfUnitsSold / +project.numberOfUnits) * 100).toFixed(2),
      carpetAreaMin: project.minimumCarpetArea,
      carpetAreaMax: project.maximumCarpetArea,
      carpetAreaUnit: project.areaUnit || ProjectConfig.areaUnit,
      bedRoomMin: project.minimumBedrooms,
      bedRoomMax: project.maximumBedrooms,
      houseType: project.houseType || ProjectConfig.houseType,
      bathRoomMin: project.minimumBathrooms,
      bathRoomMax: project.maximumBathrooms,
      hidePrice: project.hidePrice,
      priceMin: project.minimumPrice,
      priceMax: project.maximumPrice,
      address,
      currentStatus: project.propertyType === ProjectConfig.resalePropertyType
        ? ProjectConfig.resaleLaunchStatus
        : this.getProjectStatus(project.currentStatus),
      developerSlug: project.developerSlug,
      featured: project.featured,
      mostSearched: project.mostSearched,
      newlyLaunched: project.newlyLaunched,
      completionDate: project.completionDate
        ? this.getISOTime(project.completionDate)
        : null,
      images,
      thumbnail: project.projectPicture
        ? this.getFileUrl(project.projectPicture).url
        : null,
      furnishingLevel: project?.furnishingLevel
    };

    return Object.entries(transformedProject)
      .reduce((result, [key, value]) => {
        if (value !== null && value !== undefined) {
          result[key] = value;
        }
        return result;
      }, {});
  }

  getISOTime(date: string) {
    if (!date) {
      return null;
    }
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }
    return parsedDate.toISOString();
  }

  // TODO: This method is duplicated in multiple transformers (developer-detail.transformer.ts)
  getFileUrl(image: string) {
    if (image?.length > 0) {
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

  getProjectImages(projectPicture: string, images: string) {
    const imagesNames = images?.split(',') || [];
    if (projectPicture) {
      imagesNames.unshift(projectPicture);
    }
    if (!imagesNames.length) {
      return null;
    }
    const imagesArray = imagesNames
      .map((image) => {
        const imageObject = this.getFileUrl(image);
        if (imageObject.url?.length) {
          return imageObject;
        }
        return null;
      });

    return JSON.stringify(imagesArray.filter(Boolean));
  }

  getProjectStatus(projectStatus: string) {
    if (!this.projectStatuses || !this.projectStatuses.length) {
      return '';
    }
    if (!projectStatus) {
      return '';
    }
    const currentStatus = this.projectStatuses.find((status) => status.value === projectStatus.toString());

    return currentStatus?.text || '';
  }
}
