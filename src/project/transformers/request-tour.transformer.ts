import { Injectable } from '@nestjs/common';
import { ITransformer } from '../../app/interfaces/transformer.interface';
import {
  Day,
  InitialTour
} from '../types/initial-tour.type';
import { VisitType } from '../types/visit-type.type';
import { DayInterface } from '../interfaces/day.interface';
import { FieldChoiceInterface } from '../interfaces/field-choice.interface';

@Injectable()
export class RequestTourTransformer implements ITransformer {
  process(data: { days: DayInterface[], timeSlots: string[], visitTypes: FieldChoiceInterface[] }) {
    const initialTourDetails: InitialTour = {
      days: this.getDays(data.days),
      timeSlots: data.timeSlots,
      visitTypes: this.getVisitTypes(data.visitTypes)
    };

    return initialTourDetails;
  }

  getDays(days: DayInterface[]) {
    const transformedDays: Array<Day> = days.map((item): Day => ({
      day: item.day,
      date: item.date,
      month: item.month,
      year: item.year
    }));

    return transformedDays;
  }

  getVisitTypes(visitTypes: FieldChoiceInterface[]) {
    const transformedVisitTypes: Array<VisitType> = visitTypes.map((item): VisitType => ({
      label: item.text,
      value: item.value
    }));

    return transformedVisitTypes;
  }
}
