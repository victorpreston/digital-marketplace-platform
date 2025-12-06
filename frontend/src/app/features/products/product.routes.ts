import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const productRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./product-list/product-list.component').then(m => m.ProductListComponent),
    title: 'Products - NebulaMart'
  },
  {
    path: ':id',
    loadComponent: () => import('./product-detail.component').then(m => m.ProductDetailComponent),
    title: 'Product Details - NebulaMart'
  },
  {
    path: ':id/reviews',
    loadComponent: () => import('./product-reviews.component').then(m => m.ProductReviewsComponent),
    canActivate: [authGuard],
    title: 'Product Reviews - NebulaMart'
  }
];