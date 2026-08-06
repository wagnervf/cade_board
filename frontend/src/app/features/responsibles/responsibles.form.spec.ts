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

  it('accepts forms with one contact field', () => {
    expect(
      makeForm({ contactChannel: 'Teams: ana', email: '', phone: '' }).valid,
    ).toBe(true);
  });
});
