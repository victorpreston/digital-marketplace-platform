import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { Observable } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule,
    MatGridListModule,
    MatChipsModule,
    MatBadgeModule
  ],
  template: `
    <div class="product-list-container">
      <div class="header">
        <h1>Welcome to NebulaMart</h1>
        <p>Your one-stop online marketplace</p>
        
        <!-- Cart Summary -->
        <div *ngIf="(isAuthenticated$ | async) && (cartCount$ | async) as count" class="cart-summary">
          <button mat-raised-button color="accent" routerLink="/cart">
            <mat-icon [matBadge]="count" matBadgeColor="warn">shopping_cart</mat-icon>
            View Cart ({{ count }} items)
          </button>
        </div>
      </div>
      
      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <mat-card>
          <mat-card-content>
            <div class="loading-content">
              <mat-icon>hourglass_empty</mat-icon>
              <p>Loading products...</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
      
      <!-- Products Grid -->
      <div *ngIf="!loading && products.length > 0" class="products-grid">
        <mat-grid-list cols="3" rowHeight="400px" gutterSize="16px">
          <mat-grid-tile *ngFor="let product of products">
            <mat-card class="product-card">
              <img mat-card-image [src]="product.images[0]?.url" [alt]="product.images[0]?.altText">
              
              <mat-card-header>
                <mat-card-title>{{ product.name }}</mat-card-title>
                <mat-card-subtitle>\${{ product.price | number:'1.2-2' }}</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <p class="description">{{ product.description }}</p>
                
                <div class="product-tags">
                  <mat-chip-listbox>
                    <mat-chip *ngFor="let tag of product.tags">{{ tag }}</mat-chip>
                  </mat-chip-listbox>
                </div>
                
                <div class="inventory-status" [class.low-stock]="product.inventory.available < product.inventory.threshold">
                  <mat-icon>{{ product.inventory.available > 0 ? 'check_circle' : 'cancel' }}</mat-icon>
                  <span>{{ product.inventory.available > 0 ? 'In Stock (' + product.inventory.available + ')' : 'Out of Stock' }}</span>
                </div>
              </mat-card-content>
              
              <mat-card-actions>
                <button mat-button color="primary" [routerLink]="['/products', product.id]">
                  <mat-icon>visibility</mat-icon>
                  View Details
                </button>
                
                <button 
                  *ngIf="isAuthenticated$ | async" 
                  mat-raised-button 
                  color="accent" 
                  [disabled]="product.inventory.available === 0"
                  (click)="addToCart(product)"
                  class="add-to-cart">
                  <mat-icon>add_shopping_cart</mat-icon>
                  <span *ngIf="!isInCart(product.id)">Add to Cart</span>
                  <span *ngIf="isInCart(product.id)" [matBadge]="getItemQuantity(product.id)" matBadgeColor="warn">In Cart</span>
                </button>
                
                <button 
                  *ngIf="!(isAuthenticated$ | async)" 
                  mat-raised-button 
                  color="primary" 
                  routerLink="/auth/login">
                  <mat-icon>login</mat-icon>
                  Login to Buy
                </button>
              </mat-card-actions>
            </mat-card>
          </mat-grid-tile>
        </mat-grid-list>
      </div>
      
      <!-- Empty State -->
      <div *ngIf="!loading && products.length === 0" class="empty-state">
        <mat-card>
          <mat-card-header>
            <mat-card-title>
              <mat-icon>inventory_2</mat-icon>
              No Products Available
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>We're adding new products every day. Please check back soon!</p>
            <p>In the meantime, you can:</p>
            <ul>
              <li>Create an account to get notified of new products</li>
              <li>Become a seller and list your products</li>
              <li>Browse our categories for inspiration</li>
            </ul>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" routerLink="/auth/register">
              Get Started
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .product-list-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .header h1 {
      color: var(--primary-color);
      font-size: 2.5rem;
      margin-bottom: 16px;
    }
    
    .header p {
      font-size: 1.2rem;
      color: #666;
      margin-bottom: 20px;
    }
    
    .cart-summary {
      margin-top: 20px;
    }
    
    .loading-state {
      display: flex;
      justify-content: center;
    }
    
    .loading-content {
      text-align: center;
      padding: 40px;
    }
    
    .loading-content mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--primary-color);
    }
    
    .products-grid {
      margin-top: 20px;
    }
    
    .product-card {
      width: 100%;
      height: 380px;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    }
    
    .product-card img {
      height: 180px;
      object-fit: cover;
    }
    
    .product-card mat-card-header {
      padding-bottom: 8px;
    }
    
    .product-card mat-card-content {
      flex: 1;
      padding-top: 0;
    }
    
    .description {
      font-size: 14px;
      line-height: 1.4;
      margin-bottom: 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .product-tags {
      margin-bottom: 12px;
    }
    
    .product-tags mat-chip {
      font-size: 12px;
      margin: 2px;
    }
    
    .inventory-status {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #4caf50;
    }
    
    .inventory-status.low-stock {
      color: #ff9800;
    }
    
    .inventory-status mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    .add-to-cart {
      margin-left: auto;
    }
    
    .empty-state {
      display: flex;
      justify-content: center;
    }
    
    .empty-state mat-card {
      max-width: 600px;
      text-align: center;
    }
    
    .empty-state mat-card-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .empty-state ul {
      text-align: left;
      display: inline-block;
    }
    
    @media (max-width: 768px) {
      .products-grid mat-grid-list {
        cols: 1;
      }
    }
    
    @media (max-width: 1024px) {
      .products-grid mat-grid-list {
        cols: 2;
      }
    }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  cartCount$: Observable<number>;
  isAuthenticated$: Observable<boolean>;

  // Sample products for demonstration
  sampleProducts: Product[] = [
    {
      id: '1',
      name: 'Premium Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 299.99,
      category: { id: '1', name: 'Electronics', level: 1 },
      sellerId: 'seller1',
      images: [{ id: '1', url: 'https://via.placeholder.com/300x200?text=Headphones', altText: 'Headphones', isPrimary: true, order: 1 }],
      specifications: [{ key: 'Battery Life', value: '30 hours' }],
      inventory: { quantity: 10, reserved: 0, available: 10, threshold: 5, status: 'IN_STOCK' as any },
      status: 'ACTIVE' as any,
      rating: 4.5,
      reviewCount: 124,
      tags: ['wireless', 'noise-cancelling'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Smart Fitness Watch',
      description: 'Track your health and fitness with this advanced smartwatch',
      price: 199.99,
      category: { id: '2', name: 'Wearables', level: 1 },
      sellerId: 'seller2',
      images: [{ id: '2', url: 'https://via.placeholder.com/300x200?text=Smartwatch', altText: 'Smartwatch', isPrimary: true, order: 1 }],
      specifications: [{ key: 'Battery Life', value: '7 days' }],
      inventory: { quantity: 25, reserved: 0, available: 25, threshold: 10, status: 'IN_STOCK' as any },
      status: 'ACTIVE' as any,
      rating: 4.2,
      reviewCount: 89,
      tags: ['fitness', 'health', 'smart'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: 'Organic Coffee Beans',
      description: 'Premium organic coffee beans sourced from sustainable farms',
      price: 24.99,
      category: { id: '3', name: 'Food & Beverage', level: 1 },
      sellerId: 'seller3',
      images: [{ id: '3', url: 'https://via.placeholder.com/300x200?text=Coffee', altText: 'Coffee', isPrimary: true, order: 1 }],
      specifications: [{ key: 'Weight', value: '1 lb' }],
      inventory: { quantity: 50, reserved: 0, available: 50, threshold: 20, status: 'IN_STOCK' as any },
      status: 'ACTIVE' as any,
      rating: 4.8,
      reviewCount: 256,
      tags: ['organic', 'coffee', 'premium'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {
    this.cartCount$ = this.cartService.cartCount$;
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    // For now, use sample data. In real implementation, call:
    // this.productService.searchProducts().subscribe(...)
    setTimeout(() => {
      this.products = this.sampleProducts;
      this.loading = false;
    }, 1000);
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
  }

  isInCart(productId: string): boolean {
    return this.cartService.isInCart(productId);
  }

  getItemQuantity(productId: string): number {
    return this.cartService.getItemQuantity(productId);
  }
}