import * as dayjs from 'dayjs';
import { UnitType } from 'dayjs';
import { BadRequestException, Injectable } from '@nestjs/common';
import config from '../../app/config';
import { TourRepository } from '../repositories/tour.repository';
import { CreateTour } from '../interfaces/create-tour.interface';
import { CancelTourInterface } from '../interfaces/cancel-tour.interface';
import { TourConfig } from '../config/tour.config';
import { FieldChoiceInterface } from '../interfaces/field-choice.interface';
import { DayInterface } from '../interfaces/day.interface';
import { RescheduleTourInterface } from '../interfaces/reschedule-tour.interface';
import { GetTourInterface } from '../interfaces/get-tour.interface';
import { TourUtil } from '../utils/tour.util';
import { AllScheduledTourInterface } from '../interfaces/all-scheduled-tour.interface';

@Injectable()
export class TourService {
  constructor(
    private readonly tourRepository: TourRepository,
    private readonly tourUtil: TourUtil
  ) {}

  async requestTour(project: { slug: string }) {
    await this.getProjectId(project.slug);

    const visitTypes = await this.getVisitTypes();

    return {
      days: this.getDays(),
      timeSlots: this.getTimeSlots(),
      visitTypes
    };
  }

  getDays(): DayInterface[] {
    const startDate = dayjs();
    const daysCount = config.DAYS_TO_SHOW_FOR_TOUR_BOOKING;

    return Array.from({ length: daysCount }, (_, i) => {
      const currentDate = startDate.add(i, 'day');
      return {
        day: currentDate.format('ddd'),
        date: currentDate.date(),
        month: currentDate.format('MMMM'),
        year: currentDate.year()
      };
    });
  }

  getTimeSlots(): string[] {
    const startTime = dayjs()
      .set('hour', +(config.TOUR_BOOKING_START_TIME.slice(0, 2)))
      .set('minute', +(config.TOUR_BOOKING_START_TIME.slice(3)));
    const endTime = dayjs()
      .set('hour', +(config.TOUR_BOOKING_END_TIME.slice(0, 2)))
      .set('minute', +(config.TOUR_BOOKING_END_TIME.slice(3)));

    const tourDuration = this.parseTourDuration(config.TOUR_DURATION);

    const timeFormat = 'HH:mm';
    const timeSlots = [];

    let currentTime = startTime;

    while (currentTime.isBefore(endTime)) {
      timeSlots.push(currentTime.format(timeFormat));
      currentTime = currentTime.add(tourDuration.amount, tourDuration.unit);
    }

    return timeSlots;
  }

  parseTourDuration(duration: string): { amount: number, unit: 'hour' | 'minute' } {
    const amount = +duration.slice(0, -1);
    const unit = duration.slice(-1);

    if (Number.isNaN(amount) || !['h', 'm'].includes(unit)) {
      throw new Error('Invalid TOUR DURATION format');
    }

    const manipulationUnit: UnitType = unit === 'h' ? 'hour' : 'minute';

    return {
      amount,
      unit: manipulationUnit
    };
  }

  async createTour(user: string, tour: CreateTour) {
    const projectId = await this.getProjectId(tour.slug);
    const isTourScheduled: boolean = await this.hasScheduledTour(user, { slug: tour.slug });
    if (isTourScheduled) {
      throw new BadRequestException({
        message: 'You have already requested a tour for this project',
        allowBooking: false,
        error: 'Bad Request'
      });
    }

    const [visitTime, allScheduledTours] = await Promise.all([
      this.validateVisitTime(tour.day, tour.timeSlot),
      this.tourRepository.getAllScheduledTour(user)
    ]);

    const isEligibleForNewTour = allScheduledTours?.length === 0 || this.checkEligibility(visitTime, allScheduledTours);

    if (!isEligibleForNewTour) {
      const errorMessage = 'You have already booked a tour for the selected time. Please choose a different time slot.';
      throw new BadRequestException({
        message: errorMessage,
        allowBooking: true,
        error: 'Bad Request'
      });
    }

    await this.validateVisitType(tour.visitType);

    const newTourDetails: { id: string } = await this.tourRepository.insertTour({
      projectId,
      visitType: tour.visitType.value,
      visitTime,
      customer: user
    });

    return Promise.all([
      this.tourRepository.getTour(user, { id: newTourDetails?.id, upcoming: true }),
      this.getVisitTypes()
    ]);
  }

  checkEligibility(visitTime: string, allTourDetails: AllScheduledTourInterface[]) {
    const requestedDateTime = new Date(visitTime);

    return !allTourDetails.some((tour) => {
      const tourDateTime = new Date(tour.visitTime);
      const timeDifference = Math.abs(requestedDateTime.getTime() - tourDateTime.getTime()) / (1000 * 60);

      return timeDifference < this.tourUtil.getMinutesFromDuration(config.TOUR_DURATION);
    });
  }

  validateVisitTime(day: { year: number, month: string, date: number }, timeSlot: string) {
    if (!TourConfig.validMonths.includes(day.month)) {
      throw new BadRequestException('Invalid Month');
    }
    const visitTime = this.convertToDateTime(day, timeSlot);

    const daysCount = config.DAYS_TO_SHOW_FOR_TOUR_BOOKING;
    const startTime = config.TOUR_BOOKING_START_TIME;
    const endTime = config.TOUR_BOOKING_END_TIME;

    const startDateTime = dayjs(visitTime)
      .set('hour', +(config.TOUR_BOOKING_START_TIME.slice(0, 2)))
      .set('minute', +(config.TOUR_BOOKING_START_TIME.slice(3)));
    const endDateTime = dayjs(visitTime)
      .set('hour', +(config.TOUR_BOOKING_END_TIME.slice(0, 2)))
      .set('minute', +(config.TOUR_BOOKING_END_TIME.slice(3)));
    const visitDateTime = dayjs(visitTime);

    if (dayjs(visitTime).isBefore(dayjs())) {
      throw new BadRequestException('Tour cannot be scheduled in the past');
    }

    if (dayjs(visitTime).isAfter(dayjs().add(daysCount, 'days'))) {
      throw new BadRequestException(`Tour cannot be scheduled for more than ${daysCount} days in advance`);
    }

    if (dayjs(visitDateTime).isBefore(dayjs(startDateTime, 'HH:mm'))) {
      throw new BadRequestException(`Tour cannot be scheduled before ${startTime}`);
    }

    if (dayjs(visitDateTime).isAfter(dayjs(endDateTime, 'HH:mm'))) {
      throw new BadRequestException(`Tour cannot be scheduled after ${endTime}`);
    }

    return visitTime;
  }

  async getProjectId(slug: string) {
    const projectId = await this.tourRepository.getProjectId(slug);
    if (!projectId) {
      throw new BadRequestException('Project not found');
    }
    return projectId;
  }

  convertToDateTime(day: { year: number, month: string, date: number }, timeSlot: string) {
    const dateTime = dayjs(`${day.year}-${day.month}-${day.date} ${timeSlot}`, TourConfig.receivedDateTimeFormat);

    if (!dateTime.isValid()) {
      throw new BadRequestException('Invalid Date or Time');
    }

    return dateTime.format(TourConfig.dateTimeFormat);
  }

  async validateVisitType(visitType: { value: string }) {
    if (!visitType || !visitType.value) {
      throw new BadRequestException('Visit Type is required');
    }
    const visitTypes: FieldChoiceInterface[] = await this.getVisitTypes();

    if (!visitTypes.find((type) => type.value === visitType.value)) {
      throw new BadRequestException('Invalid Visit Type');
    }
  }

  async getTour(user: string, tour?: GetTourInterface) {
    let tourCount: { siteVisitCount: number; }[];
    const [tourDetails, visitTypes, visitStatuses, cancellationReasons] = await Promise.all([
      this.tourRepository.getTour(user, { id: tour?.id, page: tour?.page, limit: tour?.limit }),
      this.getVisitTypes(),
      this.tourRepository.getSiteVisitStatuses(),
      this.getCancellationReasons()
    ]);

    if (!tourDetails || !tourDetails.length) {
      return false;
    }
    if (!visitStatuses) {
      throw new BadRequestException('No Visit Statuses Found');
    }

    this.setAllowUpdate(tourDetails);

    if (tour.page || tour.limit) {
      tourCount = await this.tourRepository.getTourCount(
        user,
        { id: tour?.id, page: tour?.page, limit: tour?.limit }
      );
    }

    return {
      id: tour?.id,
      tourDetails,
      visitTypes,
      visitStatuses,
      cancellationReasons,
      tourCount: tourCount?.[0]
    };
  }

  setAllowUpdate(tourDetails: any[]): void {
    if (!tourDetails || !tourDetails.length) {
      return;
    }
    tourDetails.forEach((tour) => {
      const { siteVisit } = tour;

      if (dayjs(siteVisit.visitTime).isBefore(dayjs())) {
        siteVisit.siteVisitStatus.allowUpdate = false;
      }
    });
  }

  async cancelTour(user: string, tour: CancelTourInterface) {
    await Promise.all([
      this.isUpdateAllowed(user, tour),
      this.isCancelRequestValid(tour)
    ]);

    const siteVisitStatusId = await this.getSiteVisitStatusId(TourConfig.customerCancelled);

    await this.tourRepository.updateTour(tour.id, {
      siteVisitStatusId,
      cancellationReason: tour.cancellationReason?.value?.trim(),
      cancellationReasonDetails: tour.cancellationReasonDetails?.trim()
    });

    return {
      message: 'Request successfully cancelled'
    };
  }

  async rescheduleTour(user: string, tour: RescheduleTourInterface) {
    await this.isUpdateAllowed(user, tour);
    await this.validateVisitType(tour.visitType);

    const visitTime = this.validateVisitTime(tour.day, tour.timeSlot);

    const siteVisitStatusId = await this.getSiteVisitStatusId(TourConfig.rescheduleRequested);

    await this.tourRepository.updateTour(tour.id, {
      siteVisitStatusId,
      visitType: tour.visitType.value,
      visitTime
    });

    return {
      message: 'Request successfully sent to agent'
    };
  }

  async isUpdateAllowed(user: string, tour: { id: string }) {
    const tourDetails = await this.tourRepository.getTour(user, { id: tour?.id });

    if (!tourDetails || !tourDetails.length) {
      throw new BadRequestException('No Tour Found');
    }

    this.setAllowUpdate(tourDetails);

    if (!tourDetails[0].siteVisit?.siteVisitStatus
      || !tourDetails[0].siteVisit.siteVisitStatus.allowUpdate) {
      throw new BadRequestException('Cannot update past or completed tours');
    }
  }

  async isCancelRequestValid(tour: CancelTourInterface) {
    if (!tour || !tour.id) {
      throw new BadRequestException('Invalid Request');
    }
    if (!tour.cancellationReason && !tour.cancellationReason?.value) {
      throw new BadRequestException('Cancellation Reason is required');
    }
    if (tour.cancellationReason?.value !== TourConfig.other && tour.cancellationReasonDetails) {
      tour.cancellationReasonDetails = null;
    }
    const cancellationReasons: FieldChoiceInterface[] = await this.getCancellationReasons();
    if (!cancellationReasons.find((reason) => reason.value === tour.cancellationReason?.value)) {
      throw new BadRequestException('Invalid Cancellation Reason');
    }
  }

  async getSiteVisitStatusId(status: string) {
    const siteVisitStatusId = await this.tourRepository.getSiteVisitStatusId(status);
    if (!siteVisitStatusId) {
      throw new BadRequestException('Invalid Site Visit Status');
    }
    return siteVisitStatusId;
  }

  async getVisitTypes(): Promise<FieldChoiceInterface[]> {
    const visitTypes: FieldChoiceInterface[] = await this.tourRepository.getFieldChoices(TourConfig.visitType);

    if (!visitTypes || !visitTypes.length) {
      throw new BadRequestException('No Visit Types Found');
    }

    return visitTypes;
  }

  async getCancellationReasons(): Promise<FieldChoiceInterface[]> {
    const cancellationReasons = await this.tourRepository.getFieldChoices(TourConfig.cancellationReason);

    if (!cancellationReasons) {
      throw new BadRequestException('No Cancellation Reasons Found');
    }

    return cancellationReasons;
  }

  async hasScheduledTour(user: string, project: { slug: string }): Promise<boolean> {
    const scheduledTour = await this.tourRepository.getScheduledTour(user, project.slug);

    return !!scheduledTour;
  }
}
