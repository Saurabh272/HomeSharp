import {
  registerDecorator, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments
} from 'class-validator';
import { CustomValidationOptions } from '../interfaces/inquiry.interface';

@ValidatorConstraint({ name: 'IsCustomValidWithOptions', async: false })
export class IsCustomValidConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value) {
      return false;
    }

    if (args?.constraints && args.constraints[0]?.minLength && value.length < args.constraints[0]?.minLength) {
      return false;
    }

    if (args?.constraints && args.constraints[0]?.maxLength && value.length > args.constraints[0]?.maxLength) {
      return false;
    }

    if (args?.constraints && args.constraints[0]?.regex && !args.constraints[0]?.regex.test(value)) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    if (!args.value) {
      return `${args.property} should not be empty`;
    }

    if (args?.constraints && args.constraints[0]?.minLength && args.value.length < args.constraints[0]?.minLength) {
      return `${args.property} should be at least ${args.constraints[0]?.minLength} characters long`;
    }

    if (args?.constraints && args.constraints[0]?.maxLength && args.value.length > args.constraints[0]?.maxLength) {
      return `${args.property} should not exceed ${args.constraints[0]?.maxLength} characters`;
    }

    if (args?.constraints && args.constraints[0]?.regex && !args.constraints[0]?.regex.test(args.value)) {
      if (args?.property === 'name') {
        return 'name should not contain numbers or special characters';
      }
      if (args?.property === 'email') {
        return 'Invalid Email address';
      }
      return `${args.property} should not contain special characters`;
    }

    return 'Invalid value';
  }
}

export function IsCustomValidWithOptions(options: CustomValidationOptions[]) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsCustomValidWithOptions',
      target: object.constructor,
      propertyName,
      constraints: options || [],
      validator: IsCustomValidConstraint
    });
  };
}
