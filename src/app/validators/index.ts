import { Injectable } from '@nestjs/common';

@Injectable()
export class Validators {
  public isEmail(username: string): boolean {
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return emailRegex.test(username);
  }

  public isPhoneNumber(username: string): boolean {
    const phoneRegex = /^[6789]\d{9}$/;
    return phoneRegex.test(username);
  }

  public loginType(username: string): { email?: string; phoneNumber?: string } {
    if (this.isEmail(username)) {
      return {
        email: username
      };
    }

    if (this.isPhoneNumber(username)) {
      return {
        phoneNumber: username
      };
    }

    return null;
  }
}
