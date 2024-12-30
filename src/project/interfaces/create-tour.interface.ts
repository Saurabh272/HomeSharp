export interface CreateTour {
  slug: string;
  visitType: { value: string };
  day: {
    date: number;
    month: string;
    year: number;
  },
  timeSlot: string;
}
