import { VisitType } from './visit-type.type';

export type Day = {
  day: string;
  date: number;
  month: string;
  year: number;
};

export type InitialTour = {
  days: Array<Day>;
  timeSlots: Array<string>;
  visitTypes: Array<VisitType>;
};
