import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { Day } from '../types/initial-tour.type';

@Injectable()
export class TourUtil {
  getDay(date: string) {
    if (!date) {
      return null;
    }
    const visitDate = dayjs(date);
    const transformedDay: Day = {
      day: visitDate.format('ddd'),
      date: visitDate.date(),
      month: visitDate.format('MMMM'),
      year: visitDate.year()
    };
    return transformedDay;
  }

  getFullDay(date: string) {
    if (!date) {
      return null;
    }
    const visitDate = dayjs(date);
    const transformedDay: Day = {
      day: visitDate.format('dddd'),
      date: visitDate.date(),
      month: visitDate.format('MMMM'),
      year: visitDate.year()
    };
    return transformedDay;
  }

  getTimeSlot(date: string) {
    if (!date) {
      return null;
    }
    const visitTime = dayjs(date);
    const timeFormat = 'HH:mm';
    return visitTime.format(timeFormat);
  }

  getMinutesFromDuration(duration: string) {
    const unit = duration.charAt(duration.length - 1);
    const value = parseInt(duration, 10);

    switch (unit) {
      case 'h':
        return value * 60;
      case 'm':
        return value;
      case 's':
        return value / 60;
      default:
        return 0;
    }
  }
}
