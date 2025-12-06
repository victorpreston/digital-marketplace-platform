import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ReviewService } from '../../core/services/review.service';
import { AuthService } from '../../core/services/auth.service';
import { Review } from '../../core/models/common.model';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSnackBarModule
  ],
  template: `
    <div class="reviews-container">
      <div class="reviews-header">
        <nav class="breadcrumb">
          <a [routerLink]="['/products', productId]" mat-button>
            <mat-icon>arrow_back</mat-icon>
            Back to Product
          </a>
        </nav>
        
        <h1>Customer Reviews</h1>
        <div class="reviews-stats" *ngIf="totalReviews > 0">
          <div class="average-rating">
            <span class="rating-number">{{ averageRating }}</span>
            <div class="stars">
              <mat-icon *ngFor="let star of getStarArray(averageRating)" 
                       [class.filled]="star <= averageRating">
                star
              </mat-icon>
            </div>
            <span class="total-reviews">{{ totalReviews }} reviews</span>
          </div>
          
          <div class="rating-breakdown">
            <div class="rating-bar" *ngFor="let item of ratingBreakdown">
              <span class="stars-count">{{ item.stars }}</span>
              <mat-icon class="star-icon">star</mat-icon>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="item.percentage"></div>
              </div>
              <span class="count">{{ item.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner diameter="60"></mat-spinner>
        <p>Loading reviews...</p>
      </div>

      <!-- Reviews List -->
      <div *ngIf="!isLoading && reviews.length > 0" class="reviews-content">
        <div class="filters-section">
          <h3>Filter Reviews</h3>
          <div class="filter-buttons">
            <button mat-button 
                    [class.active]="selectedRating === 0"
                    (click)="filterByRating(0)">
              All Reviews
            </button>
            <button mat-button 
                    *ngFor="let rating of [5,4,3,2,1]"
                    [class.active]="selectedRating === rating"
                    (click)="filterByRating(rating)">
              {{ rating }} 
              <mat-icon class="small-star">star</mat-icon>
            </button>
          </div>
        </div>
        
        <mat-divider></mat-divider>
        
        <div class="reviews-list">
          <div class="review-item" *ngFor="let review of reviews">
            <div class="review-header">
              <div class="reviewer-info">
                <div class="reviewer-avatar">
                  <mat-icon>person</mat-icon>
                </div>
                <div class="reviewer-details">
                  <span class="reviewer-name">{{ review.customerName }}</span>
                  <div class="review-rating">
                    <mat-icon *ngFor="let star of getStarArray(review.rating)" 
                             [class.filled]="star <= review.rating"
                             class="small-star">
                      star
                    </mat-icon>
                  </div>
                </div>
              </div>
              <div class="review-date">
                <span>{{ review.createdAt | date:'mediumDate' }}</span>
                <button mat-icon-button class="more-options">
                  <mat-icon>more_vert</mat-icon>
                </button>
              </div>
            </div>
            
            <div class="review-content">
              <p class="review-comment">{{ review.comment }}</p>
              
              <!-- Review Images (if any) -->
              <div class="review-images" *ngIf="review.images?.length">
                <img *ngFor="let image of review.images" 
                     [src]="image" 
                     [alt]="'Review image'"
                     class="review-image"
                     (click)="openImageViewer(image)">
              </div>
            </div>
            
            <div class="review-actions">
              <button mat-button class="helpful-btn" (click)="markHelpful(review.id)">
                <mat-icon>thumb_up</mat-icon>
                Helpful ({{ review.helpfulCount || 0 }})
              </button>
              
              <button mat-button class="reply-btn" *ngIf="canReply()">
                <mat-icon>reply</mat-icon>
                Reply
              </button>
              
              <button mat-button color="warn" 
                      *ngIf="canReportReview()"
                      class="report-btn"
                      (click)="reportReview(review.id)">
                <mat-icon>flag</mat-icon>
                Report
              </button>
            </div>
            
            <!-- Seller Reply (if any) -->
            <div class="seller-reply" *ngIf="review.sellerReply">
              <div class="reply-header">
                <mat-icon>store</mat-icon>
                <span class="reply-label">Response from seller</span>
                <span class="reply-date">{{ review.sellerReply.createdAt | date:'mediumDate' }}</span>
              </div>
              <p class="reply-content">{{ review.sellerReply.message }}</p>
            </div>
          </div>
        </div>
        
        <!-- Pagination -->
        <mat-paginator
          *ngIf="totalReviews > pageSize"
          [length]="totalReviews"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 20, 50]"
          [pageIndex]="currentPage"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && reviews.length === 0" class="empty-reviews">
        <mat-card>
          <mat-card-content>
            <div class="empty-content">
              <mat-icon class="empty-icon">rate_review</mat-icon>
              <h2>No Reviews Yet</h2>
              <p *ngIf="selectedRating === 0">This product hasn't received any reviews yet.</p>
              <p *ngIf="selectedRating > 0">No {{ selectedRating }}-star reviews found.</p>
              <button mat-raised-button color="primary" 
                      *ngIf="canWriteReview()" 
                      (click)="writeReview()">
                <mat-icon>rate_review</mat-icon>
                Write the First Review
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .reviews-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }

    .reviews-header {
      margin-bottom: 30px;
    }

    .breadcrumb {
      margin-bottom: 20px;
    }

    .breadcrumb a {
      display: flex;
      align-items: center;
      gap: 4px;
      text-decoration: none;
      color: var(--primary-color);
    }

    .reviews-header h1 {
      margin: 0 0 20px 0;
      color: var(--primary-color);
    }

    .reviews-stats {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 40px;
      align-items: center;
    }

    .average-rating {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .rating-number {
      font-size: 48px;
      font-weight: 700;
      color: var(--primary-color);
    }

    .stars {
      display: flex;
      gap: 2px;
    }

    .stars mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #ddd;
    }

    .stars mat-icon.filled {
      color: #ffa726;
    }

    .small-star {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }

    .total-reviews {
      color: #666;
      font-size: 16px;
    }

    .rating-breakdown {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .rating-bar {
      display: grid;
      grid-template-columns: auto auto 1fr auto;
      gap: 12px;
      align-items: center;
    }

    .stars-count {
      font-weight: 500;
    }

    .star-icon {
      color: #ffa726;
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }

    .progress-bar {
      height: 8px;
      background: #eee;
      border-radius: 4px;
      overflow: hidden;
      min-width: 200px;
    }

    .progress-fill {
      height: 100%;
      background: var(--primary-color);
      transition: width 0.3s ease;
    }

    .count {
      color: #666;
      font-size: 14px;
      min-width: 30px;
      text-align: right;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      gap: 20px;
    }

    .filters-section {
      margin-bottom: 20px;
    }

    .filters-section h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
    }

    .filter-buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .filter-buttons button {
      border: 1px solid #ddd;
      transition: all 0.3s ease;
    }

    .filter-buttons button.active {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    .filter-buttons button:hover:not(.active) {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin: 24px 0;
    }

    .review-item {
      padding: 24px;
      border: 1px solid #eee;
      border-radius: 12px;
      background: white;
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .reviewer-info {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .reviewer-avatar {
      width: 40px;
      height: 40px;
      background: var(--primary-color);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .reviewer-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .reviewer-name {
      font-weight: 600;
      font-size: 16px;
    }

    .review-rating {
      display: flex;
    }

    .review-date {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 14px;
    }

    .review-content {
      margin-bottom: 16px;
    }

    .review-comment {
      margin: 0 0 16px 0;
      line-height: 1.6;
      font-size: 16px;
    }

    .review-images {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .review-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 8px;
      cursor: pointer;
      border: 1px solid #ddd;
      transition: transform 0.3s ease;
    }

    .review-image:hover {
      transform: scale(1.05);
    }

    .review-actions {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .helpful-btn,
    .reply-btn,
    .report-btn {
      font-size: 14px;
    }

    .helpful-btn {
      color: var(--primary-color);
    }

    .reply-btn {
      color: var(--accent-color);
    }

    .seller-reply {
      margin-top: 16px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid var(--primary-color);
    }

    .reply-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 14px;
      color: #666;
    }

    .reply-label {
      font-weight: 600;
      color: var(--primary-color);
    }

    .reply-content {
      margin: 0;
      line-height: 1.5;
    }

    .empty-reviews {
      display: flex;
      justify-content: center;
      margin-top: 40px;
    }

    .empty-content {
      text-align: center;
      padding: 60px 40px;
    }

    .empty-icon {
      font-size: 120px;
      width: 120px;
      height: 120px;
      color: #ddd;
      margin-bottom: 20px;
    }

    .empty-content h2 {
      margin: 0 0 12px 0;
      color: #666;
    }

    .empty-content p {
      margin: 0 0 24px 0;
      color: #999;
    }

    @media (max-width: 768px) {
      .reviews-stats {
        grid-template-columns: 1fr;
        gap: 24px;
      }

      .rating-number {
        font-size: 36px;
      }

      .average-rating {
        justify-content: center;
      }

      .progress-bar {
        min-width: 150px;
      }

      .filter-buttons {
        justify-content: center;
      }

      .review-header {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
      }

      .review-actions {
        justify-content: center;
      }

      .reviewer-info {
        justify-content: center;
      }
    }
  `]
})
export class ProductReviewsComponent implements OnInit {
  productId: string = '';
  reviews: Review[] = [];
  totalReviews: number = 0;
  averageRating: number = 0;
  ratingBreakdown: Array<{stars: number, count: number, percentage: number}> = [];
  selectedRating: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private reviewService: ReviewService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(params => {
        this.productId = params['id'];
        return this.loadReviews();
      }),
      catchError(error => {
        console.error('Error loading reviews:', error);
        this.showSnackBar('Failed to load reviews');
        return of([]);
      })
    ).subscribe(reviews => {
      this.reviews = reviews;
      this.isLoading = false;
      this.calculateStats();
    });
  }

  getStarArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  filterByRating(rating: number): void {
    this.selectedRating = rating;
    this.currentPage = 0;
    this.loadReviews();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadReviews();
  }

  markHelpful(reviewId: string): void {
    // TODO: Implement mark helpful functionality
    this.showSnackBar('Thank you for your feedback!');
  }

  canReply(): boolean {
    // Only sellers can reply to reviews
    const user = this.authService.getCurrentUser();
    return user?.role === 'SELLER';
  }

  canReportReview(): boolean {
    return this.authService.isAuthenticated();
  }

  canWriteReview(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'CUSTOMER';
  }

  reportReview(reviewId: string): void {
    // TODO: Implement report review functionality
    this.showSnackBar('Review reported. Thank you for your feedback.');
  }

  writeReview(): void {
    // TODO: Navigate to write review component or open dialog
    this.showSnackBar('Write review functionality coming soon!');
  }

  openImageViewer(imageUrl: string): void {
    // TODO: Implement image viewer modal
    console.log('Open image viewer for:', imageUrl);
  }

  private loadReviews(): Observable<Review[]> {
    this.isLoading = true;
    
    // Mock reviews data - replace with actual service call
    const mockReviews: Review[] = [
      {
        id: '1',
        productId: this.productId,
        customerId: 'customer1',
        customerName: 'John D.',
        rating: 5,
        comment: 'Excellent product! Great quality and fast shipping. Would definitely recommend to others.',
        createdAt: new Date('2024-01-15'),
        helpfulCount: 12
      },
      {
        id: '2',
        productId: this.productId,
        customerId: 'customer2',
        customerName: 'Sarah M.',
        rating: 4,
        comment: 'Good value for money. Works as expected. Only minor issue is the packaging could be better.',
        createdAt: new Date('2024-01-10'),
        helpfulCount: 8
      },
      {
        id: '3',
        productId: this.productId,
        customerId: 'customer3',
        customerName: 'Mike R.',
        rating: 5,
        comment: 'Amazing quality! Exceeded my expectations. Fast delivery and great customer service.',
        createdAt: new Date('2024-01-08'),
        helpfulCount: 15
      },
      {
        id: '4',
        productId: this.productId,
        customerId: 'customer4',
        customerName: 'Lisa K.',
        rating: 3,
        comment: 'Product is okay, but not as described. The color was different from the photos.',
        createdAt: new Date('2024-01-05'),
        helpfulCount: 3
      }
    ];

    // Filter by rating if selected
    const filteredReviews = this.selectedRating > 0 
      ? mockReviews.filter(review => review.rating === this.selectedRating)
      : mockReviews;

    // Paginate results
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

    this.totalReviews = filteredReviews.length;

    return of(paginatedReviews);
  }

  private calculateStats(): void {
    if (this.totalReviews === 0) return;

    // Calculate average rating from all reviews (not just current page)
    const allRatings = [5, 4, 5, 3]; // Mock data - should come from service
    this.averageRating = allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length;

    // Calculate rating breakdown
    this.ratingBreakdown = [
      { stars: 5, count: 2, percentage: 50 },
      { stars: 4, count: 1, percentage: 25 },
      { stars: 3, count: 1, percentage: 25 },
      { stars: 2, count: 0, percentage: 0 },
      { stars: 1, count: 0, percentage: 0 }
    ];
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}