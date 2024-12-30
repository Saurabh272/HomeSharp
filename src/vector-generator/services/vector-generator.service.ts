import { Injectable, Logger } from '@nestjs/common';
import { VectorGeneratorRepository } from '../repositories/vector-generator.repository';
import { ProjectListingRepository } from '../../project/repositories/project-listing.repository';

@Injectable()
export class VectorGeneratorService {
  private readonly logger = new Logger(VectorGeneratorService.name);

  constructor(
    private readonly vectorGeneratorRepository: VectorGeneratorRepository,
    private readonly projectListingRepository: ProjectListingRepository
  ) {}

  async generateVector() {
    const [projectStatistics, configurationStatistics] = await this.getStatistics();
    this.logger.log('Truncating and inserting constant data...');
    await this.truncateAndInsertConstantData();
    await this.calculateAndInsertFeatureVector(projectStatistics[0], configurationStatistics[0]);
    return {
      message: 'Vector generated successfully'
    };
  }

  async getStatistics() {
    return Promise.all([
      this.vectorGeneratorRepository.getProjectStatistics(),
      this.vectorGeneratorRepository.getConfigurationsStatistics()
    ]);
  }

  async truncateAndInsertConstantData() {
    await this.vectorGeneratorRepository.truncateProjectVectors();
    const projectDetails = await this.vectorGeneratorRepository.getProjectDetails();
    await this.vectorGeneratorRepository.insertConstantData(projectDetails);
  }

  async calculateAndInsertFeatureVector(projectStatistics: any, configurationStatistics: any) {
    const statistics = { ...projectStatistics, ...configurationStatistics };
    this.logger.log('Calculating and inserting feature vector...');
    await this.vectorGeneratorRepository.updateFeatureVector(statistics);
  }

  // TODO: Handle case when Project/Configuration is not found
  async getSimilarProjects(request: { configurationId?: string, projectSlug?: string }) {
    if (request.configurationId) {
      return this.getSimilarProjectsBasedOnConfigurationId(request.configurationId);
    }
    if (request.projectSlug) {
      return this.getSimilarProjectsBasedOnProjectSlug(request.projectSlug);
    }
  }

  async getSimilarProjectsBasedOnConfigurationId(configurationId: string) {
    const projects = await this.projectListingRepository.getProjectIdWithConfigurationId(configurationId);
    const similarProjects = await this.vectorGeneratorRepository.getSimilarProjects(
      configurationId,
      projects[0]?.projectId
    );

    if (!similarProjects?.length) {
      return [];
    }
    const uniqueIdsSet = new Set();

    similarProjects.forEach((project) => {
      uniqueIdsSet.add(project.projectId);
    });

    return Array.from(uniqueIdsSet);
  }

  async getSimilarProjectsBasedOnProjectSlug(projectSlug: string) {
    const configurations: {
      configurationId?: string;
    }[] = await this.vectorGeneratorRepository.getConfigurationIdsByProjectSlug(projectSlug);

    const promises = configurations.map(
      (configuration) => this.getSimilarProjectsBasedOnConfigurationId(configuration.configurationId)
    );
    const similarProjects = await Promise.all(promises);

    return this.findTopUniqueProjects(similarProjects);
  }

  findTopUniqueProjects(lists: any[][]) {
    const seenProjects = new Set();
    const result = [];

    if (!lists?.length) {
      this.logger.log('No Similar Projects Found');
      return result;
    }

    for (let i = 0; i < lists[0].length; i += 1) {
      lists.forEach((subList) => {
        if (subList[i] && !seenProjects.has(subList[i]) && result.length < 10) {
          seenProjects.add(subList[i]);
          result.push(subList[i]);
        }
      });
    }

    return result;
  }
}
