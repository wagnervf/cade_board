import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

type ContactValue = {
  contactChannel?: unknown;
  email?: unknown;
  phone?: unknown;
};

function hasText(value: unknown): boolean {
  return typeof value === 'string' && value.trim() !== '';
}

export const atLeastOneContactValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value as ContactValue;

  return hasText(value.phone) || hasText(value.email) || hasText(value.contactChannel)
    ? null
    : { contactRequired: true };
};
