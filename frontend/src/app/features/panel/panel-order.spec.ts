import { describe, expect, it } from 'vitest';

import { prioritizeStoppedItems } from './panel-order';

describe('prioritizeStoppedItems', () => {
  it('moves stopped items to the beginning', () => {
    const items = [
      { id: 'ok', status: 'OK' as const },
      { id: 'unstable', status: 'INSTAVEL' as const },
      { id: 'stopped-1', status: 'PARADO' as const },
      { id: 'stopped-2', status: 'PARADO' as const },
    ];

    expect(prioritizeStoppedItems(items).map(({ id }) => id)).toEqual([
      'stopped-1',
      'stopped-2',
      'ok',
      'unstable',
    ]);
  });

  it('preserves the relative order within both groups', () => {
    const items = [
      { id: 'stopped-1', status: 'PARADO' as const },
      { id: 'stopped-2', status: 'PARADO' as const },
      { id: 'unstable', status: 'INSTAVEL' as const },
      { id: 'ok', status: 'OK' as const },
    ];

    expect(prioritizeStoppedItems(items)).toEqual(items);
  });

  it('does not mutate the source array', () => {
    const items = [
      { id: 'ok', status: 'OK' as const },
      { id: 'stopped', status: 'PARADO' as const },
    ];

    prioritizeStoppedItems(items);

    expect(items.map(({ id }) => id)).toEqual(['ok', 'stopped']);
  });
});
