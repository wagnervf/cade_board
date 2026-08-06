import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

type ContactCandidate = {
  contactChannel?: unknown;
  email?: unknown;
  phone?: unknown;
};

function hasText(value: unknown): boolean {
  return typeof value === 'string' && value.trim() !== '';
}

export function hasAtLeastOneContact(value: ContactCandidate): boolean {
  return hasText(value.phone) || hasText(value.email) || hasText(value.contactChannel);
}

export function AtLeastOneContact(validationOptions?: ValidationOptions): ClassDecorator {
  return (target: object) => {
    registerDecorator({
      name: 'atLeastOneContact',
      target: target.constructor,
      propertyName: 'contact',
      options: validationOptions,
      validator: {
        validate(_value: unknown, args: ValidationArguments): boolean {
          return hasAtLeastOneContact(args.object as ContactCandidate);
        },
      },
    });
  };
}
