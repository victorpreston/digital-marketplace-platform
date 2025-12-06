import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-customer-reviews',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule,
    MatExpansionModule,
    MatDialogModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatBadgeModule
  ],
  template: `
    <div class="reviews-container">
      <!-- Header -->
      <div class="reviews-header">
        <button mat-icon-button routerLink="/customer/dashboard" class="back-btn">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-content">
          <h1>My Reviews</h1>
          <p>Manage your product reviews and ratings</p>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon color="primary">rate_review</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ totalReviews }}</h3>
                <p>Total Reviews</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon color="accent">star</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ averageRating.toFixed(1) }}</h3>
                <p>Average Rating</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon color="warn">thumb_up</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ helpfulVotes }}</h3>
                <p>Helpful Votes</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-tab-group class="reviews-tabs">
        <!-- Published Reviews Tab -->
        <mat-tab label="Published Reviews">
          <div class="tab-content">
            <!-- Filters -->
            <mat-card class="filters-card">
              <mat-card-content>
                <div class="filters-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Rating</mat-label>
                    <mat-select [(value)]="ratingFilter" (selectionChange)="applyFilters()">
                      <mat-option value="">All Ratings</mat-option>
                      <mat-option value="5">5 Stars</mat-option>
                      <mat-option value="4">4 Stars</mat-option>
                      <mat-option value="3">3 Stars</mat-option>
                      <mat-option value="2">2 Stars</mat-option>
                      <mat-option value="1">1 Star</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Sort By</mat-label>
                    <mat-select [(value)]="sortBy" (selectionChange)="applyFilters()">
                      <mat-option value="date-desc">Newest First</mat-option>
                      <mat-option value="date-asc">Oldest First</mat-option>
                      <mat-option value="rating-desc">Highest Rated</mat-option>
                      <mat-option value="rating-asc">Lowest Rated</mat-option>
                      <mat-option value="helpful-desc">Most Helpful</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Search Reviews</mat-label>
                    <input matInput [(ngModel)]="searchTerm" (input)="applyFilters()" 
                           placeholder="Product name, review text...">
                    <mat-icon matSuffix>search</mat-icon>
                  </mat-form-field>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Reviews List -->
            <div class="reviews-list">
              <mat-expansion-panel *ngFor="let review of filteredReviews" class="review-panel">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <div class="review-header-info">
                      <div class="product-info">
                        <img [src]="review.productImage" [alt]="review.productName" class="product-thumb">
                        <div>
                          <h4>{{ review.productName }}</h4>
                          <div class="review-rating">
                            <div class="stars">
                              <mat-icon *ngFor="let star of getStars(review.rating)" 
                                        [class.filled]="star"
                                        class="star">star</mat-icon>
                            </div>
                            <span class="rating-text">{{ review.rating }}/5</span>
                          </div>
                        </div>
                      </div>
                      <div class="review-meta">
                        <span class="review-date">{{ review.date | date:'mediumDate' }}</span>
                        <mat-chip [color]="review.isVerified ? 'accent' : 'basic'" 
                                  [selected]="review.isVerified">
                          {{ review.isVerified ? 'Verified Purchase' : 'Unverified' }}
                        </mat-chip>
                      </div>
                    </div>
                  </mat-panel-title>
                </mat-expansion-panel-header>

                <div class="review-details">
                  <div class="review-content">
                    <h3>{{ review.title }}</h3>
                    <p class="review-text">{{ review.content }}</p>
                    
                    <div class="review-images" *ngIf="review.images && review.images.length > 0">
                      <h4>Photos</h4>
                      <div class="images-grid">
                        <img *ngFor="let image of review.images" 
                             [src]="image" 
                             [alt]="review.productName"
                             class="review-image">
                      </div>
                    </div>
                  </div>

                  <mat-divider></mat-divider>

                  <div class="review-stats">
                    <div class="stat-item">
                      <mat-icon>thumb_up</mat-icon>
                      <span>{{ review.helpfulCount }} found this helpful</span>
                    </div>
                    <div class="stat-item">
                      <mat-icon>visibility</mat-icon>
                      <span>{{ review.views }} views</span>
                    </div>
                  </div>

                  <!-- Seller Response -->
                  <div class="seller-response" *ngIf="review.sellerResponse">
                    <h4>
                      <mat-icon>store</mat-icon>
                      Response from {{ review.sellerName }}
                    </h4>
                    <p>{{ review.sellerResponse }}</p>
                    <span class="response-date">{{ review.sellerResponseDate | date:'mediumDate' }}</span>
                  </div>

                  <div class="review-actions">
                    <button mat-button (click)="editReview(review)">
                      <mat-icon>edit</mat-icon>
                      Edit Review
                    </button>
                    <button mat-button (click)="viewProduct(review.productId)">
                      <mat-icon>visibility</mat-icon>
                      View Product
                    </button>
                    <button mat-button color="warn" (click)="deleteReview(review.id)">
                      <mat-icon>delete</mat-icon>
                      Delete Review
                    </button>
                  </div>
                </div>
              </mat-expansion-panel>
            </div>
          </div>
        </mat-tab>

        <!-- Pending Reviews Tab -->
        <mat-tab label="Pending Reviews" [matBadge]="pendingReviews.length" matBadgeColor="warn">
          <div class="tab-content">
            <div class="pending-reviews" *ngIf="pendingReviews.length > 0">
              <h2>Products waiting for your review</h2>
              <p>Help other customers by sharing your experience with these products</p>
              
              <div class="pending-list">
                <mat-card class="pending-item" *ngFor="let item of pendingReviews">
                  <mat-card-content>
                    <div class="pending-content">
                      <img [src]="item.productImage" [alt]="item.productName" class="pending-image">
                      <div class="pending-info">
                        <h3>{{ item.productName }}</h3>
                        <p class="order-info">Ordered on {{ item.orderDate | date:'mediumDate' }}</p>
                        <p class="delivery-info">Delivered {{ item.deliveredDate | date:'mediumDate' }}</p>
                      </div>
                    </div>
                  </mat-card-content>
                  <mat-card-actions>
                    <button mat-raised-button color="primary" (click)="writeReview(item)">
                      <mat-icon>rate_review</mat-icon>
                      Write Review
                    </button>
                    <button mat-button (click)="skipReview(item.id)">
                      Skip
                    </button>
                  </mat-card-actions>
                </mat-card>
              </div>
            </div>

            <div class="empty-state" *ngIf="pendingReviews.length === 0">
              <mat-icon>check_circle</mat-icon>
              <h2>All caught up!</h2>
              <p>You don't have any products waiting for reviews.</p>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>

      <!-- Empty State for No Reviews -->
      <div class="empty-state" *ngIf="totalReviews === 0">
        <mat-icon>rate_review</mat-icon>
        <h2>No reviews yet</h2>
        <p>Start reviewing products you've purchased to help other customers make informed decisions.</p>
        <button mat-raised-button color="primary" routerLink="/customer/orders">
          <mat-icon>shopping_bag</mat-icon>
          View Your Orders
        </button>
      </div>
    </div>
  `,
  styles: [`
    .reviews-container {
      padding: 24px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .reviews-header {
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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

    .reviews-tabs {
      width: 100%;
    }

    .tab-content {
      padding: 24px 0;
    }

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .review-panel {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .review-header-info {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .product-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .product-thumb {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 8px;
    }

    .product-info h4 {
      margin: 0;
      font-weight: 500;
      color: #333;
    }

    .review-rating {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
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

    .rating-text {
      font-size: 0.9rem;
      color: #666;
    }

    .review-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }

    .review-date {
      font-size: 0.9rem;
      color: #666;
    }

    .review-details {
      padding: 24px;
    }

    .review-content h3 {
      margin: 0 0 12px 0;
      color: #333;
    }

    .review-text {
      line-height: 1.6;
      color: #666;
      margin-bottom: 16px;
    }

    .review-images h4 {
      margin: 16px 0 8px 0;
      color: #333;
    }

    .images-grid {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .review-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .review-image:hover {
      transform: scale(1.1);
    }

    .review-stats {
      display: flex;
      gap: 24px;
      margin: 16px 0;
      padding: 16px 0;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 0.9rem;
    }

    .stat-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #1976d2;
    }

    .seller-response {
      background-color: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin: 16px 0;
    }

    .seller-response h4 {
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #333;
    }

    .seller-response p {
      margin: 0 0 8px 0;
      color: #666;
    }

    .response-date {
      font-size: 0.8rem;
      color: #999;
    }

    .review-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-top: 16px;
    }

    .review-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pending-reviews h2 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .pending-reviews p {
      margin: 0 0 24px 0;
      color: #666;
    }

    .pending-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .pending-item {
      transition: transform 0.2s ease;
    }

    .pending-item:hover {
      transform: translateY(-2px);
    }

    .pending-content {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .pending-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 8px;
    }

    .pending-info h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .order-info,
    .delivery-info {
      margin: 4px 0;
      font-size: 0.9rem;
      color: #666;
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

    /* Responsive Design */
    @media (max-width: 768px) {
      .reviews-container {
        padding: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .filters-row {
        grid-template-columns: 1fr;
      }

      .review-header-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .review-meta {
        align-items: flex-start;
      }

      .review-actions {
        flex-direction: column;
      }

      .pending-content {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class CustomerReviewsComponent implements OnInit {
  totalReviews = 5;
  averageRating = 4.2;
  helpfulVotes = 23;
  
  ratingFilter = '';
  sortBy = 'date-desc';
  searchTerm = '';
  
  reviews: any[] = [];
  filteredReviews: any[] = [];
  pendingReviews: any[] = [];

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadReviews();
    this.loadPendingReviews();
  }

  loadReviews() {
    // Mock data - replace with actual service call
    this.reviews = [
      {
        id: 1,
        productId: 101,
        productName: 'Wireless Noise Cancelling Headphones',
        productImage: 'assets/images/headphones.jpg',
        rating: 5,
        title: 'Excellent sound quality and comfort',
        content: 'These headphones exceeded my expectations. The noise cancellation is fantastic, and they are very comfortable for long listening sessions. Battery life is also impressive.',
        date: new Date('2024-11-15'),
        isVerified: true,
        helpfulCount: 12,
        views: 156,
        images: ['assets/images/review1.jpg', 'assets/images/review2.jpg'],
        sellerName: 'TechGear Store',
        sellerResponse: 'Thank you for the wonderful review! We\'re glad you\'re enjoying the headphones.',
        sellerResponseDate: new Date('2024-11-17')
      },
      {
        id: 2,
        productId: 102,
        productName: 'Bluetooth Speaker',
        productImage: 'assets/images/speaker.jpg',
        rating: 4,
        title: 'Good sound, portable design',
        content: 'Great speaker for outdoor activities. The sound is clear and bass is decent. Only wish it was a bit louder.',
        date: new Date('2024-10-28'),
        isVerified: true,
        helpfulCount: 8,
        views: 89,
        images: [],
        sellerName: null,
        sellerResponse: null,
        sellerResponseDate: null
      }
    ];
    
    this.applyFilters();
  }

  loadPendingReviews() {
    // Mock data - replace with actual service call
    this.pendingReviews = [
      {
        id: 1,
        productId: 103,
        productName: 'Laptop Stand',
        productImage: 'assets/images/laptop-stand.jpg',
        orderDate: new Date('2024-11-20'),
        deliveredDate: new Date('2024-11-25')
      },
      {
        id: 2,
        productId: 104,
        productName: 'Wireless Mouse',
        productImage: 'assets/images/mouse.jpg',
        orderDate: new Date('2024-11-18'),
        deliveredDate: new Date('2024-11-22')
      }
    ];
  }

  applyFilters() {
    let filtered = [...this.reviews];

    // Apply rating filter
    if (this.ratingFilter) {
      filtered = filtered.filter(review => review.rating === parseInt(this.ratingFilter));
    }

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(review =>
        review.productName.toLowerCase().includes(term) ||
        review.title.toLowerCase().includes(term) ||
        review.content.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'rating-desc':
          return b.rating - a.rating;
        case 'rating-asc':
          return a.rating - b.rating;
        case 'helpful-desc':
          return b.helpfulCount - a.helpfulCount;
        case 'date-desc':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    this.filteredReviews = filtered;
  }

  getStars(rating: number): boolean[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating);
    }
    return stars;
  }

  editReview(review: any) {
    console.log('Edit review:', review);
    this.snackBar.open('Edit review functionality coming soon!', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  deleteReview(reviewId: number) {
    const review = this.reviews.find(r => r.id === reviewId);
    this.reviews = this.reviews.filter(r => r.id !== reviewId);
    this.applyFilters();
    this.totalReviews--;
    
    this.snackBar.open('Review deleted', 'Undo', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    }).onAction().subscribe(() => {
      this.reviews.push(review);
      this.applyFilters();
      this.totalReviews++;
    });
  }

  viewProduct(productId: number) {
    console.log('View product:', productId);
    // Navigate to product page
  }

  writeReview(item: any) {
    console.log('Write review for:', item);
    this.snackBar.open('Write review functionality coming soon!', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  skipReview(itemId: number) {
    this.pendingReviews = this.pendingReviews.filter(item => item.id !== itemId);
    this.snackBar.open('Review skipped', 'Close', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}