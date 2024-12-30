import {
  BadRequestException,
  Body,
  Controller,
  Patch,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TourService } from '../services/tour.service';
import { CancelTourDto } from '../dto/cancel-tour.dto';
import { CreateTourDto } from '../dto/create-tour.dto';
import { GetTourDto } from '../dto/get-tour.dto';
import { GetToursDto } from '../dto/get-tours.dto';
import { RescheduleTourDto } from '../dto/reschedule-tour.dto';
import { SlugDto } from '../dto/slug.dto';
import { AllToursDetailTransformer } from '../transformers/all-tours-detail.transformer';
import { CreateTourTransformer } from '../transformers/create-tour.transformer';
import { RequestTourTransformer } from '../transformers/request-tour.transformer';
import { TourDetailTransformer } from '../transformers/tour-detail.transformer';
import { AllToursDetails } from '../types/all-tours-detail.type';
import { CreateTour } from '../types/create-tour.type';
import { InitialTour } from '../types/initial-tour.type';
import { UserInterface } from '../../auth/interfaces/user.interface';

@Controller()
export class TourController {
  constructor(
    private readonly allToursDetailTransformer: AllToursDetailTransformer,
    private readonly createTourTransformer: CreateTourTransformer,
    public readonly requestTourTransformer: RequestTourTransformer,
    public readonly tourDetailTransformer: TourDetailTransformer,
    private readonly tourService: TourService
  ) {}

  @Post('/get-tour-availability')
  async requestTour(@Body() project: SlugDto) {
    const requestTour = await this.tourService.requestTour(project);
    const transformedTour: InitialTour = this.requestTourTransformer.process(requestTour);
    return transformedTour;
  }

  @Post('/get-tours')
  @UseGuards(AuthGuard())
  async getTours(@Req() req: { user: UserInterface }, @Body() pageDetails: GetToursDto) {
    const allToursDetails = await this.tourService.getTour(req.user.id, pageDetails);

    if (!allToursDetails) {
      return {
        message: 'No Tour Found'
      };
    }
    const transformedTour: AllToursDetails = this.allToursDetailTransformer.process({ allToursDetails, pageDetails });
    return transformedTour;
  }

  @Post('/get-tour-details')
  @UseGuards(AuthGuard())
  async getTour(@Req() req: { user: UserInterface }, @Body() tour: GetTourDto) {
    const tourDetails = await this.tourService.getTour(req.user.id, tour);
    if (!tourDetails) {
      throw new BadRequestException('No details found for this request id');
    }

    return this.tourDetailTransformer.process(tourDetails);
  }

  @Patch('/cancel-tour')
  @UseGuards(AuthGuard())
  async cancelTour(@Req() req: { user: UserInterface }, @Body() tour: CancelTourDto) {
    return this.tourService.cancelTour(req.user.id, tour);
  }

  @Patch('/reschedule-tour')
  @UseGuards(AuthGuard())
  async rescheduleTour(@Req() req: { user: UserInterface }, @Body() tour: RescheduleTourDto) {
    return this.tourService.rescheduleTour(req.user.id, tour);
  }

  @Post('/create-tour')
  @UseGuards(AuthGuard())
  async createTour(@Req() req: { user: UserInterface }, @Body() tour: CreateTourDto) {
    const [tourDetails, visitTypes] = await this.tourService.createTour(req.user.id, tour);
    const transformedTour: CreateTour = this.createTourTransformer.process({ tourDetails, visitTypes });
    return transformedTour;
  }
}
