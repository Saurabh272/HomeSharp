import { Injectable } from '@nestjs/common';
import { MicroMarketService } from './micro-market.service';
import { MicroMarket } from '../interfaces/micro-market.interface';

@Injectable()
export class MicroMarketImporterService {
  constructor(
    private readonly microMarketService: MicroMarketService
  ) {}

  async import(data: MicroMarket[]) {
    return this.microMarketService.processBulk(data);
  }
}
