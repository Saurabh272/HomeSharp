export interface OtpDetailInterface {
  id: string;
  dateUpdated: any;
  otp: string;
  otpExpiresAt: Date;
  otpAttempts: number;
  resendAttempts: number
}
