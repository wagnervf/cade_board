import { describe, expect, it } from 'vitest';

import { getInitials } from './initials';

describe('getInitials', () => {
  it.each([
    ['Ana Souza', 'AS'],
    ['Bruno Lima', 'BL'],
    ['Equipe Infraestrutura', 'EI'],
    ['Plantão', 'P'],
    ['  Maria   da Silva  ', 'MS'],
  ])('calculates initials for %s', (name, expected) => {
    expect(getInitials(name)).toBe(expected);
  });
});
