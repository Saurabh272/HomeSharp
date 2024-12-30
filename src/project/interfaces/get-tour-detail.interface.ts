export interface GetTourDetailInterface {
  siteVisit: {
    id: string;
    visitId: number;
    visitType: string;
    visitTime: string;
    cancellationReason: string;
    cancellationReasonDetails: string;
    siteVisitStatus: {
      id: number;
      label: string;
      value: string;
      allowUpdate: boolean;
      showToCustomer: boolean;
    };
    dateCreated: string;
  };
  rm?: {
    name: string;
    email: string;
    phoneNumber: string;
  };
  project: {
    name: string;
    slug: string;
    description: string;
    propertyPicture: string;
    locality: string;
    lat: number;
    lng: number;
    images: string;
  };
}
