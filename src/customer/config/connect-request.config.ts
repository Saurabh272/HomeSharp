export class ConnectRequestConfig {
  static readonly connectRequestTypes = [
    'callbackRequest',
    'consultationRequest',
    'subscribeRequest',
    'suggestionRequest',
    'discussRequirementRequest',
    'discussRequirementRequestV2'
  ];

  static readonly discussRequirementRequestV2 = 'discussRequirementRequestV2';
}
