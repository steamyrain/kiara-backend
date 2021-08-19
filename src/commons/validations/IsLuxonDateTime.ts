import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from "class-validator";
import { DateTime } from "luxon";

export function IsLuxonDateTime(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isLuxonDateTime",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return DateTime.isDateTime(value);
        },
      },
    });
  };
}
