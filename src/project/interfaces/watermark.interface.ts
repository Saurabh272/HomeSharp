export interface WatermarkRequest {
  projectId?: string;
  developerId?: string;
}

export interface WatermarkImageData {
  id?: string;
  image?: {
    id?: string;
    filename_download?: string;
  };
  fileName?: string;
}
