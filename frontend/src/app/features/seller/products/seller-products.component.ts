import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-seller-products',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatDividerModule
  ],
  template: `
    <div class="products-container">
      <!-- Header -->
      <div class="products-header">
        <div class="header-content">
          <div class="title-section">
            <h1>My Products</h1>
            <p>Manage your product catalog</p>
          </div>
          <div class="header-actions">
            <button mat-raised-button color="primary" routerLink="/seller/products/add">
              <mat-icon>add</mat-icon>
              Add Product
            </button>
          </div>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="filters-section">
        <mat-card>
          <mat-card-content>
            <div class="filters-row">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Search products</mat-label>
                <input matInput [formControl]="searchControl" placeholder="Search by name, description, or SKU">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Category</mat-label>
                <mat-select [formControl]="categoryControl">
                  <mat-option value="">All Categories</mat-option>
                  <mat-option value="electronics">Electronics</mat-option>
                  <mat-option value="clothing">Clothing</mat-option>
                  <mat-option value="home">Home & Garden</mat-option>
                  <mat-option value="books">Books</mat-option>
                  <mat-option value="sports">Sports</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Status</mat-label>
                <mat-select [formControl]="statusControl">
                  <mat-option value="">All Status</mat-option>
                  <mat-option value="active">Active</mat-option>
                  <mat-option value="inactive">Inactive</mat-option>
                  <mat-option value="out-of-stock">Out of Stock</mat-option>
                </mat-select>
              </mat-form-field>

              <button mat-button (click)="clearFilters()" class="clear-filters">
                <mat-icon>clear</mat-icon>
                Clear Filters
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Products Table -->
      <div class="products-table-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Products ({{ filteredProducts.length }})</mat-card-title>
            <div class="table-header-actions">
              <button mat-button (click)="bulkActions()">
                <mat-icon>checklist</mat-icon>
                Bulk Actions
              </button>
              <button mat-button (click)="exportProducts()">
                <mat-icon>download</mat-icon>
                Export
              </button>
            </div>
          </mat-card-header>
          <mat-card-content>
            <div class="table-container">
              <table mat-table [dataSource]="filteredProducts" class="products-table" matSort>
                <!-- Product Column -->
                <ng-container matColumnDef="product">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header="name">Product</th>
                  <td mat-cell *matCellDef="let product">
                    <div class="product-cell">
                      <div class="product-image">
                        <img [src]="getProductImage(product)" [alt]="product.name" />
                      </div>
                      <div class="product-info">
                        <h4>{{ product.name }}</h4>
                        <p class="product-sku">SKU: {{ product.id }}</p>
                      </div>
                    </div>
                  </td>
                </ng-container>

                <!-- Category Column -->
                <ng-container matColumnDef="category">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header="category">Category</th>
                  <td mat-cell *matCellDef="let product">
                    <mat-chip>{{ product.category.name }}</mat-chip>
                  </td>
                </ng-container>

                <!-- Price Column -->
                <ng-container matColumnDef="price">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header="price">Price</th>
                  <td mat-cell *matCellDef="let product">
                    <div class="price-cell">
                      <span class="current-price">\${{ product.price | number:'1.2-2' }}</span>
                      <span *ngIf="product.originalPrice && product.originalPrice > product.price" class="original-price">
                        \${{ product.originalPrice | number:'1.2-2' }}
                      </span>
                    </div>
                  </td>
                </ng-container>

                <!-- Stock Column -->
                <ng-container matColumnDef="stock">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header="stock">Stock</th>
                  <td mat-cell *matCellDef="let product">
                    <div class="stock-cell">
                      <span [class]="getStockClass(getStockQuantity(product))">
                        {{ getStockQuantity(product) }} units
                      </span>
                    </div>
                  </td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let product">
                    <mat-chip [class]="getStatusClass(getProductStatus(product))">
                      {{ getProductStatus(product) }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Rating Column -->
                <ng-container matColumnDef="rating">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header="rating">Rating</th>
                  <td mat-cell *matCellDef="let product">
                    <div class="rating-cell">
                      <mat-icon class="star-icon">star</mat-icon>
                      <span>{{ product.rating || 'N/A' }}</span>
                      <span class="review-count">({{ product.reviewCount || 0 }})</span>
                    </div>
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let product">
                    <button mat-icon-button [matMenuTriggerFor]="menu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item routerLink="/products/{{ product.id }}">
                        <mat-icon>visibility</mat-icon>
                        View
                      </button>
                      <button mat-menu-item routerLink="/seller/products/edit/{{ product.id }}">
                        <mat-icon>edit</mat-icon>
                        Edit
                      </button>
                      <button mat-menu-item (click)="duplicateProduct(product)">
                        <mat-icon>content_copy</mat-icon>
                        Duplicate
                      </button>
                      <mat-divider></mat-divider>
                      <button mat-menu-item (click)="toggleProductStatus(product)" 
                              [class]="product.isActive ? 'deactivate-action' : 'activate-action'">
                        <mat-icon>{{ product.isActive ? 'visibility_off' : 'visibility' }}</mat-icon>
                        {{ product.isActive ? 'Deactivate' : 'Activate' }}
                      </button>
                      <button mat-menu-item (click)="deleteProduct(product)" class="delete-action">
                        <mat-icon>delete</mat-icon>
                        Delete
                      </button>
                    </mat-menu>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>

            <!-- Empty State -->
            <div *ngIf="filteredProducts.length === 0" class="empty-state">
              <mat-icon>inventory</mat-icon>
              <h3>No products found</h3>
              <p *ngIf="hasActiveFilters()">Try adjusting your filters or search criteria</p>
              <p *ngIf="!hasActiveFilters()">Start by adding your first product to your catalog</p>
              <div class="empty-actions">
                <button mat-raised-button color="primary" routerLink="/seller/products/add">
                  <mat-icon>add</mat-icon>
                  Add Product
                </button>
                <button *ngIf="hasActiveFilters()" mat-button (click)="clearFilters()">
                  Clear Filters
                </button>
              </div>
            </div>

            <!-- Pagination -->
            <mat-paginator 
              *ngIf="filteredProducts.length > 0"
              [length]="totalProducts"
              [pageSize]="pageSize"
              [pageSizeOptions]="[10, 25, 50, 100]"
              [pageIndex]="currentPage"
              (page)="onPageChange($event)">
            </mat-paginator>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .products-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
      background: #f5f5f5;
      min-height: 100vh;
    }

    .products-header {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .title-section h1 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 28px;
      font-weight: 600;
    }

    .title-section p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .header-actions button {
      height: 48px;
      padding: 0 24px;
      font-weight: 500;
    }

    .filters-section {
      margin-bottom: 24px;
    }

    .filters-row {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 2;
      min-width: 300px;
    }

    .clear-filters {
      color: #666;
    }

    .products-table-section mat-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .table-header-actions {
      margin-left: auto;
      display: flex;
      gap: 8px;
    }

    .table-container {
      overflow-x: auto;
    }

    .products-table {
      width: 100%;
    }

    .product-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .product-image img {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: 8px;
    }

    .product-info h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .product-sku {
      margin: 0;
      font-size: 12px;
      color: #666;
      font-family: 'Courier New', monospace;
    }

    .price-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .current-price {
      font-weight: 600;
      color: var(--primary-color);
      font-size: 16px;
    }

    .original-price {
      font-size: 14px;
      color: #999;
      text-decoration: line-through;
    }

    .stock-cell .stock-high {
      color: #28a745;
    }

    .stock-cell .stock-medium {
      color: #ffc107;
    }

    .stock-cell .stock-low {
      color: #dc3545;
    }

    .stock-cell .stock-out {
      color: #dc3545;
      font-weight: 600;
    }

    .mat-mdc-chip {
      font-size: 12px;
      font-weight: 500;
    }

    .status-active {
      background: #d4edda;
      color: #155724;
    }

    .status-inactive {
      background: #f8d7da;
      color: #721c24;
    }

    .status-out-of-stock {
      background: #fff3cd;
      color: #856404;
    }

    .rating-cell {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .star-icon {
      color: #ffc107;
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }

    .review-count {
      font-size: 12px;
      color: #666;
    }

    .deactivate-action {
      color: #dc3545;
    }

    .activate-action {
      color: #28a745;
    }

    .delete-action {
      color: #dc3545;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 20px;
      color: #ccc;
    }

    .empty-state h3 {
      margin: 0 0 12px 0;
      font-size: 20px;
      font-weight: 500;
    }

    .empty-state p {
      margin: 0 0 24px 0;
      font-size: 16px;
    }

    .empty-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .products-container {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        gap: 20px;
        align-items: stretch;
      }

      .filters-row {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field {
        min-width: auto;
      }

      .table-header-actions {
        flex-direction: column;
        align-items: stretch;
        margin-left: 0;
        margin-top: 16px;
      }
    }
  `]
})
export class SellerProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  displayedColumns: string[] = ['product', 'category', 'price', 'stock', 'status', 'rating', 'actions'];
  
  // Form Controls for filtering
  searchControl = new FormControl('');
  categoryControl = new FormControl('');
  statusControl = new FormControl('');

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalProducts = 0;

  constructor(
    private productService: ProductService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.setupFilters();
  }

  private loadProducts(): void {
    // Mock data - replace with actual service call
    this.products = [
      {
        id: '1',
        name: 'Premium Wireless Headphones',
        description: 'High-quality noise-canceling headphones',
        price: 299.99,
        originalPrice: 349.99,
        category: { id: 'electronics', name: 'Electronics', level: 1 },
        images: [{ id: '1', url: 'https://via.placeholder.com/300x300?text=Headphones', isPrimary: true, order: 1 }],
        inventory: { quantity: 45, reserved: 0, available: 45, threshold: 5, status: 'IN_STOCK' as any },
        status: 'ACTIVE' as any,
        rating: 4.8,
        reviewCount: 124,
        tags: ['electronics', 'audio', 'wireless'],
        isActive: true,
        sellerId: 'current-seller',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Smart Fitness Watch',
        description: 'Track your fitness goals with this smart watch',
        price: 199.99,
        category: { id: 'electronics', name: 'Electronics', level: 1 },
        images: [{ id: '2', url: 'https://via.placeholder.com/300x300?text=Watch', isPrimary: true, order: 1 }],
        inventory: { quantity: 2, reserved: 0, available: 2, threshold: 5, status: 'LOW_STOCK' as any },
        status: 'ACTIVE' as any,
        rating: 4.5,
        reviewCount: 89,
        tags: ['electronics', 'fitness', 'wearable'],
        isActive: true,
        sellerId: 'current-seller',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Organic Coffee Beans',
        description: 'Premium organic coffee beans from Colombia',
        price: 24.99,
        category: { id: 'food', name: 'Food & Beverages', level: 1 },
        images: [{ id: '3', url: 'https://via.placeholder.com/300x300?text=Coffee', isPrimary: true, order: 1 }],
        inventory: { quantity: 0, reserved: 0, available: 0, threshold: 10, status: 'OUT_OF_STOCK' as any },
        status: 'INACTIVE' as any,
        rating: 4.9,
        reviewCount: 256,
        tags: ['food', 'coffee', 'organic'],
        isActive: false,
        sellerId: 'current-seller',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.applyFilters();
  }

  private setupFilters(): void {
    // Search filter
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });

    // Category filter
    this.categoryControl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    // Status filter
    this.statusControl.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  private applyFilters(): void {
    let filtered = [...this.products];

    // Search filter
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.id.toLowerCase().includes(searchTerm)
      );
    }

    // Category filter
    const category = this.categoryControl.value;
    if (category) {
      filtered = filtered.filter(product => product.category.id === category);
    }

    // Status filter
    const status = this.statusControl.value;
    if (status) {
      filtered = filtered.filter(product => {
        const productStatus = this.getProductStatus(product);
        return productStatus.toLowerCase().replace(' ', '-') === status;
      });
    }

    this.filteredProducts = filtered;
    this.totalProducts = filtered.length;
  }

  getProductStatus(product: Product): string {
    if (!product.isActive) return 'Inactive';
    if (product.inventory.available === 0) return 'Out of Stock';
    return 'Active';
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase().replace(' ', '-')}`;
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'stock-out';
    if (stock < 5) return 'stock-low';
    if (stock < 20) return 'stock-medium';
    return 'stock-high';
  }

  getProductImage(product: Product): string {
    return product.images.find(img => img.isPrimary)?.url || product.images[0]?.url || 'https://via.placeholder.com/48x48?text=No+Image';
  }

  getStockQuantity(product: Product): number {
    return product.inventory.available;
  }

  hasActiveFilters(): boolean {
    return !!(this.searchControl.value || this.categoryControl.value || this.statusControl.value);
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.categoryControl.setValue('');
    this.statusControl.setValue('');
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    // In real implementation, reload data with new page parameters
  }

  toggleProductStatus(product: Product): void {
    product.isActive = !product.isActive;
    // In real implementation, call service to update product
    console.log(`${product.isActive ? 'Activated' : 'Deactivated'} product:`, product.name);
  }

  duplicateProduct(product: Product): void {
    console.log('Duplicate product:', product.name);
    // In real implementation, navigate to add product with pre-filled data
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      const index = this.products.findIndex(p => p.id === product.id);
      if (index > -1) {
        this.products.splice(index, 1);
        this.applyFilters();
        console.log('Deleted product:', product.name);
      }
    }
  }

  bulkActions(): void {
    console.log('Bulk actions');
    // Open bulk actions dialog
  }

  exportProducts(): void {
    console.log('Export products');
    // Export products to CSV or Excel
  }
}