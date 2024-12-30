export class eventTrackerConfig {
  static readonly googleAnalytics = 'Google Analytics';

  static readonly cleverTap = 'Clever Tap';

  static readonly eventType = 'event';

  static get combinedEventTypes(): string {
    return `${eventTrackerConfig.googleAnalytics} and ${eventTrackerConfig.cleverTap}`;
  }

  static readonly actionSource = 'website';
}
