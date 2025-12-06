import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { customerGuard, sellerGuard, courierGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/products',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(r => r.authRoutes)
  },
  {
    path: 'products',
    loadChildren: () => import('./features/products/product.routes').then(r => r.productRoutes)
  },
  {
    path: 'cart',
    loadChildren: () => import('./features/cart/cart.routes').then(r => r.cartRoutes)
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadChildren: () => import('./features/orders/orders.routes').then(r => r.ordersRoutes)
  },
  {
    path: 'customer',
    canActivate: [authGuard, customerGuard],
    loadChildren: () => import('./features/customer/customer.routes').then(r => r.customerRoutes)
  },
  {
    path: 'seller',
    canActivate: [authGuard, sellerGuard],
    loadChildren: () => import('./features/seller/seller.routes').then(r => r.sellerRoutes)
  },
  {
    path: 'courier',
    canActivate: [authGuard, courierGuard],
    loadChildren: () => import('./features/courier/courier.routes').then(r => r.courierRoutes)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadChildren: () => import('./features/profile/profile.routes').then(r => r.profileRoutes)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent)
  },
  {
    path: 'backend-test',
    loadComponent: () => import('./shared/components/backend-test/backend-test.component').then(c => c.BackendTestComponent)
  },
  {
    path: 'health-dashboard',
    loadComponent: () => import('./shared/components/health-dashboard/health-dashboard.component').then(c => c.HealthDashboardComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(c => c.NotFoundComponent)
  }
];
