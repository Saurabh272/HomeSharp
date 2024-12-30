export class ProjectConfig {
  static readonly houseType = 'Beds';

  static readonly areaUnit = 'sq. ft.';

  static readonly watermarkBatchSize = 100;

  static readonly maxFileSizeBytes: number = 10 * 1024 * 1024; // 10 MB

  static readonly resalePropertyType = 'RESALE';

  static readonly resaleLaunchStatus = 'Resale';

  static readonly whatsappType = {
    projectDetails: 'project-details'
  };
}
