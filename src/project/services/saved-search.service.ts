import { BadRequestException, Injectable } from '@nestjs/common';
import { SavedSearchRepository } from '../repositories/saved-search.repository';
import { SavedSearchDto } from '../dto/create-saved-search.dto';
import { SavedSearchResponse, GetAllDetails, GetByIdDetails } from '../interfaces/saved-search.interface';
import { UpdateSavedSearchDto } from '../dto/update-saved-search.dto';

@Injectable()
export class SavedSearchService {
  constructor(
    private readonly savedSearchRepository: SavedSearchRepository
  ) {}

  async create(customerId: string, request: SavedSearchDto): Promise<SavedSearchResponse> {
    const isNameExist = await this.savedSearchRepository.getName(customerId, request?.name);
    if (isNameExist) {
      throw new BadRequestException('Saved search name already exists');
    }

    return this.savedSearchRepository.create(customerId, request);
  }

  async getAll(customerId: string): Promise<GetAllDetails[]> {
    return this.savedSearchRepository.getAll(customerId);
  }

  async getById(id: string): Promise<GetByIdDetails> {
    return this.savedSearchRepository.getById(id);
  }

  async update(customerId: string, id: string, request: UpdateSavedSearchDto): Promise<any> {
    if (request?.name) {
      const isNameExist = await this.savedSearchRepository.getName(customerId, request?.name);
      if (isNameExist) {
        throw new BadRequestException('Saved search name already exists');
      }
    }

    return this.savedSearchRepository.update(id, request);
  }

  async delete(id: string): Promise<void> {
    return this.savedSearchRepository.deleteById(id);
  }
}
