import { Day } from './initial-tour.type';

type Image = {
  url: string;
  alt: string;
};

type Project = {
  name: string;
  images: Array<Image>
};

type SiteVisitStatus = {
  label: string;
  value: string;
};

export type VisitType = {
  value: string;
  label: string;
};

export type Tour = {
  id: string;
  project: Project;
  siteVisitStatus: SiteVisitStatus;
  allowUpdate: boolean;
  day: Day;
  timeSlot: string;
  visitType: VisitType;
};

export type CancellationReason = {
  label: string;
  value: string;
};

type MetaData = {
  page: number;
  totalPages: number;
  totalCount: number;
};

export type AllToursDetails = {
  tours: Array<Tour>;
  cancellationReasons: Array<CancellationReason>;
  metadata: MetaData;
};
