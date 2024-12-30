import { Injectable } from '@nestjs/common';
import { ITransformer } from '../../app/interfaces/transformer.interface';
import config from '../../app/config';
import { Developer } from '../contracts/developer-detail.type';
import { Project } from '../../project/types/project-listing.type';
import { DeveloperDetailInterface } from '../interfaces/developer-detail.interface';

@Injectable()
export class DeveloperDetailTransformer implements ITransformer {
  process(data: DeveloperDetailInterface, projects?: Array<Project>) {
    const developer: Developer = {
      name: data.name,
      slug: data.slug,
      developerType: data?.developerType,
      foundedYear: data.foundedYear,
      reraCertified: data.reraCertified,
      summary: data.summary,
      description: data.description,
      image: this.getFileUrl(data.logo),
      projects: this.modifyProjects(projects) || []
    };
    return developer;
  }

  modifyProjects(projects: Array<Project>) {
    if (!projects || projects.length === 0) {
      return [];
    }
    return projects.map((project) => {
      delete project.featured;
      delete project.mostSearched;
      delete project.newlyLaunched;
      return project;
    });
  }

  // TODO: This method is duplicated in multiple transformers (project-detail.transformer.ts)
  getFileUrl(image: string) {
    if (image?.length) {
      // TODO: Store ":" in a constant and use that here and other places where we are splitting the project images
      const fileName = image.split(':')[0];
      const alt = image.split(':')[1] || '';
      if (fileName?.length) {
        return {
          url: `${config.DIRECTUS_URL}/assets/${fileName}`,
          alt
        };
      }
    }
    return {
      url: '',
      alt: ''
    };
  }
}
