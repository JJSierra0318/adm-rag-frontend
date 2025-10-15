import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./rag/rag-dashboard/rag-dashboard.component'),
    children: [
      {
        path: 'chat',
        loadComponent: () => import('./rag/rag-chat/rag-chat.component')
      },
      {
        path: 'history',
        loadComponent: () => import('./rag/rag-history/rag-history.component')
      },
      {
        path: '**',
        redirectTo: 'chat'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
