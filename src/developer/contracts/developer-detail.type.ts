import { Project } from '../../project/types/project-listing.type';

type Image = {
  url: string;
  alt: string;
};

export type Developer = {
  name: string,
  slug: string,
  foundedYear: string,
  reraCertified: boolean,
  summary: string,
  description: string,
  image: Image,
  developerType: string,
  projects: Array<Project>
};
