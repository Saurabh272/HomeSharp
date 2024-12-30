export class EmailOtpEvent {
  public otp: string;

  public email: string;

  constructor(params: { otp: string; email: string }) {
    this.otp = params?.otp;
    this.email = params?.email;
  }
}
