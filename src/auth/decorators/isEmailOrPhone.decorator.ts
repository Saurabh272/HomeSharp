import { registerDecorator } from 'class-validator';
import { Validators } from '../../app/validators';

export function IsEmailOrPhone() {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isEmailOrPhone',
      target: object.constructor,
      propertyName,
      validator: {
        validate(value: any) {
          const validators = new Validators();

          return validators.isEmail(value) || validators.isPhoneNumber(value);
        },
        defaultMessage() {
          return 'Invalid email/phone number';
        }
      }
    });
  };
}
