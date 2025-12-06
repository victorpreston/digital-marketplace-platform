import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const cartRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./cart.component').then(c => c.CartComponent)
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () => import('./checkout.component').then(c => c.CheckoutComponent)
  }
];