import { Injectable } from '@nestjs/common';
import { ITransformer } from '../../app/interfaces/transformer.interface';
import { CreateTour, Project } from '../types/create-tour.type';
import { TourUtil } from '../utils/tour.util';
import { VisitType } from '../types/visit-type.type';
import { RmDetails } from '../types/rm-detail.type';

@Injectable()
export class CreateTourTransformer implements ITransformer {
  constructor(private readonly tourUtil: TourUtil) {}

  private siteVisitTypes: Array<any>;

  process(data: any) {
    const { tourDetails } = data;
    this.siteVisitTypes = data.visitTypes;

    const tour: CreateTour = {
      id: tourDetails[0]?.siteVisit.id,
      project: this.getProject(tourDetails[0]?.project),
      rmDetails: this.getRmDetails(tourDetails[0]?.rm),
      day: this.tourUtil.getDay(tourDetails[0]?.siteVisit.visitTime),
      timeSlot: this.tourUtil.getTimeSlot(tourDetails[0]?.siteVisit.visitTime),
      siteVisitStatus: {
        label: tourDetails[0]?.siteVisit?.siteVisitStatus.label,
        value: tourDetails[0]?.siteVisit?.siteVisitStatus.value
      },
      visitType: this.getVisitType(tourDetails[0]?.siteVisit.visitType)
    };
    return tour;
  }

  getProject(project: any) {
    const transformedProject : Project = {
      name: project.name,
      geoLocation: {
        lat: project.lat,
        lng: project.lng
      },
      locality: {
        name: project.locality
      }
    };
    return transformedProject;
  }

  getRmDetails(rmDetails: { name: string }) {
    if (!rmDetails || !rmDetails.name) {
      return null;
    }
    const transformedRmDetails: RmDetails = {
      name: rmDetails.name
    };

    return transformedRmDetails;
  }

  getVisitType(visitType: string): VisitType {
    const type = this.siteVisitTypes.find((item) => item.value === visitType);
    return {
      label: type.text,
      value: type.value
    };
  }
}
