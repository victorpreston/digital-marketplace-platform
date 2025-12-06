import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    RouterModule
  ],
  template: `
    <div class="empty-state-container" [ngClass]="'empty-state-' + type">
      
      <!-- Default Empty State -->
      <div *ngIf="type === 'default'" class="empty-state-content">
        <div class="empty-state-icon">
          <mat-icon>{{ icon || 'inbox' }}</mat-icon>
        </div>
        <h2 class="empty-state-title">{{ title || 'No items found' }}</h2>
        <p class="empty-state-description" *ngIf="description">{{ description }}</p>
        
        <div class="empty-state-actions" *ngIf="primaryAction || secondaryAction">
          <button *ngIf="primaryAction" 
                  mat-raised-button 
                  color="primary" 
                  (click)="onPrimaryAction()">
            <mat-icon *ngIf="primaryAction.icon">{{ primaryAction.icon }}</mat-icon>
            {{ primaryAction.label }}
          </button>
          
          <button *ngIf="secondaryAction" 
                  mat-stroked-button 
                  (click)="onSecondaryAction()">
            <mat-icon *ngIf="secondaryAction.icon">{{ secondaryAction.icon }}</mat-icon>
            {{ secondaryAction.label }}
          </button>
        </div>
      </div>

      <!-- Search Results Empty State -->
      <div *ngIf="type === 'search'" class="empty-state-content search-empty">
        <div class="empty-state-icon">
          <mat-icon>search_off</mat-icon>
        </div>
        <h2 class="empty-state-title">{{ title || 'No search results' }}</h2>
        <p class="empty-state-description">
          {{ description || 'We couldn\'t find anything matching your search.' }}
        </p>
        
        <div class="search-suggestions" *ngIf="searchSuggestions && searchSuggestions.length > 0">
          <h3>Try searching for:</h3>
          <div class="suggestion-chips">
            <button *ngFor="let suggestion of searchSuggestions" 
                    mat-button 
                    class="suggestion-chip"
                    (click)="onSuggestionClick(suggestion)">
              {{ suggestion }}
            </button>
          </div>
        </div>
        
        <div class="empty-state-actions">
          <button mat-raised-button color="primary" (click)="onPrimaryAction()">
            <mat-icon>refresh</mat-icon>
            Try Different Keywords
          </button>
          <button mat-stroked-button (click)="clearSearch.emit()">
            <mat-icon>clear</mat-icon>
            Clear Search
          </button>
        </div>
      </div>

      <!-- Cart Empty State -->
      <div *ngIf="type === 'cart'" class="empty-state-content cart-empty">
        <div class="empty-state-icon large-icon">
          <mat-icon>shopping_cart</mat-icon>
        </div>
        <h2 class="empty-state-title">Your cart is empty</h2>
        <p class="empty-state-description">
          Start shopping to add items to your cart
        </p>
        
        <div class="empty-state-actions">
          <button mat-raised-button color="primary" routerLink="/products">
            <mat-icon>storefront</mat-icon>
            Browse Products
          </button>
          <button mat-stroked-button routerLink="/customer/wishlist">
            <mat-icon>favorite</mat-icon>
            View Wishlist
          </button>
        </div>
      </div>

      <!-- Orders Empty State -->
      <div *ngIf="type === 'orders'" class="empty-state-content orders-empty">
        <div class="empty-state-icon large-icon">
          <mat-icon>receipt_long</mat-icon>
        </div>
        <h2 class="empty-state-title">No orders yet</h2>
        <p class="empty-state-description">
          When you place your first order, it will appear here
        </p>
        
        <div class="empty-state-actions">
          <button mat-raised-button color="primary" routerLink="/products">
            <mat-icon>shopping_bag</mat-icon>
            Start Shopping
          </button>
        </div>
      </div>

      <!-- Wishlist Empty State -->
      <div *ngIf="type === 'wishlist'" class="empty-state-content wishlist-empty">
        <div class="empty-state-icon large-icon">
          <mat-icon>favorite_border</mat-icon>
        </div>
        <h2 class="empty-state-title">Your wishlist is empty</h2>
        <p class="empty-state-description">
          Save items you love by clicking the heart icon
        </p>
        
        <div class="empty-state-actions">
          <button mat-raised-button color="primary" routerLink="/products">
            <mat-icon>search</mat-icon>
            Discover Products
          </button>
        </div>
      </div>

      <!-- Products Empty State (for sellers) -->
      <div *ngIf="type === 'products'" class="empty-state-content products-empty">
        <div class="empty-state-icon large-icon">
          <mat-icon>inventory_2</mat-icon>
        </div>
        <h2 class="empty-state-title">No products added</h2>
        <p class="empty-state-description">
          Start selling by adding your first product
        </p>
        
        <div class="empty-state-actions">
          <button mat-raised-button color="primary" routerLink="/seller/products/add">
            <mat-icon>add</mat-icon>
            Add Product
          </button>
          <button mat-stroked-button (click)="onSecondaryAction()">
            <mat-icon>help</mat-icon>
            Seller Guide
          </button>
        </div>
      </div>

      <!-- Network Error State -->
      <div *ngIf="type === 'error'" class="empty-state-content error-empty">
        <div class="empty-state-icon error-icon">
          <mat-icon>{{ errorIcon || 'error_outline' }}</mat-icon>
        </div>
        <h2 class="empty-state-title">{{ title || 'Something went wrong' }}</h2>
        <p class="empty-state-description">
          {{ description || 'Please check your connection and try again.' }}
        </p>
        
        <div class="empty-state-actions">
          <button mat-raised-button color="primary" (click)="onPrimaryAction()">
            <mat-icon>refresh</mat-icon>
            Try Again
          </button>
          <button mat-stroked-button (click)="onSecondaryAction()" *ngIf="secondaryAction">
            <mat-icon *ngIf="secondaryAction.icon">{{ secondaryAction.icon }}</mat-icon>
            {{ secondaryAction.label }}
          </button>
        </div>
      </div>

      <!-- Offline State -->
      <div *ngIf="type === 'offline'" class="empty-state-content offline-empty">
        <div class="empty-state-icon offline-icon">
          <mat-icon>wifi_off</mat-icon>
        </div>
        <h2 class="empty-state-title">You're offline</h2>
        <p class="empty-state-description">
          Please check your internet connection
        </p>
        
        <div class="offline-info">
          <mat-icon>info</mat-icon>
          <span>Some features may be limited while offline</span>
        </div>
        
        <div class="empty-state-actions">
          <button mat-raised-button color="primary" (click)="onPrimaryAction()">
            <mat-icon>refresh</mat-icon>
            Retry Connection
          </button>
        </div>
      </div>

      <!-- Maintenance State -->
      <div *ngIf="type === 'maintenance'" class="empty-state-content maintenance-empty">
        <div class="empty-state-icon maintenance-icon">
          <mat-icon>build</mat-icon>
        </div>
        <h2 class="empty-state-title">Under Maintenance</h2>
        <p class="empty-state-description">
          We're making improvements to serve you better. Please check back soon.
        </p>
        
        <div class="maintenance-info" *ngIf="maintenanceEndTime">
          <mat-icon>schedule</mat-icon>
          <span>Expected completion: {{ maintenanceEndTime | date:'medium' }}</span>
        </div>
      </div>

      <!-- Permission Denied State -->
      <div *ngIf="type === 'permission'" class="empty-state-content permission-empty">
        <div class="empty-state-icon permission-icon">
          <mat-icon>lock</mat-icon>
        </div>
        <h2 class="empty-state-title">Access Restricted</h2>
        <p class="empty-state-description">
          {{ description || 'You don\'t have permission to view this content.' }}
        </p>
        
        <div class="empty-state-actions">
          <button mat-raised-button color="primary" routerLink="/auth/login">
            <mat-icon>login</mat-icon>
            Sign In
          </button>
          <button mat-stroked-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Go Back
          </button>
        </div>
      </div>

      <!-- Custom Empty State -->
      <div *ngIf="type === 'custom'" class="empty-state-content custom-empty">
        <div class="empty-state-icon" *ngIf="icon">
          <mat-icon [ngClass]="iconClass">{{ icon }}</mat-icon>
        </div>
        
        <div class="custom-illustration" *ngIf="illustrationUrl">
          <img [src]="illustrationUrl" [alt]="title" class="illustration-image">
        </div>
        
        <h2 class="empty-state-title" *ngIf="title">{{ title }}</h2>
        <p class="empty-state-description" *ngIf="description">{{ description }}</p>
        
        <div class="custom-content" *ngIf="showCustomContent">
          <ng-content></ng-content>
        </div>
        
        <div class="empty-state-actions" *ngIf="primaryAction || secondaryAction">
          <button *ngIf="primaryAction" 
                  mat-raised-button 
                  [color]="primaryAction.color || 'primary'"
                  (click)="onPrimaryAction()">
            <mat-icon *ngIf="primaryAction.icon">{{ primaryAction.icon }}</mat-icon>
            {{ primaryAction.label }}
          </button>
          
          <button *ngIf="secondaryAction" 
                  mat-stroked-button 
                  [color]="secondaryAction.color"
                  (click)="onSecondaryAction()">
            <mat-icon *ngIf="secondaryAction.icon">{{ secondaryAction.icon }}</mat-icon>
            {{ secondaryAction.label }}
          </button>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .empty-state-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      padding: 2rem;
      text-align: center;
    }

    .empty-state-content {
      max-width: 500px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .empty-state-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(255, 112, 67, 0.1);
      color: #ff7043;
      margin-bottom: 1rem;
    }

    .empty-state-icon mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .empty-state-icon.large-icon {
      width: 120px;
      height: 120px;
    }

    .empty-state-icon.large-icon mat-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
    }

    .empty-state-title {
      font-size: 1.5rem;
      font-weight: 500;
      color: #333;
      margin: 0;
    }

    .empty-state-description {
      font-size: 1rem;
      color: #666;
      line-height: 1.6;
      margin: 0;
    }

    .empty-state-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: center;
      margin-top: 1rem;
    }

    /* Specific State Styles */
    .search-empty .empty-state-icon {
      background: rgba(76, 175, 80, 0.1);
      color: #4caf50;
    }

    .cart-empty .empty-state-icon {
      background: rgba(255, 152, 0, 0.1);
      color: #ff9800;
    }

    .orders-empty .empty-state-icon {
      background: rgba(63, 81, 181, 0.1);
      color: #3f51b5;
    }

    .wishlist-empty .empty-state-icon {
      background: rgba(233, 30, 99, 0.1);
      color: #e91e63;
    }

    .products-empty .empty-state-icon {
      background: rgba(156, 39, 176, 0.1);
      color: #9c27b0;
    }

    .error-empty .empty-state-icon.error-icon {
      background: rgba(244, 67, 54, 0.1);
      color: #f44336;
    }

    .offline-empty .empty-state-icon.offline-icon {
      background: rgba(96, 125, 139, 0.1);
      color: #607d8b;
    }

    .maintenance-empty .empty-state-icon.maintenance-icon {
      background: rgba(255, 193, 7, 0.1);
      color: #ffc107;
    }

    .permission-empty .empty-state-icon.permission-icon {
      background: rgba(121, 85, 72, 0.1);
      color: #795548;
    }

    /* Search Suggestions */
    .search-suggestions {
      width: 100%;
      margin-top: 1rem;
    }

    .search-suggestions h3 {
      font-size: 1rem;
      font-weight: 500;
      color: #333;
      margin: 0 0 1rem 0;
    }

    .suggestion-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
    }

    .suggestion-chip {
      background: rgba(255, 112, 67, 0.1);
      color: #ff7043;
      border: 1px solid rgba(255, 112, 67, 0.3);
      border-radius: 16px;
      padding: 0.25rem 0.75rem;
      font-size: 0.875rem;
    }

    .suggestion-chip:hover {
      background: rgba(255, 112, 67, 0.2);
    }

    /* Info sections */
    .offline-info,
    .maintenance-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      background: rgba(255, 112, 67, 0.05);
      border: 1px solid rgba(255, 112, 67, 0.2);
      border-radius: 8px;
      color: #666;
      font-size: 0.875rem;
    }

    /* Custom illustrations */
    .custom-illustration {
      margin: 1rem 0;
    }

    .illustration-image {
      max-width: 200px;
      max-height: 150px;
      object-fit: contain;
    }

    .custom-content {
      width: 100%;
      margin: 1rem 0;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .empty-state-container {
        padding: 1rem;
        min-height: 250px;
      }

      .empty-state-content {
        gap: 1rem;
      }

      .empty-state-icon {
        width: 60px;
        height: 60px;
      }

      .empty-state-icon mat-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
      }

      .empty-state-icon.large-icon {
        width: 80px;
        height: 80px;
      }

      .empty-state-icon.large-icon mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }

      .empty-state-title {
        font-size: 1.25rem;
      }

      .empty-state-actions {
        flex-direction: column;
        width: 100%;
      }

      .empty-state-actions button {
        width: 100%;
      }

      .suggestion-chips {
        justify-content: center;
      }
    }

    /* Animation */
    .empty-state-content {
      animation: fadeInUp 0.5s ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class EmptyStateComponent {
  @Input() type: 'default' | 'search' | 'cart' | 'orders' | 'wishlist' | 'products' | 'error' | 'offline' | 'maintenance' | 'permission' | 'custom' = 'default';
  @Input() title?: string;
  @Input() description?: string;
  @Input() icon?: string;
  @Input() iconClass?: string;
  @Input() errorIcon?: string;
  @Input() illustrationUrl?: string;
  @Input() showCustomContent: boolean = false;
  
  // Actions
  @Input() primaryAction?: { label: string; icon?: string; color?: string; action?: () => void };
  @Input() secondaryAction?: { label: string; icon?: string; color?: string; action?: () => void };
  
  // Search specific
  @Input() searchSuggestions?: string[];
  
  // Maintenance specific
  @Input() maintenanceEndTime?: Date;

  // Outputs
  @Output() primaryActionClick = new EventEmitter<void>();
  @Output() secondaryActionClick = new EventEmitter<void>();
  @Output() suggestionClick = new EventEmitter<string>();
  @Output() clearSearch = new EventEmitter<void>();

  onPrimaryAction(): void {
    if (this.primaryAction?.action) {
      this.primaryAction.action();
    } else {
      this.primaryActionClick.emit();
    }
  }

  onSecondaryAction(): void {
    if (this.secondaryAction?.action) {
      this.secondaryAction.action();
    } else {
      this.secondaryActionClick.emit();
    }
  }

  onSuggestionClick(suggestion: string): void {
    this.suggestionClick.emit(suggestion);
  }

  goBack(): void {
    window.history.back();
  }
}