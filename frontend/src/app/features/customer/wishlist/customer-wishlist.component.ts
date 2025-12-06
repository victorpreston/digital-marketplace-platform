import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-customer-wishlist',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatDialogModule,
    MatMenuModule,
    MatBadgeModule,
    MatGridListModule
  ],
  template: `
    <div class="wishlist-container">
      <!-- Header -->
      <div class="wishlist-header">
        <button mat-icon-button routerLink="/customer/dashboard" class="back-btn">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-content">
          <h1>My Wishlist</h1>
          <p>{{ wishlistItems.length }} items saved for later</p>
        </div>
      </div>

      <!-- Wishlist Actions -->
      <div class="wishlist-actions" *ngIf="wishlistItems.length > 0">
        <div class="action-group">
          <button mat-button [matMenuTriggerFor]="sortMenu">
            <mat-icon>sort</mat-icon>
            Sort by: {{ getSortLabel(currentSort) }}
          </button>
          <mat-menu #sortMenu="matMenu">
            <button mat-menu-item (click)="setSortBy('date-added')">Date Added</button>
            <button mat-menu-item (click)="setSortBy('name')">Product Name</button>
            <button mat-menu-item (click)="setSortBy('price-low')">Price: Low to High</button>
            <button mat-menu-item (click)="setSortBy('price-high')">Price: High to Low</button>
            <button mat-menu-item (click)="setSortBy('availability')">Availability</button>
          </mat-menu>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Category</mat-label>
            <mat-select [(value)]="selectedCategory" (selectionChange)="applyFilters()">
              <mat-option value="">All Categories</mat-option>
              <mat-option value="electronics">Electronics</mat-option>
              <mat-option value="clothing">Clothing</mat-option>
              <mat-option value="home">Home & Garden</mat-option>
              <mat-option value="books">Books</mat-option>
              <mat-option value="sports">Sports</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search wishlist</mat-label>
            <input matInput [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="Product name...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </div>

        <div class="bulk-actions" *ngIf="selectedItems.length > 0">
          <span class="selection-count">{{ selectedItems.length }} selected</span>
          <button mat-raised-button color="primary" (click)="addSelectedToCart()">
            <mat-icon>shopping_cart</mat-icon>
            Add to Cart
          </button>
          <button mat-button color="warn" (click)="removeSelected()">
            <mat-icon>delete</mat-icon>
            Remove
          </button>
        </div>
      </div>

      <!-- Wishlist Grid -->
      <div class="wishlist-grid" *ngIf="filteredItems.length > 0">
        <mat-card class="wishlist-item" *ngFor="let item of filteredItems; trackBy: trackByItemId">
          <!-- Selection Checkbox -->
          <div class="item-checkbox">
            <mat-checkbox 
              [checked]="selectedItems.includes(item.id)"
              (change)="toggleSelection(item.id, $event.checked)">
            </mat-checkbox>
          </div>

          <!-- Wishlist Badge -->
          <div class="wishlist-badge" *ngIf="item.isNew">
            <mat-chip color="accent" selected>New</mat-chip>
          </div>

          <!-- Product Image -->
          <div class="item-image-container" [routerLink]="['/products', item.id]">
            <img [src]="item.image" [alt]="item.name" class="item-image">
            <div class="image-overlay" *ngIf="!item.inStock">
              <span class="out-of-stock">Out of Stock</span>
            </div>
          </div>

          <!-- Product Info -->
          <mat-card-content class="item-content">
            <h3 class="item-name" [routerLink]="['/products', item.id]">{{ item.name }}</h3>
            <p class="item-brand">{{ item.brand }}</p>
            
            <div class="item-rating" *ngIf="item.rating">
              <div class="stars">
                <mat-icon *ngFor="let star of getStars(item.rating)" 
                          [class.filled]="star"
                          class="star">star</mat-icon>
              </div>
              <span class="rating-count">({{ item.reviewCount }})</span>
            </div>

            <div class="item-price">
              <span class="current-price">$\${item.currentPrice.toFixed(2)}</span>
              <span class="original-price" *ngIf="item.originalPrice > item.currentPrice">
                $\${item.originalPrice.toFixed(2)}
              </span>
              <span class="discount" *ngIf="item.discountPercent">
                {{ item.discountPercent }}% off
              </span>
            </div>

            <div class="item-availability">
              <mat-chip [color]="item.inStock ? 'accent' : 'warn'" selected>
                {{ item.inStock ? 'In Stock' : 'Out of Stock' }}
              </mat-chip>
              <span class="stock-level" *ngIf="item.inStock && item.stockLevel < 10">
                Only {{ item.stockLevel }} left
              </span>
            </div>

            <p class="added-date">Added {{ item.dateAdded | date:'mediumDate' }}</p>
          </mat-card-content>

          <!-- Item Actions -->
          <mat-card-actions class="item-actions">
            <button mat-raised-button color="primary" 
                    [disabled]="!item.inStock"
                    (click)="addToCart(item)">
              <mat-icon>shopping_cart</mat-icon>
              Add to Cart
            </button>
            
            <button mat-icon-button [matMenuTriggerFor]="itemMenu" class="more-actions">
              <mat-icon>more_vert</mat-icon>
            </button>
            
            <mat-menu #itemMenu="matMenu">
              <button mat-menu-item (click)="viewProduct(item.id)">
                <mat-icon>visibility</mat-icon>
                View Product
              </button>
              <button mat-menu-item (click)="moveToList(item)" [disabled]="!item.inStock">
                <mat-icon>playlist_add</mat-icon>
                Move to List
              </button>
              <button mat-menu-item (click)="shareProduct(item)">
                <mat-icon>share</mat-icon>
                Share
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="removeFromWishlist(item.id)" class="remove-action">
                <mat-icon>delete</mat-icon>
                Remove from Wishlist
              </button>
            </mat-menu>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="filteredItems.length === 0 && wishlistItems.length === 0">
        <mat-icon>favorite_border</mat-icon>
        <h2>Your wishlist is empty</h2>
        <p>Save items you love by clicking the heart icon on any product.</p>
        <button mat-raised-button color="primary" routerLink="/products">
          <mat-icon>shopping_cart</mat-icon>
          Start Shopping
        </button>
      </div>

      <!-- No Results State -->
      <div class="empty-state" *ngIf="filteredItems.length === 0 && wishlistItems.length > 0">
        <mat-icon>search_off</mat-icon>
        <h2>No items found</h2>
        <p>Try adjusting your search or filter criteria.</p>
        <button mat-button (click)="clearFilters()">Clear Filters</button>
      </div>

      <!-- Quick Add All to Cart (Fixed Bottom) -->
      <div class="quick-actions" *ngIf="availableItems.length > 0">
        <button mat-fab extended color="primary" (click)="addAllAvailableToCart()">
          <mat-icon>add_shopping_cart</mat-icon>
          Add All Available ({{ availableItems.length }})
        </button>
      </div>
    </div>
  `,
  styles: [`
    .wishlist-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
      padding-bottom: 100px; /* Space for fixed actions */
    }

    .wishlist-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .back-btn {
      flex-shrink: 0;
    }

    .header-content h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 500;
      color: #333;
    }

    .header-content p {
      margin: 4px 0 0 0;
      color: #666;
    }

    .wishlist-actions {
      background: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 24px;
    }

    .action-group {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .filter-field,
    .search-field {
      min-width: 200px;
    }

    .bulk-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 12px;
      background-color: #e3f2fd;
      border-radius: 8px;
    }

    .selection-count {
      font-weight: 500;
      color: #1976d2;
    }

    .bulk-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .wishlist-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .wishlist-item {
      position: relative;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .wishlist-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }

    .item-checkbox {
      position: absolute;
      top: 8px;
      left: 8px;
      z-index: 2;
      background: rgba(255,255,255,0.9);
      border-radius: 4px;
      padding: 4px;
    }

    .wishlist-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 2;
    }

    .item-image-container {
      position: relative;
      cursor: pointer;
      overflow: hidden;
      border-radius: 8px 8px 0 0;
    }

    .item-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      transition: transform 0.2s ease;
    }

    .item-image-container:hover .item-image {
      transform: scale(1.05);
    }

    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .out-of-stock {
      color: white;
      font-weight: 500;
      font-size: 1.1rem;
    }

    .item-content {
      padding: 16px !important;
    }

    .item-name {
      margin: 0 0 8px 0;
      font-size: 1.1rem;
      font-weight: 500;
      color: #333;
      cursor: pointer;
      text-decoration: none;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .item-name:hover {
      color: #1976d2;
    }

    .item-brand {
      margin: 0 0 12px 0;
      color: #666;
      font-size: 0.9rem;
    }

    .item-rating {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .stars {
      display: flex;
      gap: 2px;
    }

    .star {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #ddd;
    }

    .star.filled {
      color: #ffa726;
    }

    .rating-count {
      font-size: 0.9rem;
      color: #666;
    }

    .item-price {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .current-price {
      font-size: 1.2rem;
      font-weight: 600;
      color: #1976d2;
    }

    .original-price {
      text-decoration: line-through;
      color: #666;
      font-size: 0.9rem;
    }

    .discount {
      background-color: #4caf50;
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .item-availability {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .stock-level {
      font-size: 0.8rem;
      color: #f57c00;
      font-weight: 500;
    }

    .added-date {
      margin: 0;
      font-size: 0.8rem;
      color: #999;
    }

    .item-actions {
      padding: 12px 16px !important;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .item-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .more-actions {
      flex-shrink: 0;
    }

    .remove-action {
      color: #f44336;
    }

    .empty-state {
      text-align: center;
      padding: 64px 16px;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty-state h2 {
      margin: 16px 0;
      color: #333;
    }

    .empty-state p {
      margin-bottom: 24px;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    .empty-state button {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 auto;
    }

    .quick-actions {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 100;
    }

    .quick-actions button {
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .wishlist-container {
        padding: 16px;
        padding-bottom: 100px;
      }

      .wishlist-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .action-group {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-field,
      .search-field {
        min-width: unset;
        width: 100%;
      }

      .bulk-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .bulk-actions button {
        justify-content: center;
      }

      .quick-actions {
        right: 16px;
        bottom: 16px;
      }
    }
  `]
})
export class CustomerWishlistComponent implements OnInit {
  wishlistItems: any[] = [];
  filteredItems: any[] = [];
  selectedItems: number[] = [];
  selectedCategory = '';
  searchTerm = '';
  currentSort = 'date-added';

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadWishlistItems();
  }

  get availableItems() {
    return this.filteredItems.filter(item => item.inStock);
  }

  loadWishlistItems() {
    // Mock data - replace with actual service call
    this.wishlistItems = [
      {
        id: 1,
        name: 'Wireless Noise Cancelling Headphones',
        brand: 'Sony',
        currentPrice: 199.99,
        originalPrice: 249.99,
        discountPercent: 20,
        image: 'assets/images/headphones.jpg',
        inStock: true,
        stockLevel: 5,
        category: 'electronics',
        rating: 4.5,
        reviewCount: 1234,
        dateAdded: new Date('2024-11-15'),
        isNew: false
      },
      {
        id: 2,
        name: 'Smartphone Case',
        brand: 'Spigen',
        currentPrice: 29.99,
        originalPrice: 29.99,
        discountPercent: 0,
        image: 'assets/images/phone-case.jpg',
        inStock: false,
        stockLevel: 0,
        category: 'electronics',
        rating: 4.2,
        reviewCount: 567,
        dateAdded: new Date('2024-11-20'),
        isNew: true
      },
      {
        id: 3,
        name: 'Laptop Stand',
        brand: 'Rain Design',
        currentPrice: 89.99,
        originalPrice: 99.99,
        discountPercent: 10,
        image: 'assets/images/laptop-stand.jpg',
        inStock: true,
        stockLevel: 15,
        category: 'electronics',
        rating: 4.8,
        reviewCount: 890,
        dateAdded: new Date('2024-10-30'),
        isNew: false
      },
      {
        id: 4,
        name: 'Bluetooth Speaker',
        brand: 'JBL',
        currentPrice: 159.99,
        originalPrice: 199.99,
        discountPercent: 20,
        image: 'assets/images/speaker.jpg',
        inStock: true,
        stockLevel: 8,
        category: 'electronics',
        rating: 4.6,
        reviewCount: 2345,
        dateAdded: new Date('2024-12-01'),
        isNew: true
      }
    ];

    this.applyFiltersAndSort();
  }

  applyFilters() {
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort() {
    let filtered = [...this.wishlistItems];

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(item => item.category === this.selectedCategory);
    }

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.brand.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.currentSort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.currentPrice - b.currentPrice;
        case 'price-high':
          return b.currentPrice - a.currentPrice;
        case 'availability':
          return (b.inStock ? 1 : 0) - (a.inStock ? 1 : 0);
        case 'date-added':
        default:
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
    });

    this.filteredItems = filtered;
  }

  setSortBy(sortBy: string) {
    this.currentSort = sortBy;
    this.applyFiltersAndSort();
  }

  getSortLabel(sort: string): string {
    switch (sort) {
      case 'name': return 'Name';
      case 'price-low': return 'Price: Low to High';
      case 'price-high': return 'Price: High to Low';
      case 'availability': return 'Availability';
      case 'date-added':
      default: return 'Date Added';
    }
  }

  clearFilters() {
    this.selectedCategory = '';
    this.searchTerm = '';
    this.applyFiltersAndSort();
  }

  toggleSelection(itemId: number, selected: boolean) {
    if (selected) {
      this.selectedItems.push(itemId);
    } else {
      this.selectedItems = this.selectedItems.filter(id => id !== itemId);
    }
  }

  addSelectedToCart() {
    const items = this.wishlistItems.filter(item => 
      this.selectedItems.includes(item.id) && item.inStock
    );
    
    items.forEach(item => {
      // Add to cart logic here
      console.log('Adding to cart:', item);
    });

    this.snackBar.open(`${items.length} items added to cart!`, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });

    this.selectedItems = [];
  }

  removeSelected() {
    this.wishlistItems = this.wishlistItems.filter(item => 
      !this.selectedItems.includes(item.id)
    );
    this.selectedItems = [];
    this.applyFiltersAndSort();
    
    this.snackBar.open('Selected items removed from wishlist', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  addToCart(item: any) {
    // Add single item to cart
    console.log('Adding to cart:', item);
    this.snackBar.open(`${item.name} added to cart!`, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  addAllAvailableToCart() {
    const availableCount = this.availableItems.length;
    this.availableItems.forEach(item => {
      // Add to cart logic here
      console.log('Adding to cart:', item);
    });

    this.snackBar.open(`${availableCount} items added to cart!`, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  removeFromWishlist(itemId: number) {
    const item = this.wishlistItems.find(i => i.id === itemId);
    this.wishlistItems = this.wishlistItems.filter(i => i.id !== itemId);
    this.applyFiltersAndSort();
    
    this.snackBar.open(`${item?.name} removed from wishlist`, 'Undo', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    }).onAction().subscribe(() => {
      // Undo remove
      this.wishlistItems.push(item);
      this.applyFiltersAndSort();
    });
  }

  viewProduct(itemId: number) {
    // Navigate to product page
    console.log('View product:', itemId);
  }

  moveToList(item: any) {
    // Move to shopping list functionality
    console.log('Move to list:', item);
    this.snackBar.open(`${item.name} moved to shopping list`, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  shareProduct(item: any) {
    // Share product functionality
    if (navigator.share) {
      navigator.share({
        title: item.name,
        text: `Check out this product: ${item.name}`,
        url: `/products/${item.id}`
      });
    } else {
      // Fallback to copy link
      const url = `${window.location.origin}/products/${item.id}`;
      navigator.clipboard.writeText(url);
      this.snackBar.open('Product link copied to clipboard', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }

  getStars(rating: number): boolean[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating);
    }
    return stars;
  }

  trackByItemId(index: number, item: any): number {
    return item.id;
  }
}