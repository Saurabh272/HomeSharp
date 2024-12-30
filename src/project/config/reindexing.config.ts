export class IndexingConfig {
  static readonly completed = 'COMPLETED';

  static readonly error = 'ERROR';

  static readonly developer = 'DEVELOPER';

  static readonly project = 'PROJECT';

  static readonly microMarket = 'MICROMARKET';

  static readonly maxRetryCount: number = 3;

  static readonly concurrencyLimit: number = 5;
}
