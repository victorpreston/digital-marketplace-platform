import { Routes } from '@angular/router';

export const customerRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./dashboard/customer-dashboard.component').then(c => c.CustomerDashboardComponent) },
  { path: 'profile', loadComponent: () => import('./profile/customer-profile.component').then(c => c.CustomerProfileComponent) },
  { path: 'orders', loadComponent: () => import('./orders/customer-orders.component').then(c => c.CustomerOrdersComponent) },
  { path: 'wishlist', loadComponent: () => import('./wishlist/customer-wishlist.component').then(c => c.CustomerWishlistComponent) },
  { path: 'addresses', loadComponent: () => import('./addresses/customer-addresses.component').then(c => c.CustomerAddressesComponent) },
  { path: 'reviews', loadComponent: () => import('./reviews/customer-reviews.component').then(c => c.CustomerReviewsComponent) }
];