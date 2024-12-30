import {
  Body, Controller, Logger, Post
} from '@nestjs/common';
import { EmiCalculatorService } from '../services/emi-calculator.service';
import { EmiCalculatorDto } from '../dto/emi-calculator.dto';

@Controller('')
export class EmiCalculatorController {
  private readonly logger = new Logger(EmiCalculatorController.name);

  constructor(private readonly emiCalculatorService: EmiCalculatorService) {}

  @Post('emi-calculator')
  async emiCalculator(@Body() request: EmiCalculatorDto) {
    try {
      return await this.emiCalculatorService.emiCalculator(request);
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }
}
