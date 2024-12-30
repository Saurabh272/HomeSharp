import config from './index';

const limitOnDev = 100;

const createSettings = (limit: number) => ({ ttl: 60000, limit: config.isProd ? limit : limitOnDev });

export const throttlerConfig = {
  sendOtp: createSettings(5),
  resendOtp: createSettings(5),
  verifyOtp: createSettings(5),
  refreshToken: createSettings(5),
  profile: createSettings(10),
  uploadPhoto: createSettings(5)
};
