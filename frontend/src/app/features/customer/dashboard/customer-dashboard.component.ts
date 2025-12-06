import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressBarModule
  ],
  template: `
    <div class="customer-dashboard">
      <!-- Header Section -->
      <div class="dashboard-header">
        <h1 class="dashboard-title">
          <mat-icon>dashboard</mat-icon>
          Welcome back, {{ customerName }}!
        </h1>
        <p class="dashboard-subtitle">Here's your account overview and recent activity</p>
      </div>

      <!-- Quick Stats Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon color="primary">shopping_bag</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ totalOrders }}</h3>
                <p>Total Orders</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon color="accent">favorite</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ wishlistCount }}</h3>
                <p>Wishlist Items</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon color="warn">star</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ reviewsCount }}</h3>
                <p>Reviews Written</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon style="color: #4CAF50">account_balance_wallet</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ loyaltyPoints }}</h3>
                <p>Loyalty Points</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- Recent Orders -->
        <mat-card class="content-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>history</mat-icon>
              Recent Orders
            </mat-card-title>
            <mat-card-subtitle>Your latest purchases</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="order-list" *ngIf="recentOrders.length > 0; else noOrders">
              <div class="order-item" *ngFor="let order of recentOrders">
                <div class="order-info">
                  <h4>#{{ order.orderNumber }}</h4>
                  <p class="order-date">{{ order.date | date:'mediumDate' }}</p>
                  <p class="order-total">$\${order.total}</p>
                </div>
                <div class="order-status">
                  <mat-chip [color]="getStatusColor(order.status)" selected>
                    {{ order.status }}
                  </mat-chip>
                </div>
              </div>
            </div>
            <ng-template #noOrders>
              <div class="empty-state">
                <mat-icon>shopping_cart</mat-icon>
                <p>No orders yet. Start shopping to see your orders here!</p>
                <button mat-raised-button color="primary" routerLink="/products">
                  Start Shopping
                </button>
              </div>
            </ng-template>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button routerLink="/customer/orders">View All Orders</button>
          </mat-card-actions>
        </mat-card>

        <!-- Wishlist Preview -->
        <mat-card class="content-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>favorite</mat-icon>
              Wishlist
            </mat-card-title>
            <mat-card-subtitle>Items you want to buy</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="wishlist-grid" *ngIf="wishlistItems.length > 0; else noWishlist">
              <div class="wishlist-item" *ngFor="let item of wishlistItems.slice(0, 4)">
                <img [src]="item.image" [alt]="item.name" class="wishlist-image">
                <div class="wishlist-info">
                  <h5>{{ item.name }}</h5>
                  <p class="price">$\${item.price}</p>
                </div>
              </div>
            </div>
            <ng-template #noWishlist>
              <div class="empty-state">
                <mat-icon>favorite_border</mat-icon>
                <p>Your wishlist is empty. Add items you love!</p>
              </div>
            </ng-template>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button routerLink="/customer/wishlist">View Wishlist</button>
          </mat-card-actions>
        </mat-card>

        <!-- Account Overview -->
        <mat-card class="content-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>person</mat-icon>
              Account Overview
            </mat-card-title>
            <mat-card-subtitle>Your account details</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="account-info">
              <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">{{ customerEmail }}</span>
              </div>
              <div class="info-row">
                <span class="label">Member Since:</span>
                <span class="value">{{ memberSince | date:'longDate' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Default Address:</span>
                <span class="value">{{ defaultAddress || 'Not set' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Phone:</span>
                <span class="value">{{ customerPhone || 'Not provided' }}</span>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button routerLink="/customer/profile">Edit Profile</button>
            <button mat-button routerLink="/customer/addresses">Manage Addresses</button>
          </mat-card-actions>
        </mat-card>

        <!-- Quick Actions -->
        <mat-card class="content-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>flash_on</mat-icon>
              Quick Actions
            </mat-card-title>
            <mat-card-subtitle>Common tasks</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="quick-actions">
              <button mat-raised-button color="primary" routerLink="/products" class="action-btn">
                <mat-icon>shopping_cart</mat-icon>
                Continue Shopping
              </button>
              <button mat-raised-button routerLink="/customer/orders" class="action-btn">
                <mat-icon>track_changes</mat-icon>
                Track Orders
              </button>
              <button mat-raised-button routerLink="/customer/reviews" class="action-btn">
                <mat-icon>rate_review</mat-icon>
                Write Reviews
              </button>
              <button mat-raised-button routerLink="/customer/addresses" class="action-btn">
                <mat-icon>location_on</mat-icon>
                Manage Addresses
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .customer-dashboard {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 32px;
      text-align: center;
    }

    .dashboard-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-size: 2.5rem;
      font-weight: 500;
      color: #333;
      margin: 0;
    }

    .dashboard-subtitle {
      font-size: 1.1rem;
      color: #666;
      margin: 8px 0 0 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      transition: transform 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
    }

    .stat-info h3 {
      font-size: 2rem;
      font-weight: 600;
      margin: 0;
      color: #333;
    }

    .stat-info p {
      font-size: 0.9rem;
      color: #666;
      margin: 4px 0 0 0;
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .content-card {
      height: fit-content;
    }

    .content-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .order-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }

    .order-item:last-child {
      border-bottom: none;
    }

    .order-info h4 {
      margin: 0;
      font-weight: 500;
      color: #333;
    }

    .order-date {
      font-size: 0.9rem;
      color: #666;
      margin: 4px 0;
    }

    .order-total {
      font-weight: 600;
      color: #1976d2;
      margin: 0;
    }

    .wishlist-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .wishlist-item {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .wishlist-image {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 8px;
    }

    .wishlist-info h5 {
      margin: 0;
      font-size: 0.9rem;
      color: #333;
    }

    .price {
      color: #1976d2;
      font-weight: 600;
      margin: 4px 0 0 0;
    }

    .account-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .label {
      font-weight: 500;
      color: #666;
    }

    .value {
      color: #333;
    }

    .quick-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: flex-start;
      text-align: left;
      padding: 12px 16px;
    }

    .empty-state {
      text-align: center;
      padding: 32px 16px;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty-state p {
      margin-bottom: 16px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .customer-dashboard {
        padding: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .content-grid {
        grid-template-columns: 1fr;
      }

      .wishlist-grid {
        grid-template-columns: 1fr;
      }

      .quick-actions {
        grid-template-columns: 1fr;
      }

      .dashboard-title {
        font-size: 2rem;
      }
    }
  `]
})
export class CustomerDashboardComponent implements OnInit {
  customerName = 'John Doe';
  customerEmail = 'john.doe@example.com';
  customerPhone = '+1 (555) 123-4567';
  memberSince = new Date('2023-01-15');
  defaultAddress = '123 Main St, New York, NY 10001';

  totalOrders = 12;
  wishlistCount = 8;
  reviewsCount = 5;
  loyaltyPoints = 2450;

  recentOrders = [
    {
      orderNumber: 'ORD-2024-001',
      date: new Date('2024-12-01'),
      total: 299.99,
      status: 'Delivered'
    },
    {
      orderNumber: 'ORD-2024-002',
      date: new Date('2024-11-28'),
      total: 149.50,
      status: 'Shipped'
    },
    {
      orderNumber: 'ORD-2024-003',
      date: new Date('2024-11-25'),
      total: 79.99,
      status: 'Processing'
    }
  ];

  wishlistItems = [
    {
      name: 'Wireless Headphones',
      price: 199.99,
      image: 'assets/images/headphones.jpg'
    },
    {
      name: 'Smartphone Case',
      price: 29.99,
      image: 'assets/images/phone-case.jpg'
    },
    {
      name: 'Laptop Stand',
      price: 89.99,
      image: 'assets/images/laptop-stand.jpg'
    },
    {
      name: 'Bluetooth Speaker',
      price: 159.99,
      image: 'assets/images/speaker.jpg'
    }
  ];

  ngOnInit() {
    // Load customer data from service
    this.loadCustomerData();
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'delivered': return 'accent';
      case 'shipped': return 'primary';
      case 'processing': return 'warn';
      default: return 'basic';
    }
  }

  private loadCustomerData() {
    // TODO: Replace with actual service calls
    // this.customerService.getProfile().subscribe(profile => { ... });
    // this.orderService.getRecentOrders().subscribe(orders => { ... });
    // this.wishlistService.getItems().subscribe(items => { ... });
  }
}