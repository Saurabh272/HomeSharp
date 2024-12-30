import { VisitType } from './visit-type.type';
import { RmDetails } from './rm-detail.type';
import { Day } from './initial-tour.type';

type Image = {
  url: string;
  alt: string;
};

type GeoLocation = {
  lat: number;
  lng: number;
};

type Locality = {
  name: string;
};

export type SiteVisitStatus = {
  label: string;
  value: string;
};

export type CancellationReason = {
  label: string;
  value: string;
};

type Project = {
  name: string;
  slug: string;
  geoLocation: GeoLocation;
  locality: Locality;
  images: Array<Image>
};

export type Tour = {
  id: string;
  siteVisitId: string;
  dateCreated: string;
  project: Project;
  rmDetails: RmDetails;
  siteVisitStatus: SiteVisitStatus;
  allowUpdate: boolean;
  day: Day;
  timeSlot: string;
  visitType: VisitType;
  cancellationReason?: CancellationReason;
  cancellationReasonDetails?: string;
};

export type TourDetails = {
  tour: Tour;
  cancellationReasons: Array<CancellationReason>;
};
