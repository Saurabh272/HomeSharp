export class TourConfig {
  static readonly customerCancelled = 'CUSTOMER_CANCELLED';

  static readonly cancellationReason = 'cancellation_reason';

  static readonly rescheduleRequested = 'RESCHEDULE_REQUESTED';

  static readonly receivedDateTimeFormat = 'YYYY-MM-DD HH:mm';

  static readonly dateTimeFormat = 'YYYY-MM-DD HH:mm:ss.SSS';

  static readonly other = 'OTHER';

  static readonly siteVisits = 'site_visits';

  static readonly visitType = 'visit_type';

  static readonly validMonths = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
}
