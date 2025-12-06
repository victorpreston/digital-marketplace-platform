import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatExpansionModule,
    MatDividerModule
  ],
  template: `
    <div class="orders-container">
      <!-- Header -->
      <div class="orders-header">
        <button mat-icon-button routerLink="/customer/dashboard" class="back-btn">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-content">
          <h1>My Orders</h1>
          <p>Track and manage your order history</p>
        </div>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Order Status</mat-label>
              <mat-select [(value)]="selectedStatus" (selectionChange)="applyFilters()">
                <mat-option value="">All Orders</mat-option>
                <mat-option value="pending">Pending</mat-option>
                <mat-option value="processing">Processing</mat-option>
                <mat-option value="shipped">Shipped</mat-option>
                <mat-option value="delivered">Delivered</mat-option>
                <mat-option value="cancelled">Cancelled</mat-option>
                <mat-option value="returned">Returned</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Date Range</mat-label>
              <mat-select [(value)]="selectedDateRange" (selectionChange)="applyFilters()">
                <mat-option value="">All Time</mat-option>
                <mat-option value="last-week">Last Week</mat-option>
                <mat-option value="last-month">Last Month</mat-option>
                <mat-option value="last-3-months">Last 3 Months</mat-option>
                <mat-option value="last-year">Last Year</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Search Orders</mat-label>
              <input matInput [(ngModel)]="searchTerm" (input)="applyFilters()" 
                     placeholder="Order ID, product name...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <button mat-raised-button color="primary" (click)="clearFilters()" class="clear-btn">
              <mat-icon>clear</mat-icon>
              Clear Filters
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Orders List -->
      <div class="orders-list">
        <mat-expansion-panel *ngFor="let order of filteredOrders" class="order-panel">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <div class="order-header-info">
                <div class="order-number">
                  <strong>#{{ order.orderNumber }}</strong>
                  <mat-chip [color]="getStatusColor(order.status)" selected>
                    {{ order.status | titlecase }}
                  </mat-chip>
                </div>
                <div class="order-meta">
                  <span class="order-date">{{ order.orderDate | date:'mediumDate' }}</span>
                  <span class="order-total">$\${order.total.toFixed(2)}</span>
                </div>
              </div>
            </mat-panel-title>
          </mat-expansion-panel-header>

          <div class="order-details">
            <!-- Order Status Timeline -->
            <div class="status-timeline" *ngIf="order.statusHistory">
              <h3>Order Status</h3>
              <div class="timeline">
                <div class="timeline-item" 
                     *ngFor="let status of order.statusHistory" 
                     [class.active]="status.isActive"
                     [class.completed]="status.isCompleted">
                  <div class="timeline-icon">
                    <mat-icon>{{ getStatusIcon(status.status) }}</mat-icon>
                  </div>
                  <div class="timeline-content">
                    <h4>{{ status.status | titlecase }}</h4>
                    <p>{{ status.date | date:'medium' }}</p>
                    <p class="status-description" *ngIf="status.description">
                      {{ status.description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Order Items -->
            <div class="order-items">
              <h3>Order Items ({{ order.items.length }} items)</h3>
              <div class="items-list">
                <div class="item-card" *ngFor="let item of order.items">
                  <img [src]="item.image" [alt]="item.name" class="item-image">
                  <div class="item-details">
                    <h4>{{ item.name }}</h4>
                    <p class="item-variant" *ngIf="item.variant">{{ item.variant }}</p>
                    <p class="item-seller">Sold by: {{ item.seller }}</p>
                    <div class="item-pricing">
                      <span class="quantity">Qty: {{ item.quantity }}</span>
                      <span class="price">$\${item.price.toFixed(2)} each</span>
                      <span class="subtotal">$\${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                  <div class="item-actions">
                    <button mat-button color="primary" 
                            (click)="viewProduct(item.productId)"
                            *ngIf="order.status === 'delivered'">
                      <mat-icon>rate_review</mat-icon>
                      Write Review
                    </button>
                    <button mat-button (click)="buyAgain(item)">
                      <mat-icon>refresh</mat-icon>
                      Buy Again
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Shipping Information -->
            <div class="shipping-info">
              <div class="shipping-section">
                <h3>Shipping Address</h3>
                <div class="address">
                  <p><strong>{{ order.shippingAddress.name }}</strong></p>
                  <p>{{ order.shippingAddress.street }}</p>
                  <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.zipCode }}</p>
                  <p>{{ order.shippingAddress.country }}</p>
                </div>
              </div>

              <div class="shipping-section" *ngIf="order.trackingNumber">
                <h3>Tracking Information</h3>
                <div class="tracking">
                  <p><strong>Tracking Number:</strong> {{ order.trackingNumber }}</p>
                  <p><strong>Carrier:</strong> {{ order.carrier }}</p>
                  <button mat-raised-button color="primary" (click)="trackPackage(order.trackingNumber)">
                    <mat-icon>local_shipping</mat-icon>
                    Track Package
                  </button>
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Order Summary -->
            <div class="order-summary">
              <h3>Order Summary</h3>
              <div class="summary-details">
                <div class="summary-row">
                  <span>Subtotal:</span>
                  <span>$\${order.subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                  <span>Shipping:</span>
                  <span>$\${order.shipping.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                  <span>Tax:</span>
                  <span>$\${order.tax.toFixed(2)}</span>
                </div>
                <div class="summary-row" *ngIf="order.discount > 0">
                  <span>Discount:</span>
                  <span class="discount">-$\${order.discount.toFixed(2)}</span>
                </div>
                <mat-divider></mat-divider>
                <div class="summary-row total">
                  <span><strong>Total:</strong></span>
                  <span><strong>$\${order.total.toFixed(2)}</strong></span>
                </div>
              </div>
            </div>

            <!-- Order Actions -->
            <div class="order-actions">
              <button mat-raised-button color="primary" (click)="downloadInvoice(order.id)">
                <mat-icon>receipt</mat-icon>
                Download Invoice
              </button>
              
              <button mat-button (click)="contactSupport(order.id)" 
                      *ngIf="['pending', 'processing', 'shipped'].includes(order.status)">
                <mat-icon>support_agent</mat-icon>
                Contact Support
              </button>
              
              <button mat-button color="warn" (click)="cancelOrder(order.id)"
                      *ngIf="['pending', 'processing'].includes(order.status)">
                <mat-icon>cancel</mat-icon>
                Cancel Order
              </button>
              
              <button mat-button (click)="returnOrder(order.id)"
                      *ngIf="order.status === 'delivered' && order.isReturnable">
                <mat-icon>keyboard_return</mat-icon>
                Return Order
              </button>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="filteredOrders.length === 0">
          <mat-icon>shopping_bag</mat-icon>
          <h2>No orders found</h2>
          <p *ngIf="hasActiveFilters()">Try adjusting your filters to see more results.</p>
          <p *ngIf="!hasActiveFilters()">You haven't placed any orders yet. Start shopping to see your orders here!</p>
          <button mat-raised-button color="primary" routerLink="/products" 
                  *ngIf="!hasActiveFilters()">
            Start Shopping
          </button>
          <button mat-button (click)="clearFilters()" *ngIf="hasActiveFilters()">
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .orders-container {
      padding: 24px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .orders-header {
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

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      align-items: center;
    }

    .filter-field {
      width: 100%;
    }

    .clear-btn {
      height: fit-content;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .order-panel {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }

    .order-header-info {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .order-number {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .order-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
      font-size: 0.9rem;
    }

    .order-total {
      font-weight: 600;
      color: #1976d2;
    }

    .order-details {
      padding: 24px;
    }

    .order-details h3 {
      margin: 0 0 16px 0;
      color: #333;
      font-weight: 500;
    }

    .status-timeline {
      margin-bottom: 24px;
    }

    .timeline {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-left: 12px;
    }

    .timeline-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      position: relative;
      opacity: 0.5;
    }

    .timeline-item.completed {
      opacity: 1;
    }

    .timeline-item.active {
      opacity: 1;
      color: #1976d2;
    }

    .timeline-item:not(:last-child)::after {
      content: '';
      position: absolute;
      left: 20px;
      top: 40px;
      width: 2px;
      height: 32px;
      background-color: #e0e0e0;
    }

    .timeline-item.completed:not(:last-child)::after {
      background-color: #1976d2;
    }

    .timeline-icon {
      background-color: #f5f5f5;
      border: 2px solid #e0e0e0;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .timeline-item.completed .timeline-icon {
      background-color: #1976d2;
      border-color: #1976d2;
      color: white;
    }

    .timeline-item.active .timeline-icon {
      border-color: #1976d2;
      color: #1976d2;
    }

    .timeline-content h4 {
      margin: 0;
      font-weight: 500;
    }

    .timeline-content p {
      margin: 4px 0;
      font-size: 0.9rem;
      color: #666;
    }

    .status-description {
      font-style: italic;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .item-card {
      display: flex;
      gap: 16px;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: #fafafa;
    }

    .item-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 8px;
    }

    .item-details {
      flex: 1;
    }

    .item-details h4 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .item-variant,
    .item-seller {
      margin: 4px 0;
      font-size: 0.9rem;
      color: #666;
    }

    .item-pricing {
      display: flex;
      gap: 16px;
      margin-top: 8px;
      font-size: 0.9rem;
    }

    .subtotal {
      font-weight: 600;
      color: #1976d2;
    }

    .item-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-end;
    }

    .item-actions button {
      min-width: 120px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .shipping-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 32px;
      margin: 24px 0;
    }

    .address p {
      margin: 4px 0;
    }

    .tracking button {
      margin-top: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .order-summary {
      margin: 24px 0;
    }

    .summary-details {
      max-width: 300px;
      margin-left: auto;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .summary-row.total {
      font-size: 1.1rem;
      padding-top: 16px;
    }

    .discount {
      color: #4caf50;
      font-weight: 500;
    }

    .order-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-top: 24px;
    }

    .order-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
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
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .orders-container {
        padding: 16px;
      }

      .filters-row {
        grid-template-columns: 1fr;
      }

      .order-header-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .order-meta {
        align-items: flex-start;
      }

      .item-card {
        flex-direction: column;
      }

      .item-actions {
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
      }

      .shipping-info {
        grid-template-columns: 1fr;
        gap: 24px;
      }

      .order-actions {
        flex-direction: column;
      }
    }
  `]
})
export class CustomerOrdersComponent implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];
  selectedStatus = '';
  selectedDateRange = '';
  searchTerm = '';

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    // Mock data - replace with actual service call
    this.orders = [
      {
        id: 1,
        orderNumber: 'ORD-2024-001',
        orderDate: new Date('2024-12-01'),
        status: 'delivered',
        total: 299.99,
        subtotal: 259.99,
        shipping: 15.00,
        tax: 25.00,
        discount: 0,
        trackingNumber: 'TRK123456789',
        carrier: 'UPS',
        isReturnable: true,
        statusHistory: [
          { status: 'pending', date: new Date('2024-12-01'), isCompleted: true, description: 'Order placed successfully' },
          { status: 'processing', date: new Date('2024-12-02'), isCompleted: true, description: 'Order is being prepared' },
          { status: 'shipped', date: new Date('2024-12-03'), isCompleted: true, description: 'Package shipped via UPS' },
          { status: 'delivered', date: new Date('2024-12-05'), isCompleted: true, isActive: true, description: 'Package delivered successfully' }
        ],
        items: [
          {
            productId: 1,
            name: 'Wireless Noise Cancelling Headphones',
            variant: 'Black, Over-ear',
            price: 199.99,
            quantity: 1,
            image: 'assets/images/headphones.jpg',
            seller: 'TechGear Store'
          },
          {
            productId: 2,
            name: 'Bluetooth Speaker',
            variant: 'Blue, Portable',
            price: 59.99,
            quantity: 1,
            image: 'assets/images/speaker.jpg',
            seller: 'Audio Plus'
          }
        ],
        shippingAddress: {
          name: 'John Doe',
          street: '123 Main Street, Apt 4B',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States'
        }
      },
      {
        id: 2,
        orderNumber: 'ORD-2024-002',
        orderDate: new Date('2024-11-28'),
        status: 'shipped',
        total: 149.50,
        subtotal: 129.99,
        shipping: 9.99,
        tax: 9.52,
        discount: 0,
        trackingNumber: 'TRK987654321',
        carrier: 'FedEx',
        isReturnable: false,
        statusHistory: [
          { status: 'pending', date: new Date('2024-11-28'), isCompleted: true },
          { status: 'processing', date: new Date('2024-11-29'), isCompleted: true },
          { status: 'shipped', date: new Date('2024-11-30'), isCompleted: true, isActive: true }
        ],
        items: [
          {
            productId: 3,
            name: 'Smartphone Case',
            variant: 'Clear, iPhone 15 Pro',
            price: 29.99,
            quantity: 1,
            image: 'assets/images/phone-case.jpg',
            seller: 'Mobile Accessories Co'
          },
          {
            productId: 4,
            name: 'Wireless Charger',
            variant: 'White, 15W Fast Charging',
            price: 99.99,
            quantity: 1,
            image: 'assets/images/charger.jpg',
            seller: 'TechGear Store'
          }
        ],
        shippingAddress: {
          name: 'John Doe',
          street: '123 Main Street, Apt 4B',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States'
        }
      }
    ];

    this.filteredOrders = [...this.orders];
  }

  applyFilters() {
    this.filteredOrders = this.orders.filter(order => {
      const matchesStatus = !this.selectedStatus || order.status === this.selectedStatus;
      const matchesSearch = !this.searchTerm || 
        order.orderNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.items.some(item => item.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      let matchesDateRange = true;
      if (this.selectedDateRange) {
        const orderDate = new Date(order.orderDate);
        const now = new Date();
        
        switch (this.selectedDateRange) {
          case 'last-week':
            matchesDateRange = (now.getTime() - orderDate.getTime()) <= (7 * 24 * 60 * 60 * 1000);
            break;
          case 'last-month':
            matchesDateRange = (now.getTime() - orderDate.getTime()) <= (30 * 24 * 60 * 60 * 1000);
            break;
          case 'last-3-months':
            matchesDateRange = (now.getTime() - orderDate.getTime()) <= (90 * 24 * 60 * 60 * 1000);
            break;
          case 'last-year':
            matchesDateRange = (now.getTime() - orderDate.getTime()) <= (365 * 24 * 60 * 60 * 1000);
            break;
        }
      }
      
      return matchesStatus && matchesSearch && matchesDateRange;
    });
  }

  clearFilters() {
    this.selectedStatus = '';
    this.selectedDateRange = '';
    this.searchTerm = '';
    this.filteredOrders = [...this.orders];
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedStatus || this.selectedDateRange || this.searchTerm);
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'delivered': return 'accent';
      case 'shipped': return 'primary';
      case 'processing': return 'warn';
      case 'pending': return 'basic';
      case 'cancelled': return 'warn';
      case 'returned': return 'accent';
      default: return 'basic';
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'schedule';
      case 'processing': return 'autorenew';
      case 'shipped': return 'local_shipping';
      case 'delivered': return 'check_circle';
      case 'cancelled': return 'cancel';
      case 'returned': return 'keyboard_return';
      default: return 'help_outline';
    }
  }

  viewProduct(productId: number) {
    // Navigate to product page for review
    console.log('Navigate to product for review:', productId);
  }

  buyAgain(item: any) {
    // Add item to cart
    console.log('Add to cart again:', item);
  }

  trackPackage(trackingNumber: string) {
    // Open tracking URL
    console.log('Track package:', trackingNumber);
    window.open(`https://www.ups.com/track?tracknum=${trackingNumber}`, '_blank');
  }

  downloadInvoice(orderId: number) {
    // Download invoice
    console.log('Download invoice for order:', orderId);
  }

  contactSupport(orderId: number) {
    // Open support dialog
    console.log('Contact support for order:', orderId);
  }

  cancelOrder(orderId: number) {
    // Open cancellation dialog
    console.log('Cancel order:', orderId);
  }

  returnOrder(orderId: number) {
    // Open return dialog
    console.log('Return order:', orderId);
  }
}