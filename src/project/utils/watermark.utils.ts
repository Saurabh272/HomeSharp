import * as path from 'path';
import config from '../../app/config';

const baseDir = config.APP_ENV === 'development' ? '../../../../src/project/' : '../';

const watermarkImageFile: string = path.join(__dirname, baseDir, 'assets/images/watermark.png');

export {
  watermarkImageFile
};
