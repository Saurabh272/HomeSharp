import { Injectable } from '@nestjs/common';
import { DeveloperRepository } from '../repository/developer.repository';

@Injectable()
export class DeveloperDetailService {
  constructor(private readonly developerRepository: DeveloperRepository) {}

  async getDeveloperDetail(slug: string) {
    return this.developerRepository.getDeveloperDetail(slug);
  }
}
