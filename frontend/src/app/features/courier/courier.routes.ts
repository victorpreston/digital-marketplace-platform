import { Routes } from '@angular/router';

export const courierRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./dashboard/courier-dashboard.component').then(c => c.CourierDashboardComponent) }
];