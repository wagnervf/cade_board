import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'painel',
  },
  {
    path: 'painel',
    loadComponent: () =>
      import('./features/panel/panel.page').then((module) => module.PanelPage),
  },
  {
    path: 'itens',
    loadComponent: () =>
      import('./features/items/items.page').then((module) => module.ItemsPage),
  },
  {
    path: 'responsaveis',
    loadComponent: () =>
      import('./features/responsibles/responsibles.page').then(
        (module) => module.ResponsiblesPage,
      ),
  },
  {
    path: '**',
    redirectTo: 'painel',
  },
];
