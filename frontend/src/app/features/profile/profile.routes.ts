import { Routes } from '@angular/router';

export const profileRoutes: Routes = [
  { path: '', loadComponent: () => import('./profile.component').then(c => c.ProfileComponent) }
];