export interface RescheduleTourInterface {
  id: string;
  day: {
    date: number;
    month: string;
    year: number;
  };
  timeSlot: string;
  visitType: {
    value: string;
  };
}
