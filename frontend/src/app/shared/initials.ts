export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return '';
  }

  const firstInitial = parts.at(0)?.charAt(0) ?? '';
  const lastInitial = parts.length > 1 ? (parts.at(-1)?.charAt(0) ?? '') : '';

  return `${firstInitial}${lastInitial}`.toLocaleUpperCase('pt-BR');
}
