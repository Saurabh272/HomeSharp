import { Injectable } from '@nestjs/common';
import config from '../../app/config';
import { ITransformer } from '../../app/interfaces/transformer.interface';
import { Project, ProjectListing } from '../types/project-listing.type';
import { ProjectListingInterface } from '../interfaces/project-listing.interface';
import { ProjectConfig } from '../config/project.config';
import { FieldChoiceInterface } from '../interfaces/field-choice.interface';

@Injectable()
export class SearchProjectTransformer implements ITransformer {
  private projectStatuses: FieldChoiceInterface[] = [];

  process(data: ProjectListingInterface[], counts?: any, projectStatuses?: FieldChoiceInterface[]) {
    this.projectStatuses = projectStatuses || [];
    const projectListing: ProjectListing = {
      projects: data.map((item: ProjectListingInterface) => {
        const project: Project = {
          slug: item.projectSlug || '',
          name: item.name || '',
          summary: item.projectSummary || '',
          thumbnail: this.getFileUrl(item.projectPicture, item.name),
          priceRange: {
            min: item.minPrice || 0,
            max: item.maxPrice || 0
          },
          bedrooms: {
            min: item.minBedrooms || 0,
            max: item.maxBedrooms || 0,
            houseType: ProjectConfig.houseType
          },
          bathrooms: {
            min: item.minBathrooms || 0,
            max: item.maxBathrooms || 0
          },
          carpetArea: {
            min: item.minCarpetArea || 0,
            max: item.maxCarpetArea || 0,
            unit: item.carpetAreaUnit || ProjectConfig.areaUnit
          },
          locality: {
            name: item.localityName || '',
            slug: item.localitySlug || ''
          },
          geoLocation: {
            lat: item.lat,
            lng: item.lng
          },
          completionDate: item.completionDate
            ? this.getISOTime(item.completionDate)
            : null,
          featured: item.featured,
          mostSearched: item.mostSearched,
          launchStatus: this.getLaunchStatus(item.launchStatus)
        };

        if (item.images && item.images.length) {
          // TODO: Store "," separator in a constant and use that here
          project.images = item.images.split(',').map((image: string) => this.getFileUrl(image, item.name));
        }

        return project;
      })
    };

    if (counts) {
      projectListing.metadata = {
        page: +counts.page,
        totalPages: +counts.totalPages
      };
    }

    return projectListing;
  }

  // TODO: This method is duplicated in multiple transformers (developer-detail.transformer.ts)
  getFileUrl(image: string, alt?: string) {
    if (image?.length) {
      return {
        url: `${config.DIRECTUS_URL}/assets/${image}`,
        alt
      };
    }
    return {
      url: '',
      alt
    };
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

  getLaunchStatus(projectStatus: string) {
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
