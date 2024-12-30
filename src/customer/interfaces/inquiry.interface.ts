import { ValidationOptions } from 'class-validator';

export interface InquiryInterface {
  name: string,
  email: string,
  subject?: string
}

export interface CustomValidationOptions extends ValidationOptions {
  minLength?: number;
  maxLength?: number;
  regex?: RegExp;
}
