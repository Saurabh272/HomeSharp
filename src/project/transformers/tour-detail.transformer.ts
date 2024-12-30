import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import config from '../../app/config';
import { ITransformer } from '../../app/interfaces/transformer.interface';
import {
  CancellationReason,
  Tour,
  TourDetails
} from '../types/tour-detail.type';
import { VisitType } from '../types/visit-type.type';
import { TourUtil } from '../utils/tour.util';
import { FieldChoiceInterface } from '../interfaces/field-choice.interface';

@Injectable()
export class TourDetailTransformer implements ITransformer {
  constructor(private readonly tourUtil: TourUtil) {}

  private siteVisitTypes: Array<any>;

  private cancellationReasons: Array<any>;

  process(data: any) {
    this.siteVisitTypes = data.visitTypes;
    this.cancellationReasons = data.cancellationReasons;

    const tourDetails: TourDetails | NonNullable<unknown> = {
      tour: this.getTour(data.tourDetails[0]),
      cancellationReasons: this.getCancellationReasons(data.cancellationReasons)
    };
    return tourDetails;
  }

  getTour(tour: any) {
    if (!tour) {
      return {};
    }
    const transformedTour: Tour = {
      id: tour.siteVisit.id,
      siteVisitId: tour.siteVisit.visitId,
      dateCreated: this.getDateCreated(tour.siteVisit.dateCreated),
      project: this.getProject(tour.project),
      rmDetails: {
        name: tour.rm?.name
      },
      siteVisitStatus: {
        label: tour.siteVisit.siteVisitStatus.label,
        value: tour.siteVisit.siteVisitStatus.value
      },
      allowUpdate: tour.siteVisit.siteVisitStatus.allowUpdate,
      day: this.tourUtil.getFullDay(tour.siteVisit.visitTime),
      timeSlot: this.tourUtil.getTimeSlot(tour.siteVisit.visitTime),
      visitType: this.getVisitType(tour.siteVisit.visitType),
      cancellationReason: this.getCancellationReason(tour.siteVisit.cancellationReason),
      cancellationReasonDetails: tour.siteVisit.cancellationReasonDetails
    };
    return transformedTour;
  }

  getDateCreated(dateCreated: string) {
    return dayjs(dateCreated).format('DD/MM/YY');
  }

  getProject(project: {
    name: string;
    slug: string;
    lat: number;
    lng: number;
    locality: string;
    propertyPicture: string;
    images: string }) {
    return {
      name: project.name,
      slug: project.slug,
      geoLocation: {
        lat: project.lat,
        lng: project.lng
      },
      locality: {
        name: project.locality
      },
      images: this.getProjectImages(
        project.propertyPicture,
        project.images,
        project.name
      )
    };
  }

  // TODO: This method is duplicated in multiple transformers (all-tours-detail.transformer.ts)
  getProjectImages(projectPicture: string, images: string, projectName: string) {
    // TODO: Store "," in a constant and use that here and other places where we are splitting the project images
    const imagesArray = images?.length ? images.split(',') : [];
    imagesArray.unshift(projectPicture);

    return imagesArray.map((image) => (this.getFileUrl(image, projectName)));
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

  getVisitType(visitType: string): VisitType {
    const type = this.siteVisitTypes.find((item) => item.value === visitType);
    return {
      label: type.text,
      value: type.value
    };
  }

  getCancellationReason(cancellationReason: string) {
    if (!cancellationReason) {
      return null;
    }
    const reason = this.cancellationReasons.find((item) => item.value === cancellationReason);
    return {
      label: reason.text,
      value: reason.value
    };
  }

  getCancellationReasons(cancellationReasons:FieldChoiceInterface[]) {
    const transformedCancellationReasons: Array<CancellationReason> = cancellationReasons.map(
      (item): CancellationReason => ({
        label: item.text,
        value: item.value
      })
    );

    return transformedCancellationReasons;
  }
}
