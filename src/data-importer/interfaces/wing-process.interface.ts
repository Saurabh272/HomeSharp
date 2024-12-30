export interface WingProcessInterface {
  projectId: string;
  projectDetails: any;
  completiondate: string;
  wings: {
    min: number;
    max: number;
  }
}
