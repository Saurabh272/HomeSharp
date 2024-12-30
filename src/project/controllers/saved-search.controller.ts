import {
  BadRequestException,
  Body,
  Controller, Delete, Get, Param, Post, Put, Req, UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserInterface } from '../../auth/interfaces/user.interface';
import { SavedSearchService } from '../services/saved-search.service';
import { SavedSearchTransformer } from '../transformers/saved-search.transformer';
import { SavedSearchDto } from '../dto/create-saved-search.dto';
import { UpdateSavedSearchDto } from '../dto/update-saved-search.dto';
import {
  GetAllDetailsTransformer, ResponseTransformer, SavedSearchResponse, TransformRequestResult
} from '../interfaces/saved-search.interface';

@Controller('saved-search')
export class SavedSearchController {
  constructor(
    private readonly savedSearchService: SavedSearchService,
    private readonly savedSearchTransformer: SavedSearchTransformer
  ) {}

  @Post()
  @UseGuards(AuthGuard())
  async create(
    @Req() req: { user: UserInterface },
    @Body() request: SavedSearchDto
  ): Promise<SavedSearchResponse | { message: string }> {
    if (!request.filters || (!request.filters.searchString && !request.filters.microMarkets?.length)) {
      throw new BadRequestException('Either a search string or micro markets is required');
    }

    const transformRequest: TransformRequestResult = this.savedSearchTransformer.transformRequest(request);
    const createSavedSearchDetails: SavedSearchResponse = await this.savedSearchService
      .create(req.user.id, transformRequest);

    if (createSavedSearchDetails?.id) {
      const transformedResponse: ResponseTransformer = this.savedSearchTransformer
        .transformedResponse(createSavedSearchDetails);

      transformedResponse.message = 'Search saved successfully';
      return transformedResponse;
    }

    return createSavedSearchDetails;
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  async getById(@Param('id') id: string): Promise<ResponseTransformer> {
    const result = await this.savedSearchService.getById(id);

    return this.savedSearchTransformer.transformedResponse(result);
  }

  @Get()
  @UseGuards(AuthGuard())
  async getAll(@Req() req: { user: UserInterface }): Promise<GetAllDetailsTransformer> {
    const savedSearchDetails = await this.savedSearchService.getAll(req.user.id);

    return this.savedSearchTransformer.getAllDetails(savedSearchDetails);
  }

  @Put(':id')
  @UseGuards(AuthGuard())
  async update(
    @Req() req: { user: UserInterface },
    @Param('id') id: string,
    @Body() request: UpdateSavedSearchDto
  ): Promise<{ message: string } | ResponseTransformer> {
    const transformRequest: TransformRequestResult = this.savedSearchTransformer.transformRequest(request);
    const result: ResponseTransformer = await this.savedSearchService.update(req.user.id, id, transformRequest);
    if (result?.id) {
      return {
        message: 'Search saved successfully'
      };
    }

    return result;
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    try {
      await this.savedSearchService.delete(id);

      return {
        message: 'Deleted saved search successfully'
      };
    } catch (error) {
      return error?.response;
    }
  }
}
