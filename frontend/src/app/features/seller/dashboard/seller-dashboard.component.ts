import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ProductService } from '../../../core/services/product.service';
import { OrderService } from '../../../core/services/order.service';

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  monthlyRevenue: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
}

interface RecentOrder {
  id: string;
  customerName: string;
  productName: string;
  quantity: number;
  amount: number;
  status: string;
  orderDate: Date;
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  rating: number;
  imageUrl: string;
}

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressBarModule,
    MatDividerModule
  ],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="welcome-section">
          <h1>Welcome back!</h1>
          <p>Here's what's happening with your store today</p>
        </div>
        <div class="quick-actions">
          <button mat-raised-button color="primary" routerLink="/seller/products/add">
            <mat-icon>add</mat-icon>
            Add Product
          </button>
          <button mat-raised-button color="accent" routerLink="/seller/orders">
            <mat-icon>shopping_bag</mat-icon>
            View Orders
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon products">
                <mat-icon>inventory</mat-icon>
              </div>
              <div class="stat-details">
                <h3>{{ stats.totalProducts }}</h3>
                <p>Total Products</p>
                <span class="stat-subtitle">{{ stats.activeProducts }} active</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon orders">
                <mat-icon>shopping_cart</mat-icon>
              </div>
              <div class="stat-details">
                <h3>{{ stats.totalOrders }}</h3>
                <p>Total Orders</p>
                <span class="stat-subtitle">{{ stats.pendingOrders }} pending</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon revenue">
                <mat-icon>trending_up</mat-icon>
              </div>
              <div class="stat-details">
                <h3>\${{ stats.monthlyRevenue | number:'1.0-0' }}</h3>
                <p>This Month</p>
                <span class="stat-subtitle">\${{ stats.totalRevenue | number:'1.0-0' }} total</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon rating">
                <mat-icon>star</mat-icon>
              </div>
              <div class="stat-details">
                <h3>{{ stats.averageRating }}</h3>
                <p>Average Rating</p>
                <span class="stat-subtitle">{{ stats.totalReviews }} reviews</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Main Content -->
      <div class="dashboard-content">
        <!-- Recent Orders -->
        <div class="dashboard-section">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Recent Orders</mat-card-title>
              <div class="card-header-actions">
                <button mat-button routerLink="/seller/orders">View All</button>
              </div>
            </mat-card-header>
            <mat-card-content>
              <div class="table-container">
                <table mat-table [dataSource]="recentOrders" class="orders-table">
                  <!-- Order ID Column -->
                  <ng-container matColumnDef="orderId">
                    <th mat-header-cell *matHeaderCellDef>Order ID</th>
                    <td mat-cell *matCellDef="let order">
                      <span class="order-id">#{{ order.id }}</span>
                    </td>
                  </ng-container>

                  <!-- Customer Column -->
                  <ng-container matColumnDef="customer">
                    <th mat-header-cell *matHeaderCellDef>Customer</th>
                    <td mat-cell *matCellDef="let order">{{ order.customerName }}</td>
                  </ng-container>

                  <!-- Product Column -->
                  <ng-container matColumnDef="product">
                    <th mat-header-cell *matHeaderCellDef>Product</th>
                    <td mat-cell *matCellDef="let order">
                      <div class="product-info">
                        <span class="product-name">{{ order.productName }}</span>
                        <span class="product-qty">Qty: {{ order.quantity }}</span>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Amount Column -->
                  <ng-container matColumnDef="amount">
                    <th mat-header-cell *matHeaderCellDef>Amount</th>
                    <td mat-cell *matCellDef="let order">
                      <span class="amount">\${{ order.amount | number:'1.2-2' }}</span>
                    </td>
                  </ng-container>

                  <!-- Status Column -->
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let order">
                      <mat-chip [class]="getStatusClass(order.status)">
                        {{ order.status }}
                      </mat-chip>
                    </td>
                  </ng-container>

                  <!-- Date Column -->
                  <ng-container matColumnDef="date">
                    <th mat-header-cell *matHeaderCellDef>Date</th>
                    <td mat-cell *matCellDef="let order">
                      {{ order.orderDate | date:'mediumDate' }}
                    </td>
                  </ng-container>

                  <!-- Actions Column -->
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef></th>
                    <td mat-cell *matCellDef="let order">
                      <button mat-icon-button [matMenuTriggerFor]="menu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #menu="matMenu">
                        <button mat-menu-item (click)="viewOrder(order.id)">
                          <mat-icon>visibility</mat-icon>
                          View Details
                        </button>
                        <button mat-menu-item (click)="updateOrderStatus(order.id)">
                          <mat-icon>update</mat-icon>
                          Update Status
                        </button>
                      </mat-menu>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                </table>
              </div>

              <div *ngIf="recentOrders.length === 0" class="empty-state">
                <mat-icon>shopping_bag</mat-icon>
                <h3>No recent orders</h3>
                <p>Your recent orders will appear here</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Top Products -->
        <div class="dashboard-section">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Top Performing Products</mat-card-title>
              <div class="card-header-actions">
                <button mat-button routerLink="/seller/analytics">View Analytics</button>
              </div>
            </mat-card-header>
            <mat-card-content>
              <div class="top-products">
                <div *ngFor="let product of topProducts; let i = index" class="product-row">
                  <div class="product-rank">
                    <span class="rank-number">{{ i + 1 }}</span>
                  </div>
                  <div class="product-image">
                    <img [src]="product.imageUrl" [alt]="product.name" />
                  </div>
                  <div class="product-details">
                    <h4>{{ product.name }}</h4>
                    <div class="product-metrics">
                      <span class="metric">
                        <mat-icon>shopping_cart</mat-icon>
                        {{ product.sales }} sold
                      </span>
                      <span class="metric">
                        <mat-icon>attach_money</mat-icon>
                        \${{ product.revenue | number:'1.0-0' }}
                      </span>
                      <span class="metric">
                        <mat-icon>star</mat-icon>
                        {{ product.rating }}
                      </span>
                    </div>
                  </div>
                  <div class="product-actions">
                    <button mat-icon-button routerLink="/seller/products/edit/{{ product.id }}">
                      <mat-icon>edit</mat-icon>
                    </button>
                  </div>
                </div>
              </div>

              <div *ngIf="topProducts.length === 0" class="empty-state">
                <mat-icon>inventory</mat-icon>
                <h3>No products yet</h3>
                <p>Add your first product to start selling</p>
                <button mat-raised-button color="primary" routerLink="/seller/products/add">
                  <mat-icon>add</mat-icon>
                  Add Product
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Performance Insights -->
      <div class="dashboard-section insights">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Performance Insights</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="insights-grid">
              <div class="insight-item">
                <mat-icon class="insight-icon success">trending_up</mat-icon>
                <div class="insight-content">
                  <h4>Sales Growth</h4>
                  <p>Your sales increased by 15% this month compared to last month</p>
                </div>
              </div>
              
              <div class="insight-item">
                <mat-icon class="insight-icon warning">inventory_2</mat-icon>
                <div class="insight-content">
                  <h4>Low Stock Alert</h4>
                  <p>3 products are running low on stock. Consider restocking soon</p>
                </div>
              </div>
              
              <div class="insight-item">
                <mat-icon class="insight-icon info">rate_review</mat-icon>
                <div class="insight-content">
                  <h4>Customer Feedback</h4>
                  <p>You received 12 new reviews this week with an average rating of 4.6</p>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
      background: #f5f5f5;
      min-height: 100vh;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .welcome-section h1 {
      margin: 0 0 8px 0;
      color: var(--primary-color);
      font-size: 28px;
      font-weight: 600;
    }

    .welcome-section p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .quick-actions {
      display: flex;
      gap: 16px;
    }

    .quick-actions button {
      height: 48px;
      padding: 0 24px;
      font-weight: 500;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 8px;
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: white;
    }

    .stat-icon.products {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .stat-icon.orders {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .stat-icon.revenue {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .stat-icon.rating {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    .stat-details {
      flex: 1;
    }

    .stat-details h3 {
      margin: 0 0 4px 0;
      font-size: 32px;
      font-weight: 700;
      color: #333;
    }

    .stat-details p {
      margin: 0 0 4px 0;
      font-size: 16px;
      color: #666;
      font-weight: 500;
    }

    .stat-subtitle {
      font-size: 14px;
      color: #999;
    }

    .dashboard-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }

    .dashboard-section {
      display: flex;
      flex-direction: column;
    }

    .dashboard-section mat-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .card-header-actions {
      margin-left: auto;
    }

    .table-container {
      overflow-x: auto;
    }

    .orders-table {
      width: 100%;
    }

    .order-id {
      font-family: 'Courier New', monospace;
      font-weight: 600;
      color: var(--primary-color);
    }

    .product-info {
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

    .amount {
      font-weight: 600;
      color: var(--primary-color);
      font-size: 16px;
    }

    .mat-mdc-chip {
      min-height: 24px;
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

    .top-products {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .product-row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border-radius: 8px;
      background: #f8f9fa;
      transition: background 0.3s ease;
    }

    .product-row:hover {
      background: #e9ecef;
    }

    .product-rank {
      width: 32px;
      height: 32px;
      background: var(--primary-color);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      flex-shrink: 0;
    }

    .product-image img {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: 8px;
    }

    .product-details {
      flex: 1;
    }

    .product-details h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .product-metrics {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .metric {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      color: #666;
    }

    .metric mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .insights {
      grid-column: 1 / -1;
    }

    .insights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .insight-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid var(--primary-color);
    }

    .insight-icon {
      font-size: 32px !important;
      width: 32px !important;
      height: 32px !important;
    }

    .insight-icon.success {
      color: #28a745;
    }

    .insight-icon.warning {
      color: #ffc107;
    }

    .insight-icon.info {
      color: #17a2b8;
    }

    .insight-content h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .insight-content p {
      margin: 0;
      color: #666;
      font-size: 14px;
      line-height: 1.5;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #ccc;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
    }

    .empty-state p {
      margin: 0 0 20px 0;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .dashboard-header {
        flex-direction: column;
        gap: 20px;
        align-items: stretch;
      }

      .quick-actions {
        justify-content: center;
      }

      .dashboard-content {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .insight-item {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class SellerDashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0
  };

  recentOrders: RecentOrder[] = [];
  topProducts: TopProduct[] = [];
  
  displayedColumns: string[] = ['orderId', 'customer', 'product', 'amount', 'status', 'date', 'actions'];

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Mock data - replace with actual service calls
    this.stats = {
      totalProducts: 24,
      activeProducts: 22,
      totalOrders: 156,
      pendingOrders: 8,
      monthlyRevenue: 12450,
      totalRevenue: 89230,
      averageRating: 4.6,
      totalReviews: 342
    };

    this.recentOrders = [
      {
        id: 'ORD-2024-001',
        customerName: 'John Smith',
        productName: 'Premium Headphones',
        quantity: 1,
        amount: 299.99,
        status: 'Processing',
        orderDate: new Date('2024-12-05')
      },
      {
        id: 'ORD-2024-002',
        customerName: 'Sarah Johnson',
        productName: 'Smart Watch',
        quantity: 2,
        amount: 399.98,
        status: 'Shipped',
        orderDate: new Date('2024-12-04')
      },
      {
        id: 'ORD-2024-003',
        customerName: 'Mike Davis',
        productName: 'Coffee Beans',
        quantity: 3,
        amount: 74.97,
        status: 'Delivered',
        orderDate: new Date('2024-12-03')
      }
    ];

    this.topProducts = [
      {
        id: '1',
        name: 'Premium Wireless Headphones',
        sales: 45,
        revenue: 13495.55,
        rating: 4.8,
        imageUrl: 'https://via.placeholder.com/48x48?text=HP'
      },
      {
        id: '2',
        name: 'Smart Fitness Watch',
        sales: 32,
        revenue: 6399.68,
        rating: 4.5,
        imageUrl: 'https://via.placeholder.com/48x48?text=SW'
      },
      {
        id: '3',
        name: 'Organic Coffee Beans',
        sales: 89,
        revenue: 2224.11,
        rating: 4.9,
        imageUrl: 'https://via.placeholder.com/48x48?text=CB'
      }
    ];
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase().replace(' ', '-')}`;
  }

  viewOrder(orderId: string): void {
    // Navigate to order details or open modal
    console.log('View order:', orderId);
  }

  updateOrderStatus(orderId: string): void {
    // Open status update dialog
    console.log('Update order status:', orderId);
  }
}