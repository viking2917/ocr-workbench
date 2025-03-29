import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'projects',
        loadComponent: () =>
          import('../pages/projects/projects.page').then((m) => m.ProjectsPage),
      },
      {
        path: 'project/:id',
        loadComponent: () =>
          import('../pages/project/project.page').then((m) => m.ProjectPage),
      },
      {
        path: 'project/:id/page/:pageIndex',
        loadComponent: () =>
          import('../pages/page/page.page').then((m) => m.PagePage),
      },
      {
        path: '',
        redirectTo: '/tabs/projects',
        pathMatch: 'full',
      },
      // {
      //   path: 'tab1',
      //   loadComponent: () =>
      //     import('../tab1/tab1.page').then((m) => m.Tab1Page),
      // },
      {
        path: 'settings',
        loadComponent: () =>
          import('../settings/settings.page').then((m) => m.SettingsPage),
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/projects',
    pathMatch: 'full',
  },
];
