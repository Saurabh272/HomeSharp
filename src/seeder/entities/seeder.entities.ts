import { Injectable } from '@nestjs/common';

@Injectable()
export class SeederEntity {
  public readonly relationshipManagers: string = 'relationship_managers';

  public readonly microMarkets: string = 'micro_markets';

  public readonly customers: string = 'customers';

  public readonly feedback: string = 'feedback';

  public readonly supportRequest: string = 'support_request';

  public readonly customerAttempts: string = 'customer_attempts';

  public readonly inquiries: string = 'inquiries';

  public readonly seoProperties: string = 'seo_properties';

  public readonly addresses: string = 'addresses';

  public readonly contactDetails: string = 'Contact_Details';

  public readonly developers: string = 'Developers';

  public readonly developersFolder: string = 'developers';

  public readonly primaryArea: string = 'primary_area';

  public readonly featuresCategories: string = 'features_categories';

  public readonly features: string = 'features';

  public readonly reraStage: string = 'rera_stage';

  public readonly categories: string = 'Categories';

  public readonly categoriesFile: string = 'categories';

  public readonly projects: string = 'Projects';

  public readonly projectsCategories: string = 'Projects_Categories';

  public readonly projectFolder: string = 'projects';

  public readonly projectId: string = 'Projects_id';

  public readonly projectsFiles: string = 'Projects_files_2';

  public readonly projectsFeatures: string = 'Projects_features';

  public readonly featuresId: string = 'features_id';

  public readonly wings: string = 'wings';

  public readonly wingsId: string = 'Wings';

  public readonly configurations: string = 'configurations';

  public readonly wingsConfigurations: string = 'wings_configurations';

  public readonly categoriesId: string = 'Categories_id';

  public readonly primaryAreaId: string = 'primary_area_id';

  public readonly wishlist: string = 'wishlist';

  public readonly wishlistId: string = 'wishlist_id';

  public readonly wishlistProjectId: string = 'project_id';

  public readonly wishlistProjects: string = 'wishlist_projects';

  public readonly projectsPrimaryArea: string = 'Projects_primary_area';

  public readonly directusFilesId: string = 'directus_files_id';

  public readonly images: string = 'images';

  public readonly folders: string = 'folders';

  public readonly files: string = 'files';
}
