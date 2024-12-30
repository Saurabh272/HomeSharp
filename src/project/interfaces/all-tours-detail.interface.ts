import { FieldChoiceInterface } from './field-choice.interface';

export interface AllToursDetailInterface {
  allToursDetails: {
    tourDetails: Array<any>;
    visitTypes: Array<FieldChoiceInterface>;
    cancellationReasons: Array<FieldChoiceInterface>;
    tourCount: {
      siteVisitCount: number;
    };
  };
  pageDetails: {
    page: number;
    limit: number;
  }
}
