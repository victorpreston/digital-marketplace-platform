import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    growth: number;
  };
  orders: {
    current: number;
    previous: number;
    growth: number;
  };
  products: {
    current: number;
    previous: number;
    growth: number;
  };
  avgOrderValue: {
    current: number;
    previous: number;
    growth: number;
  };
}

interface ProductPerformance {
  id: string;
  name: string;
  views: number;
  orders: number;
  revenue: number;
  conversionRate: number;
  rating: number;
  trend: 'up' | 'down' | 'stable';
}

@Component({
  selector: 'app-seller-analytics',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTabsModule,
    MatTableModule,
    MatProgressBarModule
  ],
  template: `
    <div class="analytics-container">
      <!-- Header -->
      <div class="analytics-header">
        <div class="header-content">
          <div class="title-section">
            <h1>Business Analytics</h1>
            <p>Track your sales performance and business insights</p>
          </div>
          <div class="period-selector">
            <mat-form-field appearance="outline">
              <mat-label>Time Period</mat-label>
              <mat-select [formControl]="periodControl">
                <mat-option value="7d">Last 7 Days</mat-option>
                <mat-option value="30d">Last 30 Days</mat-option>
                <mat-option value="90d">Last 90 Days</mat-option>
                <mat-option value="1y">Last Year</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="metrics-grid">
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-content">
              <div class="metric-icon revenue">
                <mat-icon>attach_money</mat-icon>
              </div>
              <div class="metric-details">
                <h3>\${{ analytics.revenue.current | number:'1.0-0' }}</h3>
                <p>Total Revenue</p>
                <div class="growth-indicator" [class]="getGrowthClass(analytics.revenue.growth)">
                  <mat-icon>{{ getGrowthIcon(analytics.revenue.growth) }}</mat-icon>
                  <span>{{ analytics.revenue.growth }}%</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-content">
              <div class="metric-icon orders">
                <mat-icon>shopping_cart</mat-icon>
              </div>
              <div class="metric-details">
                <h3>{{ analytics.orders.current }}</h3>
                <p>Total Orders</p>
                <div class="growth-indicator" [class]="getGrowthClass(analytics.orders.growth)">
                  <mat-icon>{{ getGrowthIcon(analytics.orders.growth) }}</mat-icon>
                  <span>{{ analytics.orders.growth }}%</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-content">
              <div class="metric-icon products">
                <mat-icon>inventory</mat-icon>
              </div>
              <div class="metric-details">
                <h3>{{ analytics.products.current }}</h3>
                <p>Active Products</p>
                <div class="growth-indicator" [class]="getGrowthClass(analytics.products.growth)">
                  <mat-icon>{{ getGrowthIcon(analytics.products.growth) }}</mat-icon>
                  <span>{{ analytics.products.growth }}%</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-content">
              <div class="metric-icon avg-order">
                <mat-icon>trending_up</mat-icon>
              </div>
              <div class="metric-details">
                <h3>\${{ analytics.avgOrderValue.current | number:'1.2-2' }}</h3>
                <p>Avg Order Value</p>
                <div class="growth-indicator" [class]="getGrowthClass(analytics.avgOrderValue.growth)">
                  <mat-icon>{{ getGrowthIcon(analytics.avgOrderValue.growth) }}</mat-icon>
                  <span>{{ analytics.avgOrderValue.growth }}%</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Charts Placeholder -->
      <div class="charts-section">
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Revenue Trend</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="chart-placeholder">
              <mat-icon>bar_chart</mat-icon>
              <h3>Revenue Chart</h3>
              <p>Chart implementation would go here using libraries like Chart.js or D3.js</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Order Status Distribution</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="chart-placeholder">
              <mat-icon>pie_chart</mat-icon>
              <h3>Order Status Chart</h3>
              <p>Pie chart showing order status distribution</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Product Performance -->
      <div class="product-performance-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Product Performance</mat-card-title>
            <div class="card-header-actions">
              <button mat-button routerLink="/seller/products">
                View All Products
              </button>
            </div>
          </mat-card-header>
          <mat-card-content>
            <div class="table-container">
              <table mat-table [dataSource]="productPerformance" class="performance-table">
                
                <!-- Product Column -->
                <ng-container matColumnDef="product">
                  <th mat-header-cell *matHeaderCellDef>Product</th>
                  <td mat-cell *matCellDef="let product">
                    <div class="product-cell">
                      <span class="product-name">{{ product.name }}</span>
                      <div class="trend-indicator" [class]="product.trend">
                        <mat-icon>{{ getTrendIcon(product.trend) }}</mat-icon>
                      </div>
                    </div>
                  </td>
                </ng-container>

                <!-- Views Column -->
                <ng-container matColumnDef="views">
                  <th mat-header-cell *matHeaderCellDef>Views</th>
                  <td mat-cell *matCellDef="let product">
                    {{ product.views | number }}
                  </td>
                </ng-container>

                <!-- Orders Column -->
                <ng-container matColumnDef="orders">
                  <th mat-header-cell *matHeaderCellDef>Orders</th>
                  <td mat-cell *matCellDef="let product">
                    {{ product.orders }}
                  </td>
                </ng-container>

                <!-- Conversion Rate Column -->
                <ng-container matColumnDef="conversion">
                  <th mat-header-cell *matHeaderCellDef>Conversion</th>
                  <td mat-cell *matCellDef="let product">
                    <div class="conversion-cell">
                      <span>{{ product.conversionRate }}%</span>
                      <mat-progress-bar 
                        [value]="product.conversionRate" 
                        [color]="getConversionColor(product.conversionRate)">
                      </mat-progress-bar>
                    </div>
                  </td>
                </ng-container>

                <!-- Revenue Column -->
                <ng-container matColumnDef="revenue">
                  <th mat-header-cell *matHeaderCellDef>Revenue</th>
                  <td mat-cell *matCellDef="let product">
                    <span class="revenue-amount">\${{ product.revenue | number:'1.0-0' }}</span>
                  </td>
                </ng-container>

                <!-- Rating Column -->
                <ng-container matColumnDef="rating">
                  <th mat-header-cell *matHeaderCellDef>Rating</th>
                  <td mat-cell *matCellDef="let product">
                    <div class="rating-cell">
                      <mat-icon class="star">star</mat-icon>
                      <span>{{ product.rating }}</span>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="performanceColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: performanceColumns;"></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Quick Insights -->
      <div class="insights-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Business Insights</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="insights-grid">
              <div class="insight-item success">
                <mat-icon class="insight-icon">trending_up</mat-icon>
                <div class="insight-content">
                  <h4>Strong Performance</h4>
                  <p>Your top 3 products are driving 60% of your revenue. Consider promoting similar products.</p>
                </div>
              </div>
              
              <div class="insight-item warning">
                <mat-icon class="insight-icon">trending_down</mat-icon>
                <div class="insight-content">
                  <h4>Conversion Opportunity</h4>
                  <p>Some products have high views but low conversion. Consider improving product descriptions or pricing.</p>
                </div>
              </div>
              
              <div class="insight-item info">
                <mat-icon class="insight-icon">schedule</mat-icon>
                <div class="insight-content">
                  <h4>Peak Sales Time</h4>
                  <p>Your sales peak on weekends. Consider running special promotions during these periods.</p>
                </div>
              </div>
              
              <div class="insight-item neutral">
                <mat-icon class="insight-icon">inventory_2</mat-icon>
                <div class="insight-content">
                  <h4>Inventory Management</h4>
                  <p>2 products are running low on stock. Restock to avoid lost sales opportunities.</p>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .analytics-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
      background: #f5f5f5;
      min-height: 100vh;
    }

    .analytics-header {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 32px;
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

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .metric-card {
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .metric-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 8px;
    }

    .metric-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .metric-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: white;
    }

    .metric-icon.revenue {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .metric-icon.orders {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .metric-icon.products {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .metric-icon.avg-order {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    .metric-details {
      flex: 1;
    }

    .metric-details h3 {
      margin: 0 0 4px 0;
      font-size: 32px;
      font-weight: 700;
      color: #333;
    }

    .metric-details p {
      margin: 0 0 8px 0;
      font-size: 16px;
      color: #666;
      font-weight: 500;
    }

    .growth-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      font-weight: 600;
    }

    .growth-indicator mat-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }

    .growth-indicator.positive {
      color: #28a745;
    }

    .growth-indicator.negative {
      color: #dc3545;
    }

    .growth-indicator.neutral {
      color: #666;
    }

    .charts-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }

    .chart-card {
      border-radius: 12px;
    }

    .chart-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      background: #f8f9fa;
      border-radius: 8px;
      border: 2px dashed #dee2e6;
    }

    .chart-placeholder mat-icon {
      font-size: 64px !important;
      width: 64px !important;
      height: 64px !important;
      color: #6c757d;
      margin-bottom: 16px;
    }

    .chart-placeholder h3 {
      margin: 0 0 8px 0;
      color: #495057;
    }

    .chart-placeholder p {
      margin: 0;
      color: #6c757d;
      font-size: 14px;
    }

    .product-performance-section,
    .insights-section {
      margin-bottom: 32px;
    }

    .product-performance-section mat-card,
    .insights-section mat-card {
      border-radius: 12px;
    }

    .card-header-actions {
      margin-left: auto;
    }

    .table-container {
      overflow-x: auto;
    }

    .performance-table {
      width: 100%;
    }

    .product-cell {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .product-name {
      font-weight: 500;
    }

    .trend-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
    }

    .trend-indicator.up {
      background: #d4edda;
      color: #155724;
    }

    .trend-indicator.down {
      background: #f8d7da;
      color: #721c24;
    }

    .trend-indicator.stable {
      background: #e2e3e5;
      color: #495057;
    }

    .trend-indicator mat-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }

    .conversion-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 100px;
    }

    .conversion-cell mat-progress-bar {
      height: 6px;
    }

    .revenue-amount {
      font-weight: 600;
      color: var(--primary-color);
    }

    .rating-cell {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .rating-cell .star {
      color: #ffc107;
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }

    .insights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .insight-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid;
    }

    .insight-item.success {
      background: #f8f9fa;
      border-left-color: #28a745;
    }

    .insight-item.warning {
      background: #fffef7;
      border-left-color: #ffc107;
    }

    .insight-item.info {
      background: #f1f8ff;
      border-left-color: #17a2b8;
    }

    .insight-item.neutral {
      background: #f8f9fa;
      border-left-color: #6c757d;
    }

    .insight-icon {
      font-size: 32px !important;
      width: 32px !important;
      height: 32px !important;
      flex-shrink: 0;
      margin-top: 4px;
    }

    .insight-item.success .insight-icon {
      color: #28a745;
    }

    .insight-item.warning .insight-icon {
      color: #ffc107;
    }

    .insight-item.info .insight-icon {
      color: #17a2b8;
    }

    .insight-item.neutral .insight-icon {
      color: #6c757d;
    }

    .insight-content h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .insight-content p {
      margin: 0;
      color: #666;
      font-size: 14px;
      line-height: 1.5;
    }

    @media (max-width: 768px) {
      .analytics-container {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        gap: 20px;
        align-items: stretch;
      }

      .charts-section {
        grid-template-columns: 1fr;
      }

      .metrics-grid {
        grid-template-columns: 1fr;
      }

      .insights-grid {
        grid-template-columns: 1fr;
      }

      .insight-item {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class SellerAnalyticsComponent implements OnInit {
  periodControl = new FormControl('30d');
  
  analytics: AnalyticsData = {
    revenue: { current: 0, previous: 0, growth: 0 },
    orders: { current: 0, previous: 0, growth: 0 },
    products: { current: 0, previous: 0, growth: 0 },
    avgOrderValue: { current: 0, previous: 0, growth: 0 }
  };

  productPerformance: ProductPerformance[] = [];
  performanceColumns: string[] = ['product', 'views', 'orders', 'conversion', 'revenue', 'rating'];

  ngOnInit(): void {
    this.loadAnalyticsData();
    this.loadProductPerformance();
    
    this.periodControl.valueChanges.subscribe(() => {
      this.loadAnalyticsData();
    });
  }

  private loadAnalyticsData(): void {
    // Mock data - replace with actual service call
    this.analytics = {
      revenue: { current: 42850, previous: 38200, growth: 12.2 },
      orders: { current: 156, previous: 142, growth: 9.9 },
      products: { current: 24, previous: 22, growth: 9.1 },
      avgOrderValue: { current: 274.68, previous: 269.01, growth: 2.1 }
    };
  }

  private loadProductPerformance(): void {
    // Mock data - replace with actual service call
    this.productPerformance = [
      {
        id: '1',
        name: 'Premium Wireless Headphones',
        views: 2847,
        orders: 45,
        revenue: 13495,
        conversionRate: 1.58,
        rating: 4.8,
        trend: 'up'
      },
      {
        id: '2',
        name: 'Smart Fitness Watch',
        views: 1923,
        orders: 32,
        revenue: 6396,
        conversionRate: 1.66,
        rating: 4.5,
        trend: 'up'
      },
      {
        id: '3',
        name: 'Organic Coffee Beans',
        views: 3421,
        orders: 89,
        revenue: 2223,
        conversionRate: 2.60,
        rating: 4.9,
        trend: 'stable'
      }
    ];
  }

  getGrowthClass(growth: number): string {
    if (growth > 0) return 'positive';
    if (growth < 0) return 'negative';
    return 'neutral';
  }

  getGrowthIcon(growth: number): string {
    if (growth > 0) return 'trending_up';
    if (growth < 0) return 'trending_down';
    return 'trending_flat';
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return 'arrow_upward';
      case 'down': return 'arrow_downward';
      default: return 'remove';
    }
  }

  getConversionColor(rate: number): 'primary' | 'accent' | 'warn' {
    if (rate > 2) return 'primary';
    if (rate > 1) return 'accent';
    return 'warn';
  }
}