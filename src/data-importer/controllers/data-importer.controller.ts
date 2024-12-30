import {
  BadRequestException,
  Body,
  Headers,
  Controller,
  Logger,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ExcelReaderService } from '../services/excel-reader.service';
import { ProjectImporterService } from '../services/project-importer.service';
import { MicroMarketImporterService } from '../services/micro-market-importer.service';
import { DataImportPayload } from '../dto/data-import-payload.dto';
import { FilesImportPayload } from '../dto/files-import-payload.dto';
import { CompleteDataImporterService } from '../services/complete-data-importer.service';
import { ProjectDetailService } from '../../project/services/project-detail.service';
import { ProjectIndexDetailTransformer } from '../../project/transformers/project-index-detail.transformer';
import { DirectusAuth } from '../../app/utils/directus.util';

@Controller('/import')
export class DataImporterController {
  private readonly logger = new Logger(DataImporterController.name);

  constructor(
    private readonly completeDataImporterService: CompleteDataImporterService,
    private readonly excelReaderService: ExcelReaderService,
    private readonly microMarketImporterService: MicroMarketImporterService,
    private readonly projectImporterService: ProjectImporterService,
    private readonly projectDetailService: ProjectDetailService,
    private readonly projectIndexDetailTransformer: ProjectIndexDetailTransformer,
    private readonly directusAuth: DirectusAuth
  ) { }

  @Post('/projects')
  @UseInterceptors(FileInterceptor('file'))
  async importProjects(
  @UploadedFile() file: Express.Multer.File, // TODO: Fix eslint rules to detect this formatting issue
  @Body() data: DataImportPayload,
  @Headers('authorization') authHeader: string
  ) {
    await this.directusAuth.checkAdminFunctionsPermission(authHeader);

    if (!file) {
      throw new BadRequestException('Project file is required');
    }
    const excelData = await this.excelReaderService.processExcelData(file, data);

    return this.projectImporterService.import(excelData);
  }

  @Post('/micro-markets')
  @UseInterceptors(FileInterceptor('file'))
  async importMicroMarkets(
  @UploadedFile() file: Express.Multer.File,
  @Body() data: DataImportPayload,
  @Headers('authorization') authHeader: string
  ) {
    await this.directusAuth.checkAdminFunctionsPermission(authHeader);

    if (!file) {
      throw new BadRequestException('Micro Market file is required');
    }
    const excelData = await this.excelReaderService.processExcelData(file, data);

    return this.microMarketImporterService.import(excelData);
  }

  @Post('/complete-data')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'projectFile', maxCount: 1 },
    { name: 'microMarketFile', maxCount: 1 }
  ]))
  async importProjectsAndMicroMarkets(
  @UploadedFiles() files: FilesImportPayload,
  @Body()data: DataImportPayload,
  @Headers('authorization') authHeader: string
  ) {
    await this.directusAuth.checkAdminFunctionsPermission(authHeader);

    const { projectFile, microMarketFile } = files;

    if ((!projectFile || !projectFile.length) && (!microMarketFile || !microMarketFile.length)) {
      throw new BadRequestException('At least one file (Project or Micro Market) is required');
    }

    const projectExcelData = await this.excelReaderService.processExcelData(
      projectFile ? projectFile[0] : null,
      data
    );
    const microMarketExcelData = await this.excelReaderService.processExcelData(
      microMarketFile ? microMarketFile[0] : null,
      data
    );
    let microMarketMessage: { message: string };
    let projectResult: { message: string, projectIds: string[] };

    const mergedData = this.completeDataImporterService.mergeData(projectExcelData, microMarketExcelData);
    this.logger.log(`Merged Data: ${JSON.stringify(mergedData)}`);
    if (microMarketExcelData && microMarketExcelData.length) {
      microMarketMessage = await this.microMarketImporterService.import(microMarketExcelData);
    }
    if (mergedData && mergedData.length) {
      projectResult = await this.projectImporterService.import(mergedData);
    }
    // TODO: Remove the indexing code from the project importer service
    try {
      if (projectResult?.projectIds?.length) {
        const promises = [];
        projectResult?.projectIds.map(async (id) => {
          const result = await this.projectDetailService.getProjectForIndexing({ projectId: id });
          if (Array.isArray(result)) {
            const [projectForIndexing, projectStatuses] = result;

            if (Array.isArray(projectForIndexing) && projectForIndexing.length) {
              const transformedProject = this.projectIndexDetailTransformer.process(
                { projectForIndexing, projectStatuses }
              );

              promises.push(this.projectDetailService.sendProjectToIndexing(transformedProject));
            }
          }

          return null;
        });

        await Promise.allSettled(promises);
      }
    } catch (err) {
      this.logger.error(`ERROR | WHILE INDEXING | message: ${err?.message}`, err);
    }

    return {
      message: `${microMarketMessage?.message || ''} ${projectResult?.message || ''}`
    };
  }
}
