import { Injectable } from '@nestjs/common';
import { ReindexingRepository } from '../repositories/reindexing.repository';

@Injectable()
export class ReindexingService {
  constructor(
    private readonly reindexingRepository: ReindexingRepository
  ) { }

  async getAllErroredIndices() {
    return this.reindexingRepository.findAllErroredIndices();
  }

  async update(ids: any, updateParams: any) {
    return this.reindexingRepository.update(ids, updateParams);
  }

  async resolver(data: any, promise: any) {
    const promiseResult = await promise;
    const retryCount = data.retry_count + 1;

    await this.update([data?.id], { retry_count: retryCount });

    return new Promise((resolve) => {
      resolve({ id: data?.id, ...promiseResult });
    });
  }
}
