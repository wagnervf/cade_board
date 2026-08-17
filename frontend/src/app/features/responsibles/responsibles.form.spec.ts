import '@angular/compiler';

import { FormControl, FormGroup } from '@angular/forms';
import { describe, expect, it } from 'vitest';

import { atLeastOneContactValidator } from './responsibles.form';

describe('atLeastOneContactValidator', () => {
  function makeForm(value: { contactChannel: string; email: string; phone: string }) {
    return new FormGroup(
      {
        contactChannel: new FormControl(value.contactChannel),
        email: new FormControl(value.email),
        phone: new FormControl(value.phone),
      },
      { validators: atLeastOneContactValidator },
    );
  }

  it('rejects forms without contact data', () => {
    expect(
      makeForm({ contactChannel: '', email: '', phone: '' }).hasError('contactRequired'),
    ).toBe(true);
  });

  it.each([
    { contactChannel: '', email: '', phone: '+55 61 3000-1001' },
    { contactChannel: '', email: 'ana@example.internal', phone: '' },
    { contactChannel: 'Teams: ana', email: '', phone: '' },
  ])('accepts a form with one contact field: $contactChannel$email$phone', (value) => {
    expect(makeForm(value).valid).toBe(true);
  });
});
