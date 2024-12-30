import { Injectable } from '@nestjs/common';
import config from '../../app/config';
import { ITransformer } from '../../app/interfaces/transformer.interface';
import { FieldChoiceInterface } from '../interfaces/field-choice.interface';
import {
  AllToursDetails,
  CancellationReason,
  Tour,
  VisitType
} from '../types/all-tours-detail.type';
import { AllToursDetailInterface } from '../interfaces/all-tours-detail.interface';
import { TourUtil } from '../utils/tour.util';

@Injectable()
export class AllToursDetailTransformer implements ITransformer {
  constructor(private readonly tourUtil: TourUtil) {}

  private siteVisitTypes: Array<FieldChoiceInterface>;

  process(data: AllToursDetailInterface) {
    this.siteVisitTypes = data.allToursDetails.visitTypes;

    const allTourDetails: AllToursDetails = {
      tours: this.getTour(data.allToursDetails.tourDetails),
      cancellationReasons: this.getCancellationReasons(data.allToursDetails.cancellationReasons),
      metadata: {
        page: +data.pageDetails.page,
        totalPages: Math.ceil(+data.allToursDetails.tourCount.siteVisitCount / +data.pageDetails.limit),
        totalCount: +data.allToursDetails.tourCount.siteVisitCount
      }
    };

    return allTourDetails;
  }

  getTour(tour: Array<any>) {
    if (!tour || !tour.length) {
      return [];
    }
    const transformedTour: Array<Tour> = tour.map((item): Tour => ({
      id: item.siteVisit.id,
      project: this.getProject(item.project),
      siteVisitStatus: {
        label: item.siteVisit.siteVisitStatus.label,
        value: item.siteVisit.siteVisitStatus.value
      },
      allowUpdate: item.siteVisit.siteVisitStatus.allowUpdate,
      day: this.tourUtil.getFullDay(item.siteVisit.visitTime),
      timeSlot: this.tourUtil.getTimeSlot(item.siteVisit.visitTime),
      visitType: this.getVisitType(item.siteVisit.visitType)
    }));

    return transformedTour;
  }

  getProject(project: { name: string; propertyPicture: string; images: string }) {
    return {
      name: project.name,
      images: this.getProjectImages(
        project.propertyPicture,
        project.images,
        project.name
      )
    };
  }

  // TODO: This method is duplicated in multiple transformers (tour-detail.transformer.ts)
  getProjectImages(projectPicture: string, images: string, projectName: string) {
    // TODO: Store "," in a constant and use that here and other places where we are splitting the project images
    const imagesArray = images?.length ? images.split(',') : [];
    imagesArray.unshift(projectPicture);

    return imagesArray.map((image) => (this.getFileUrl(image, projectName)));
  }

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

  getVisitType(visitType: string): VisitType {
    const type = this.siteVisitTypes.find((item) => item.value === visitType);
    return {
      value: type.value,
      label: type.text
    };
  }

  getCancellationReasons(cancellationReasons: FieldChoiceInterface[]) {
    const transformedCancellationReasons: Array<CancellationReason> = cancellationReasons.map(
      (item): CancellationReason => ({
        label: item.text,
        value: item.value
      })
    );

    return transformedCancellationReasons;
  }
}
