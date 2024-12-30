import { registerDecorator } from 'class-validator';

export function IsValidType() {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidType',
      target: object.constructor,
      propertyName,
      validator: {
        validate(value: any) {
          return ['categories', 'collections', 'developers', 'projects'].includes(value);
        },
        defaultMessage() {
          return 'Invalid type';
        }
      }
    });
  };
}
