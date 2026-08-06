import { describe, expect, it } from 'vitest';

import { routes } from './app.routes';

describe('app routes', () => {
  it('defines the MVP shell routes lazily', () => {
    expect(routes.map((route) => route.path)).toEqual([
      '',
      'painel',
      'itens',
      'responsaveis',
      '**',
    ]);
    expect(routes.filter((route) => route.loadComponent).length).toBe(3);
  });
});
