import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CustomerRepository } from '../../customer/repositories/customer.repository';
import { CustomerAttemptsRepository } from '../../customer/repositories/customer-attempts.repository';
import { Validators } from '../../app/validators';
import { CustomerEntity } from '../../customer/entities/customer.entity';
import { CustomerAttemptsEntity } from '../../customer/entities/customer-attempts.entity';

export abstract class BaseService {
  protected readonly logger = new Logger(BaseService.name);

  protected constructor(
    protected readonly customerEntity: CustomerEntity,
    protected readonly customerAttemptsEntity: CustomerAttemptsEntity,
    protected readonly customerRepository: CustomerRepository,
    protected readonly customerAttemptsRepository: CustomerAttemptsRepository,
    protected readonly validators: Validators,
    protected readonly jwtService: JwtService,
    protected readonly eventEmitter: EventEmitter2
  ) {}
}
