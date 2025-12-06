import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface SellerOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: Date;
  shippingAddress: string;
  trackingNumber?: string;
}

@Component({
  selector: 'app-seller-orders',
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
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    MatTabsModule,
    MatPaginatorModule,
    MatSortModule
  ],
  template: `
    <div class="orders-container">
      <!-- Header -->
      <div class="orders-header">
        <div class="header-content">
          <div class="title-section">
            <h1>Order Management</h1>
            <p>Manage and track your customer orders</p>
          </div>
          <div class="header-stats">
            <div class="stat-card">
              <span class="stat-number">{{ getOrdersByStatus('pending').length }}</span>
              <span class="stat-label">Pending</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">{{ getOrdersByStatus('processing').length }}</span>
              <span class="stat-label">Processing</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">{{ getOrdersByStatus('shipped').length }}</span>
              <span class="stat-label">Shipped</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <mat-card>
          <mat-card-content>
            <div class="filters-row">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Search orders</mat-label>
                <input matInput [formControl]="searchControl" 
                       placeholder="Search by order ID, customer, or product">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Status</mat-label>
                <mat-select [formControl]="statusControl">
                  <mat-option value="">All Status</mat-option>
                  <mat-option value="pending">Pending</mat-option>
                  <mat-option value="processing">Processing</mat-option>
                  <mat-option value="shipped">Shipped</mat-option>
                  <mat-option value="delivered">Delivered</mat-option>
                  <mat-option value="cancelled">Cancelled</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Date Range</mat-label>
                <mat-select [formControl]="dateRangeControl">
                  <mat-option value="">All Time</mat-option>
                  <mat-option value="today">Today</mat-option>
                  <mat-option value="week">This Week</mat-option>
                  <mat-option value="month">This Month</mat-option>
                  <mat-option value="quarter">This Quarter</mat-option>
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

      <!-- Orders Table -->
      <div class="orders-table-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Orders ({{ filteredOrders.length }})</mat-card-title>
            <div class="table-header-actions">
              <button mat-button (click)="exportOrders()">
                <mat-icon>download</mat-icon>
                Export
              </button>
            </div>
          </mat-card-header>
          <mat-card-content>
            <div class="table-container">
              <table mat-table [dataSource]="filteredOrders" class="orders-table" matSort>
                
                <!-- Order ID Column -->
                <ng-container matColumnDef="orderId">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Order ID</th>
                  <td mat-cell *matCellDef="let order">
                    <div class="order-id-cell">
                      <span class="order-id">#{{ order.id }}</span>
                      <button mat-icon-button routerLink="/seller/orders/{{ order.id }}" 
                              matTooltip="View Details">
                        <mat-icon>visibility</mat-icon>
                      </button>
                    </div>
                  </td>
                </ng-container>

                <!-- Customer Column -->
                <ng-container matColumnDef="customer">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header="customerName">Customer</th>
                  <td mat-cell *matCellDef="let order">
                    <div class="customer-cell">
                      <div class="customer-info">
                        <span class="customer-name">{{ order.customerName }}</span>
                        <span class="customer-email">{{ order.customerEmail }}</span>
                      </div>
                    </div>
                  </td>
                </ng-container>

                <!-- Product Column -->
                <ng-container matColumnDef="product">
                  <th mat-header-cell *matHeaderCellDef>Product</th>
                  <td mat-cell *matCellDef="let order">
                    <div class="product-cell">
                      <span class="product-name">{{ order.productName }}</span>
                      <span class="product-qty">Qty: {{ order.quantity }}</span>
                    </div>
                  </td>
                </ng-container>

                <!-- Amount Column -->
                <ng-container matColumnDef="amount">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header="totalAmount">Amount</th>
                  <td mat-cell *matCellDef="let order">
                    <div class="amount-cell">
                      <span class="total-amount">\${{ order.totalAmount | number:'1.2-2' }}</span>
                      <span class="unit-price">\${{ order.unitPrice | number:'1.2-2' }} each</span>
                    </div>
                  </td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header="status">Status</th>
                  <td mat-cell *matCellDef="let order">
                    <mat-chip [class]="getStatusClass(order.status)">
                      {{ order.status | titlecase }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Date Column -->
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header="orderDate">Order Date</th>
                  <td mat-cell *matCellDef="let order">
                    {{ order.orderDate | date:'mediumDate' }}
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let order">
                    <button mat-icon-button [matMenuTriggerFor]="menu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item routerLink="/seller/orders/{{ order.id }}">
                        <mat-icon>visibility</mat-icon>
                        View Details
                      </button>
                      <button mat-menu-item (click)="updateOrderStatus(order)" 
                              [disabled]="order.status === 'delivered' || order.status === 'cancelled'">
                        <mat-icon>update</mat-icon>
                        Update Status
                      </button>
                      <button mat-menu-item (click)="addTrackingNumber(order)"
                              *ngIf="order.status === 'shipped' && !order.trackingNumber">
                        <mat-icon>local_shipping</mat-icon>
                        Add Tracking
                      </button>
                      <button mat-menu-item (click)="downloadInvoice(order)">
                        <mat-icon>receipt</mat-icon>
                        Download Invoice
                      </button>
                      <button mat-menu-item (click)="contactCustomer(order)">
                        <mat-icon>email</mat-icon>
                        Contact Customer
                      </button>
                    </mat-menu>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                    [class]="getRowClass(row.status)"></tr>
              </table>
            </div>

            <!-- Empty State -->
            <div *ngIf="filteredOrders.length === 0" class="empty-state">
              <mat-icon>shopping_bag</mat-icon>
              <h3>No orders found</h3>
              <p *ngIf="hasActiveFilters()">Try adjusting your filters or search criteria</p>
              <p *ngIf="!hasActiveFilters()">Orders from your customers will appear here</p>
              <div class="empty-actions" *ngIf="hasActiveFilters()">
                <button mat-raised-button (click)="clearFilters()">
                  Clear Filters
                </button>
              </div>
            </div>

            <!-- Pagination -->
            <mat-paginator 
              *ngIf="filteredOrders.length > 0"
              [length]="totalOrders"
              [pageSize]="pageSize"
              [pageSizeOptions]="[10, 25, 50, 100]"
              (page)="onPageChange($event)">
            </mat-paginator>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .orders-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
      background: #f5f5f5;
      min-height: 100vh;
    }

    .orders-header {
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

    .header-stats {
      display: flex;
      gap: 24px;
    }

    .stat-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      min-width: 80px;
    }

    .stat-number {
      font-size: 32px;
      font-weight: 700;
      color: var(--primary-color);
      line-height: 1;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
      margin-top: 4px;
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

    .orders-table-section mat-card {
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

    .orders-table {
      width: 100%;
    }

    .order-id-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .order-id {
      font-family: 'Courier New', monospace;
      font-weight: 600;
      color: var(--primary-color);
    }

    .customer-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .customer-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .customer-name {
      font-weight: 500;
    }

    .customer-email {
      font-size: 12px;
      color: #666;
    }

    .product-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .product-name {
      font-weight: 500;
    }

    .product-qty {
      font-size: 12px;
      color: #666;
    }

    .amount-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
      align-items: flex-end;
    }

    .total-amount {
      font-weight: 600;
      color: var(--primary-color);
      font-size: 16px;
    }

    .unit-price {
      font-size: 12px;
      color: #666;
    }

    .mat-mdc-chip {
      font-size: 12px;
      font-weight: 500;
    }

    .status-pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-processing {
      background: #cce7ff;
      color: #0c5aa6;
    }

    .status-shipped {
      background: #d1ecf1;
      color: #0c5460;
    }

    .status-delivered {
      background: #d4edda;
      color: #155724;
    }

    .status-cancelled {
      background: #f8d7da;
      color: #721c24;
    }

    .mat-mdc-row.row-pending {
      border-left: 4px solid #ffc107;
    }

    .mat-mdc-row.row-processing {
      border-left: 4px solid #007bff;
    }

    .mat-mdc-row.row-shipped {
      border-left: 4px solid #17a2b8;
    }

    .mat-mdc-row.row-delivered {
      border-left: 4px solid #28a745;
    }

    .mat-mdc-row.row-cancelled {
      border-left: 4px solid #dc3545;
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
      .orders-container {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        gap: 20px;
        align-items: stretch;
      }

      .header-stats {
        justify-content: center;
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
export class SellerOrdersComponent implements OnInit {
  orders: SellerOrder[] = [];
  filteredOrders: SellerOrder[] = [];
  displayedColumns: string[] = ['orderId', 'customer', 'product', 'amount', 'status', 'date', 'actions'];
  
  // Form Controls
  searchControl = new FormControl('');
  statusControl = new FormControl('');
  dateRangeControl = new FormControl('');

  // Pagination
  pageSize = 10;
  totalOrders = 0;

  ngOnInit(): void {
    this.loadOrders();
    this.setupFilters();
  }

  private loadOrders(): void {
    // Mock data - replace with actual service call
    this.orders = [
      {
        id: 'ORD-2024-001',
        customerName: 'John Smith',
        customerEmail: 'john.smith@email.com',
        productName: 'Premium Wireless Headphones',
        quantity: 1,
        unitPrice: 299.99,
        totalAmount: 299.99,
        status: 'processing',
        orderDate: new Date('2024-12-05'),
        shippingAddress: '123 Main St, New York, NY 10001',
      },
      {
        id: 'ORD-2024-002',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah.j@email.com',
        productName: 'Smart Fitness Watch',
        quantity: 2,
        unitPrice: 199.99,
        totalAmount: 399.98,
        status: 'shipped',
        orderDate: new Date('2024-12-04'),
        shippingAddress: '456 Oak Ave, Los Angeles, CA 90210',
        trackingNumber: 'TR1234567890'
      },
      {
        id: 'ORD-2024-003',
        customerName: 'Mike Davis',
        customerEmail: 'mike.davis@email.com',
        productName: 'Organic Coffee Beans',
        quantity: 3,
        unitPrice: 24.99,
        totalAmount: 74.97,
        status: 'delivered',
        orderDate: new Date('2024-12-03'),
        shippingAddress: '789 Pine St, Chicago, IL 60601'
      },
      {
        id: 'ORD-2024-004',
        customerName: 'Emily Chen',
        customerEmail: 'emily.chen@email.com',
        productName: 'Premium Wireless Headphones',
        quantity: 1,
        unitPrice: 299.99,
        totalAmount: 299.99,
        status: 'pending',
        orderDate: new Date('2024-12-05'),
        shippingAddress: '321 Elm St, Miami, FL 33101'
      }
    ];

    this.applyFilters();
  }

  private setupFilters(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });

    this.statusControl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.dateRangeControl.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  private applyFilters(): void {
    let filtered = [...this.orders];

    // Search filter
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm) ||
        order.customerName.toLowerCase().includes(searchTerm) ||
        order.productName.toLowerCase().includes(searchTerm) ||
        order.customerEmail.toLowerCase().includes(searchTerm)
      );
    }

    // Status filter
    const status = this.statusControl.value;
    if (status) {
      filtered = filtered.filter(order => order.status === status);
    }

    // Date range filter
    const dateRange = this.dateRangeControl.value;
    if (dateRange) {
      const now = new Date();
      let filterDate = new Date();
      
      switch (dateRange) {
        case 'today':
          filterDate.setDate(now.getDate());
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(order => order.orderDate >= filterDate);
    }

    this.filteredOrders = filtered;
    this.totalOrders = filtered.length;
  }

  getOrdersByStatus(status: string): SellerOrder[] {
    return this.orders.filter(order => order.status === status);
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getRowClass(status: string): string {
    return `row-${status}`;
  }

  hasActiveFilters(): boolean {
    return !!(this.searchControl.value || this.statusControl.value || this.dateRangeControl.value);
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.statusControl.setValue('');
    this.dateRangeControl.setValue('');
  }

  onPageChange(event: any): void {
    this.pageSize = event.pageSize;
    // In real implementation, reload data with new page parameters
  }

  updateOrderStatus(order: SellerOrder): void {
    // In real implementation, show dialog to update status
    console.log('Update order status:', order.id);
  }

  addTrackingNumber(order: SellerOrder): void {
    // In real implementation, show dialog to add tracking number
    console.log('Add tracking number for order:', order.id);
  }

  downloadInvoice(order: SellerOrder): void {
    console.log('Download invoice for order:', order.id);
  }

  contactCustomer(order: SellerOrder): void {
    console.log('Contact customer for order:', order.id);
  }

  exportOrders(): void {
    console.log('Export orders');
  }
}