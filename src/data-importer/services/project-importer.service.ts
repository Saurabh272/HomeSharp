import { Injectable, Logger } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { ProjectService } from './project.service';
import { WingService } from './wing.service';
import { DataImporterUtil } from '../utils/data-importer.util';
import { Project } from '../interfaces/project.interface';

@Injectable()
export class ProjectImporterService {
  private readonly logger = new Logger(ProjectImporterService.name);

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly dataImporterUtil: DataImporterUtil,
    private readonly projectService: ProjectService,
    private readonly wingService: WingService
  ) {
  }

  async import(projectsExcelData: Project[]) {
    this.logger.log('Importing Projects...');
    await this.dataImporterUtil.checkAndAddMasterData();

    const validProjects = projectsExcelData.filter(
      (project) => project.projectname != null
    );

    this.logger.log(`Valid Projects: ${JSON.stringify(validProjects)}`);

    const newProjects = await this.getNewProjects(validProjects);
    this.logger.log(`New Projects: ${JSON.stringify(newProjects)}`);

    if (!newProjects.length) {
      this.logger.log('No new projects to import.');

      return {
        message: 'No new projects to import.',
        projectIds: []
      };
    }

    const importPromises = newProjects.map(async (project) => {
      // TODO: Add Region for Micro Market

      this.logger.log('\n\n\nProcessing Project...');

      const { projectId, projectDetails } = await this.projectService.process(project);

      const { completiondate, wings } = project;

      const wingIds = await this.wingService.process({
        projectId, projectDetails, completiondate, wings
      });

      const configurationIds = await this.configurationService.process(projectDetails, project);

      await this.configurationService.processWingConfiguration(wingIds, configurationIds);

      return projectId;
    });

    const projectIds = await Promise.all(importPromises);

    return {
      message: 'Projects Imported Successfully',
      projectIds
    };
  }

  async getNewProjects(projectDetails: Project[]) {
    let newProjectsDetails = await this.getNewProjectsBasedOnName(projectDetails);
    if (newProjectsDetails[0]?.geolocation) {
      newProjectsDetails = await this.getNewProjectsBasedOnLocation(newProjectsDetails);
    }
    return newProjectsDetails;
  }

  async getNewProjectsBasedOnName(projectDetails: Project[]) {
    const projectNames = projectDetails.map((project) => project.projectname);
    const existingProjects: { Name: string }[] = await this.projectService.getProjectsByName(projectNames);

    const existingProjectNames = existingProjects.map((project) => project.Name);
    return projectDetails.filter((project) => !existingProjectNames.includes(project.projectname));
  }

  async getNewProjectsBasedOnLocation(projectDetails: Project[]) {
    this.logger.log('Getting New Projects Based On Location...');
    const uniqueGeolocations = new Set<string>();

    const uniqueProjects = projectDetails.filter((project) => {
      if (!uniqueGeolocations.has(project.geolocation)) {
        uniqueGeolocations.add(project.geolocation);
        return project;
      }
      return false;
    });
    this.logger.log(`Unique Projects: ${JSON.stringify(uniqueProjects)}`);

    const existingProjectsLocations: string[] = await this.projectService
      .getProjectsByLocation([...uniqueGeolocations]);

    this.logger.log(`Existing Project Locations: ${JSON.stringify(existingProjectsLocations)}`);

    return uniqueProjects.filter((project) => !existingProjectsLocations.includes(project.geolocation));
  }
}
