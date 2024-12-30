import uploadConfig from '../config/upload.config';

export function isAllowedFileFormat(mimetype: string): boolean {
  return uploadConfig.allowedFileTypes.includes(mimetype);
}
