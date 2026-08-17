const TEAMS_CHANNEL_PATTERN = /^teams\s*:\s*\S/i;

export function getTeamsContact(contactChannel: string | null): string | null {
  const value = contactChannel?.trim() ?? '';

  return TEAMS_CHANNEL_PATTERN.test(value) ? value : null;
}

export function getTeamsLabel(contactChannel: string | null): string {
  return getTeamsContact(contactChannel) ?? 'Teams não informado';
}
