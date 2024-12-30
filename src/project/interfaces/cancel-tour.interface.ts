export interface CancelTourInterface {
  id: string;
  siteVisitStatus?: {
    value: string;
  };
  cancellationReason?: {
    value: string;
  };
  cancellationReasonDetails?: string;
}
