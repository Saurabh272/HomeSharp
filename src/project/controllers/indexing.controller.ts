import {
  Body,
  Controller,
  Get,
  Headers,
  Post
} from '@nestjs/common';
import { GetProjectDto } from '../dto/get-project.dto';
import { ProjectDetailService } from '../services/project-detail.service';
import { ProjectIndexDetailTransformer } from '../transformers/project-index-detail.transformer';
import { DeveloperIndexDetailTransformer } from '../transformers/developer-index-detail.transformer';
import { MicroMarketIndexDetailTransformer } from '../transformers/micro-market-index-detail.transformer';
import { WatermarkService } from '../services/watermark.service';
import { ReindexingService } from '../services/reindexing.service';
import { IndexingConfig } from '../config/reindexing.config';
import { WatermarkResponse } from '../types/watermark.type';
import { WatermarkRequestDto } from '../dto/watermark.dto';
import { DirectusAuth } from '../../app/utils/directus.util';

@Controller()
export class IndexingController {
  constructor(
    private readonly projectDetailService: ProjectDetailService,
    private readonly projectIndexDetailTransformer: ProjectIndexDetailTransformer,
    private readonly developerIndexDetailTransformer: DeveloperIndexDetailTransformer,
    private readonly microMarketIndexDetailTransformer: MicroMarketIndexDetailTransformer,
    private readonly reindexingService: ReindexingService,
    private readonly watermarkService: WatermarkService,
    private readonly directusAuth: DirectusAuth
  ) { }

  @Post('/index-project')
  async indexProject(@Body() request: GetProjectDto, @Headers('authorization') authHeader: string) {
    await this.directusAuth.checkAdminFunctionsPermission(authHeader);
    const result = await this.projectDetailService.getProjectForIndexing(request);
    if (Array.isArray(result)) {
      const [projectForIndexing, projectStatuses] = result;

      if (Array.isArray(projectForIndexing) && projectForIndexing.length) {
        const indexResult:
        { indexProject: any, indexMicroMarket: any } = { indexProject: null, indexMicroMarket: null };
        const transformedProject = this.projectIndexDetailTransformer.process(
          { projectForIndexing, projectStatuses }
        );

        indexResult.indexProject = await this.projectDetailService.sendProjectToIndexing(transformedProject);
        indexResult.indexMicroMarket = await this.indexMicroMarket({
          microMarketId: projectForIndexing[0].microMarketId
        }, authHeader);

        return indexResult;
      }
      return {
        message: 'Project details not found for provided id'
      };
    }

    return result;
  }

  @Post('/index-developer')
  async indexDeveloper(@Body() request: { developerId: string }, @Headers('authorization') authHeader: string) {
    await this.directusAuth.checkAdminFunctionsPermission(authHeader);
    const developer = await this.projectDetailService.getDeveloperForIndexing(request.developerId);
    if (Array.isArray(developer)) {
      if (developer.length) {
        const transformedDeveloper = this.developerIndexDetailTransformer.process(developer[0]);

        return this.projectDetailService.sendDeveloperToIndexing(transformedDeveloper);
      }

      return {
        message: 'Developer details not found for provided id'
      };
    }

    return developer;
  }

  @Post('/index-micro-market')
  async indexMicroMarket(@Body() request: { microMarketId: string }, @Headers('authorization') authHeader: string) {
    await this.directusAuth.checkAdminFunctionsPermission(authHeader);
    const microMarket = await this.projectDetailService.getMicroMarketForIndexing(request.microMarketId);
    if (Array.isArray(microMarket)) {
      if (microMarket.length) {
        const transformedMicroMarket = this.microMarketIndexDetailTransformer.process(microMarket[0]);

        return this.projectDetailService.sendMicroMarketToIndexing(transformedMicroMarket);
      }

      return {
        message: 'Micro Market details not found for provided id'
      };
    }

    return microMarket;
  }

  @Post('/index-multiple-projects')
  async indexMultipleProjects(
    @Body() request: { projectIds?: string[] },
    @Headers('authorization') authHeader: string
  ) {
    await this.directusAuth.checkAdminFunctionsPermission(authHeader);
    const projects = request.projectIds || await this.projectDetailService.getAllProjectIds();
    const promises = [];
    projects?.map(async (projectId) => {
      promises.push(this.indexProject({ projectId }, authHeader));
    });
    await Promise.all(promises);
    return {
      message: 'Projects indexing triggered'
    };
  }

  @Post('/index-multiple-micro-markets')
  async indexMultipleMicroMarkets(
    @Body() request: { microMarketIds?: string[] },
    @Headers('authorization') authHeader: string
  ) {
    await this.directusAuth.checkAdminFunctionsPermission(authHeader);
    const microMarkets = request.microMarketIds || await this.projectDetailService.getAllMicroMarketIds();
    const promises = [];
    microMarkets?.map(async (microMarketId: string) => {
      promises.push(this.indexMicroMarket({ microMarketId }, authHeader));
    });
    await Promise.all(promises);
    return {
      message: 'Micro Markets indexing triggered'
    };
  }

  @Post('/index-multiple-developers')
  async indexMultipleDevelopers(
    @Body() request: { developerIds?: string[] },
    @Headers('authorization') authHeader: string
  ) {
    await this.directusAuth.checkAdminFunctionsPermission(authHeader);
    const developers = request.developerIds || await this.projectDetailService.getAllDeveloperIds();
    const promises = [];
    developers?.map(async (developerId) => {
      promises.push(this.indexDeveloper({ developerId }, authHeader));
    });
    await Promise.all(promises);
    return {
      message: 'Developers indexing triggered'
    };
  }

  @Post('/apply-watermark')
  async update(
    @Body() request: WatermarkRequestDto,
    @Headers('authorization') authHeader: string
  ): Promise<any> {
    await this.directusAuth.checkAdminFunctionsPermission(authHeader);
    return this.watermarkService.applyWatermark(request);
  }

  @Post('/retry-failed-watermark')
  async failedWatermarks(@Headers('authorization') authHeader: string): Promise<WatermarkResponse> {
    await this.directusAuth.checkAdminFunctionsPermission(authHeader);
    return this.watermarkService.processFailedWatermarks();
  }

  @Post('/pending-watermark')
  async pendingImagesForWatermark(@Headers('authorization') authHeader: string): Promise<any> {
    await this.directusAuth.checkAdminFunctionsPermission(authHeader);
    const imageIds: string[] = await this.watermarkService.pendingWatermarkIds();
    const request: WatermarkRequestDto = { imageIds };
    return this.watermarkService.applyWatermark(request);
  }

  @Get('/reindex-errored-projects')
  async reindexErroredProjects(@Headers('authorization') authHeader: string) {
    await this.directusAuth.checkAdminFunctionsPermission(authHeader);
    const erroredIndices = await this.reindexingService.getAllErroredIndices();

    const promises = [];
    erroredIndices?.forEach((data: { indexing_type: string, indexing_id: string }) => {
      switch (data.indexing_type) {
        case IndexingConfig.developer:
          promises.push(this.reindexingService.resolver(data, this.indexDeveloper({
            developerId: data?.indexing_id
          }, authHeader)));
          break;
        case IndexingConfig.microMarket:
          promises.push(this.reindexingService.resolver(data, this.indexMicroMarket({
            microMarketId: data?.indexing_id
          }, authHeader)));
          break;
        case IndexingConfig.project:
          promises.push(this.reindexingService.resolver(
            data,
            this.indexProject({ projectId: data?.indexing_id }, authHeader)
          ));
          break;
        default:
          break;
      }
    });

    const result = await Promise.all(promises);
    const ids = [];

    result?.forEach((indexedData) => {
      if (indexedData && indexedData?.success) {
        ids.push(indexedData?.id);
      }
    });

    await this.reindexingService.update(ids, { status: IndexingConfig.completed });

    return result;
  }

  @Post('/indexing-cleanup')
  async indexingCleanUp(
    @Body() request: { recreateCollections: boolean },
    @Headers('authorization') authHeader: string
  ) {
    await this.directusAuth.checkAdminFunctionsPermission(authHeader);

    let collectionResult: { message: string; success: boolean; };

    const indexingResult: {
      indexProjects: any,
      indexDevelopers: any,
      indexMicroMarkets: any
    } = {
      indexProjects: null,
      indexDevelopers: null,
      indexMicroMarkets: null
    };

    if (request?.recreateCollections) {
      collectionResult = await this.projectDetailService.recreateAllCollections();
    } else {
      collectionResult = await this.projectDetailService.deleteAllIndices();
    }

    indexingResult.indexMicroMarkets = await this.indexMultipleMicroMarkets({}, authHeader);
    indexingResult.indexProjects = await this.indexMultipleProjects({}, authHeader);
    indexingResult.indexDevelopers = await this.indexMultipleDevelopers({}, authHeader);

    return {
      collectionResult,
      indexingResult
    };
  }
}
