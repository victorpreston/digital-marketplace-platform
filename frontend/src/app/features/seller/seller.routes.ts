import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const sellerRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./dashboard/seller-dashboard.component').then(c => c.SellerDashboardComponent),
    canActivate: [authGuard],
    data: { requiredRole: 'Seller' }
  },
  {
    path: 'products',
    children: [
      { path: '', loadComponent: () => import('./products/seller-products.component').then(c => c.SellerProductsComponent) },
      { path: 'add', loadComponent: () => import('./products/add-product/add-product.component').then(c => c.AddProductComponent) },
      { path: 'edit/:id', loadComponent: () => import('./products/edit-product/edit-product.component').then(c => c.EditProductComponent) }
    ],
    canActivate: [authGuard],
    data: { requiredRole: 'Seller' }
  },
  {
    path: 'orders',
    children: [
      { path: '', loadComponent: () => import('./orders/seller-orders.component').then(c => c.SellerOrdersComponent) },
      { path: ':id', loadComponent: () => import('./orders/order-detail/order-detail.component').then(c => c.OrderDetailComponent) }
    ],
    canActivate: [authGuard],
    data: { requiredRole: 'Seller' }
  },
  {
    path: 'analytics',
    loadComponent: () => import('./analytics/seller-analytics.component').then(c => c.SellerAnalyticsComponent),
    canActivate: [authGuard],
    data: { requiredRole: 'Seller' }
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/seller-profile.component').then(c => c.SellerProfileComponent),
    canActivate: [authGuard],
    data: { requiredRole: 'Seller' }
  }
];