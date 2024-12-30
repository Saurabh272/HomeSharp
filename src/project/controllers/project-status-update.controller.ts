import {
  Body,
  Controller,
  Post
} from '@nestjs/common';
import { ProjectStatusUpdateService } from '../services/project-status-update.service';

@Controller()
export class ProjectStatusUpdateController {
  constructor(private readonly projectStatusUpdateService: ProjectStatusUpdateService) {}

  @Post('/validate-status-update')
  async validateStatusUpdate(@Body() request: { modifiedFields: any, collection: any }) {
    return this.projectStatusUpdateService.validateStatusUpdate(
      request.modifiedFields,
      request.collection
    );
  }
}
