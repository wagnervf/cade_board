import { describe, expect, it } from 'vitest';

import { getTeamsContact, getTeamsLabel } from './teams-contact';

describe('getTeamsLabel', () => {
  it('preserves an identifiable Teams channel', () => {
    expect(getTeamsLabel('Teams: ana.souza')).toBe('Teams: ana.souza');
    expect(getTeamsContact('Teams: ana.souza')).toBe('Teams: ana.souza');
  });

  it.each([null, '', 'Ramal 2202', 'Plantão Infra', 'Teams:   '])(
    'does not present a generic channel as Teams: %s',
    (channel) => {
      expect(getTeamsLabel(channel)).toBe('Teams não informado');
      expect(getTeamsContact(channel)).toBeNull();
    },
  );
});
