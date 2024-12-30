import { Injectable, Logger } from '@nestjs/common';
import { CustomerAttemptsRepository } from '../repositories/customer-attempts.repository';
import { CustomerAttemptsEntity } from '../entities/customer-attempts.entity';

@Injectable()
export class CustomerAttemptsService {
  protected readonly logger = new Logger(CustomerAttemptsService.name);

  constructor(
    private readonly customerAttemptsRepository: CustomerAttemptsRepository,
    private readonly customerAttemptsEntity: CustomerAttemptsEntity
  ) {}

  public async resetAllAttempts(id: string) {
    await this.customerAttemptsRepository.updateById(
      id,
      {
        otp: null,
        otpAttempts: 0,
        resendAttempts: 0
      }
    );

    return true;
  }
}
