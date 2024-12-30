import { Day } from './initial-tour.type';
import { VisitType } from './visit-type.type';
import { RmDetails } from './rm-detail.type';

export type Project = {
  name: string,
  geoLocation: {
    lat: string,
    lng: string
  },
  locality: {
    name: string
  }
};

export type SiteVisitStatus = {
  label: string;
  value: string;
};

export type CreateTour = {
  id: string;
  project : Project;
  rmDetails?: RmDetails;
  day: Day;
  timeSlot: string;
  siteVisitStatus: SiteVisitStatus;
  visitType: VisitType;
};
