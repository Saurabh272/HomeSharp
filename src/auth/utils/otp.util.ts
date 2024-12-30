import * as dayjs from 'dayjs';
import config from '../../app/config';

export function generateOtp(): string {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

export function isLockedInTime(dateUpdated: string) {
  return dayjs(dateUpdated)
    .add(config.RESEND_OTP_BLOCK_TIME, 'minutes')
    .isAfter(dayjs());
}

export function getOtpExpiryDate() {
  return dayjs()
    .add(config.OTP_EXPIRES_IN, 'minute')
    .toISOString();
}

export function getResendAttemptsLeft(resendAttempts: number): number {
  return +config.MAX_RESEND_OTP_ATTEMPTS - resendAttempts;
}

export function getOtpAttemptsLeft(otpAttempts: number): number {
  return +config.MAX_OTP_ATTEMPTS - otpAttempts;
}

export function getResendAttempts(resendAttempts: number): number {
  return +resendAttempts < +config.MAX_RESEND_OTP_ATTEMPTS
    ? +resendAttempts + 1
    : resendAttempts;
}

export function getOtpAttempts(otpAttempts: number): number {
  return +otpAttempts < +config.MAX_OTP_ATTEMPTS
    ? +otpAttempts + 1
    : +otpAttempts;
}

export function isOtpExpired(otpExpiresAt: string): boolean {
  return dayjs(otpExpiresAt).isBefore(dayjs());
}

export function isResendAttemptExceeded(resendAttempts: number): boolean {
  return +resendAttempts >= +config.MAX_RESEND_OTP_ATTEMPTS;
}

export function isOtpAttemptExceeded(otpAttempts: number): boolean {
  return otpAttempts >= +config.MAX_OTP_ATTEMPTS;
}
