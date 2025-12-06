import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ReviewService } from '../../core/services/review.service';
import { AuthService } from '../../core/services/auth.service';
import { Product, Review } from '../../core/models/common.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDividerModule
  ],
  template: `
    <div class="product-detail-container" *ngIf="product; else loadingTemplate">
      <!-- Breadcrumb Navigation -->
      <nav class="breadcrumb">
        <a routerLink="/products" mat-button>
          <mat-icon>arrow_back</mat-icon>
          Back to Products
        </a>
      </nav>

      <!-- Product Header -->
      <div class="product-header">
        <div class="product-images">
          <div class="main-image">
            <img [src]="selectedImage" [alt]="product.name" (click)="openImageViewer()">
            <button mat-icon-button class="zoom-btn" (click)="openImageViewer()">
              <mat-icon>zoom_in</mat-icon>
            </button>
          </div>
          <div class="image-thumbnails" *ngIf="product.images.length > 1">
            <img *ngFor="let image of product.images; let i = index"
                 [src]="image.url" 
                 [alt]="product.name"
                 [class.selected]="selectedImage === image.url"
                 (click)="selectedImage = image.url">
          </div>
        </div>

        <div class="product-info">
          <div class="product-title">
            <h1>{{ product.name }}</h1>
            <div class="product-rating">
              <div class="stars">
                <mat-icon *ngFor="let star of getStarArray(product.rating)" 
                         [class.filled]="star <= product.rating">
                  star
                </mat-icon>
              </div>
              <span class="rating-text">{{ product.rating }} ({{ product.reviewCount }} reviews)</span>
            </div>
          </div>

          <div class="product-price">
            <span class="current-price">\${{ product.price | number:'1.2-2' }}</span>
            <span *ngIf="product.originalPrice && product.originalPrice > product.price" 
                  class="original-price">
              \${{ product.originalPrice | number:'1.2-2' }}
            </span>
            <span *ngIf="getDiscountPercentage() > 0" class="discount-badge">
              {{ getDiscountPercentage() }}% OFF
            </span>
          </div>

          <div class="product-availability">
            <div class="stock-status" [class.low-stock]="product.inventory.available < product.inventory.threshold">
              <mat-icon>{{ getStockIcon() }}</mat-icon>
              <span>{{ getStockText() }}</span>
            </div>
            <p *ngIf="product.inventory.available > 0" class="delivery-info">
              <mat-icon>local_shipping</mat-icon>
              Free shipping on orders over $50
            </p>
          </div>

          <div class="product-description">
            <h3>Description</h3>
            <p>{{ product.description }}</p>
          </div>

          <div class="product-categories" *ngIf="product.category">
            <h4>Category:</h4>
            <mat-chip-set>
              <mat-chip>
                {{ product.category.name }}
              </mat-chip>
            </mat-chip-set>
          </div>

          <div class="product-actions">
            <div class="quantity-selector" *ngIf="product.inventory.available > 0">
              <label>Quantity:</label>
              <div class="quantity-controls">
                <button mat-icon-button (click)="decreaseQuantity()" [disabled]="selectedQuantity <= 1">
                  <mat-icon>remove</mat-icon>
                </button>
                <span class="quantity">{{ selectedQuantity }}</span>
                <button mat-icon-button (click)="increaseQuantity()" 
                        [disabled]="selectedQuantity >= product.inventory.available">
                  <mat-icon>add</mat-icon>
                </button>
              </div>
            </div>

            <div class="action-buttons">
              <button mat-raised-button color="primary" 
                      [disabled]="product.inventory.available === 0"
                      (click)="addToCart()" 
                      class="add-to-cart-btn">
                <mat-icon>shopping_cart</mat-icon>
                {{ product.inventory.available > 0 ? 'Add to Cart' : 'Out of Stock' }}
              </button>
              
              <button mat-raised-button color="accent" 
                      [disabled]="product.inventory.available === 0"
                      (click)="buyNow()" 
                      class="buy-now-btn">
                <mat-icon>flash_on</mat-icon>
                Buy Now
              </button>
              
              <button mat-icon-button (click)="toggleWishlist()" 
                      [class.active]="isInWishlist"
                      class="wishlist-btn">
                <mat-icon>{{ isInWishlist ? 'favorite' : 'favorite_border' }}</mat-icon>
              </button>
            </div>
          </div>

          <div class="seller-info">
            <h4>Sold by</h4>
            <div class="seller-card">
              <mat-icon>store</mat-icon>
              <div class="seller-details">
                <span class="seller-name">{{ product.sellerId || 'Store' }}</span>
                <div class="seller-rating">
                  <mat-icon class="small-star">star</mat-icon>
                  <span>4.6 seller rating</span>
                </div>
              </div>
              <button mat-button class="contact-seller-btn">Contact Seller</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Details Tabs -->
      <div class="product-details">
        <mat-tab-group>
          <mat-tab label="Specifications">
            <div class="tab-content">
              <div *ngIf="product.specifications" class="specifications">
                <div class="spec-row" *ngFor="let spec of getSpecificationEntries()">
                  <span class="spec-label">{{ spec.key }}:</span>
                  <span class="spec-value">{{ spec.value }}</span>
                </div>
              </div>
              <div *ngIf="!product.specifications" class="no-content">
                <p>No specifications available for this product.</p>
              </div>
            </div>
          </mat-tab>
          
          <mat-tab label="Reviews" [matBadge]="product.reviewCount" matBadgePosition="after">
            <div class="tab-content">
              <div class="reviews-summary">
                <div class="rating-overview">
                  <div class="average-rating">
                    <span class="rating-number">{{ product.rating }}</span>
                    <div class="stars">
                      <mat-icon *ngFor="let star of getStarArray(product.rating)" 
                               [class.filled]="star <= product.rating">
                        star
                      </mat-icon>
                    </div>
                    <span class="total-reviews">{{ product.reviewCount }} reviews</span>
                  </div>
                </div>
                
                <button mat-raised-button color="primary" 
                        *ngIf="canWriteReview()" 
                        (click)="openReviewDialog()"
                        class="write-review-btn">
                  <mat-icon>rate_review</mat-icon>
                  Write a Review
                </button>
              </div>
              
              <mat-divider></mat-divider>
              
              <div class="reviews-list" *ngIf="recentReviews.length > 0">
                <div class="review-item" *ngFor="let review of recentReviews">
                  <div class="review-header">
                    <div class="reviewer-info">
                      <span class="reviewer-name">{{ review.customerName }}</span>
                      <div class="review-rating">
                        <mat-icon *ngFor="let star of getStarArray(review.rating)" 
                                 [class.filled]="star <= review.rating"
                                 class="small-star">
                          star
                        </mat-icon>
                      </div>
                    </div>
                    <span class="review-date">{{ review.createdAt | date:'mediumDate' }}</span>
                  </div>
                  <p class="review-comment">{{ review.comment }}</p>
                  <div class="review-helpful" *ngIf="review.helpfulCount && review.helpfulCount > 0">
                    <mat-icon>thumb_up</mat-icon>
                    <span>{{ review.helpfulCount }} people found this helpful</span>
                  </div>
                </div>
              </div>
              
              <div *ngIf="recentReviews.length === 0" class="no-reviews">
                <mat-icon>rate_review</mat-icon>
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
              
              <div class="view-all-reviews" *ngIf="product.reviewCount > recentReviews.length">
                <button mat-button routerLink="/products/{{ product.id }}/reviews">
                  View All {{ product.reviewCount }} Reviews
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </div>
          </mat-tab>
          
          <mat-tab label="Shipping & Returns">
            <div class="tab-content">
              <div class="shipping-info">
                <h3>Shipping Information</h3>
                <div class="info-item">
                  <mat-icon>local_shipping</mat-icon>
                  <div>
                    <p><strong>Standard Shipping</strong></p>
                    <p>5-7 business days • FREE on orders over $50</p>
                  </div>
                </div>
                <div class="info-item">
                  <mat-icon>flash_on</mat-icon>
                  <div>
                    <p><strong>Express Shipping</strong></p>
                    <p>2-3 business days • $9.99</p>
                  </div>
                </div>
                
                <h3>Return Policy</h3>
                <div class="info-item">
                  <mat-icon>assignment_return</mat-icon>
                  <div>
                    <p><strong>30-Day Returns</strong></p>
                    <p>Free returns within 30 days of delivery. Item must be in original condition.</p>
                  </div>
                </div>
                
                <h3>Warranty</h3>
                <div class="info-item">
                  <mat-icon>verified</mat-icon>
                  <div>
                    <p><strong>Manufacturer Warranty</strong></p>
                    <p>1-year limited warranty included with purchase.</p>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>

      <!-- Related Products -->
      <div class="related-products" *ngIf="relatedProducts.length > 0">
        <h2>Related Products</h2>
        <div class="products-grid">
          <mat-card *ngFor="let relatedProduct of relatedProducts" class="product-card">
            <img mat-card-image [src]="relatedProduct.images[0]?.url" [alt]="relatedProduct.name">
            <mat-card-content>
              <h4>{{ relatedProduct.name }}</h4>
              <p class="price">\${{ relatedProduct.price | number:'1.2-2' }}</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button [routerLink]="['/products', relatedProduct.id]">View Details</button>
              <button mat-icon-button (click)="addRelatedToCart(relatedProduct)">
                <mat-icon>add_shopping_cart</mat-icon>
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </div>

    <!-- Loading Template -->
    <ng-template #loadingTemplate>
      <div class="loading-container">
        <mat-spinner diameter="60"></mat-spinner>
        <p>Loading product details...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .product-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
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

    .product-header {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }

    .product-images {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .main-image {
      position: relative;
      width: 100%;
      aspect-ratio: 1;
      border-radius: 12px;
      overflow: hidden;
      background: #f5f5f5;
    }

    .main-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      cursor: zoom-in;
    }

    .zoom-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(255, 255, 255, 0.9);
    }

    .image-thumbnails {
      display: flex;
      gap: 8px;
      overflow-x: auto;
    }

    .image-thumbnails img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 8px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.3s ease;
    }

    .image-thumbnails img.selected,
    .image-thumbnails img:hover {
      border-color: var(--primary-color);
    }

    .product-info {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .product-title h1 {
      margin: 0 0 12px 0;
      font-size: 28px;
      font-weight: 600;
      line-height: 1.3;
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .stars {
      display: flex;
      gap: 2px;
    }

    .stars mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
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

    .rating-text {
      color: #666;
      text-decoration: underline;
      cursor: pointer;
    }

    .product-price {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .current-price {
      font-size: 32px;
      font-weight: 700;
      color: var(--primary-color);
    }

    .original-price {
      font-size: 20px;
      text-decoration: line-through;
      color: #999;
    }

    .discount-badge {
      background: #e8f5e8;
      color: #2e7d2e;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .product-availability {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .stock-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      color: #4caf50;
    }

    .stock-status.low-stock {
      color: #ff9800;
    }

    .delivery-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      color: #4caf50;
      font-size: 14px;
    }

    .product-description h3 {
      margin: 0 0 12px 0;
      font-size: 18px;
    }

    .product-description p {
      margin: 0;
      line-height: 1.6;
      color: #666;
    }

    .product-categories h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 500;
    }

    .product-actions {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 24px;
      background: #f9f9f9;
      border-radius: 12px;
    }

    .quantity-selector {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 8px;
    }

    .quantity {
      min-width: 40px;
      text-align: center;
      font-weight: 500;
      font-size: 16px;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .add-to-cart-btn,
    .buy-now-btn {
      height: 48px;
      flex: 1;
      font-weight: 600;
    }

    .wishlist-btn {
      color: #666;
      transition: color 0.3s ease;
    }

    .wishlist-btn.active {
      color: #e91e63;
    }

    .seller-info {
      padding: 16px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }

    .seller-info h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #666;
    }

    .seller-card {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .seller-details {
      flex: 1;
    }

    .seller-name {
      font-weight: 500;
      display: block;
    }

    .seller-rating {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #666;
      font-size: 14px;
    }

    .contact-seller-btn {
      color: var(--primary-color);
    }

    .product-details {
      margin-bottom: 40px;
    }

    .tab-content {
      padding: 24px 0;
    }

    .specifications {
      display: grid;
      gap: 12px;
    }

    .spec-row {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 16px;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }

    .spec-label {
      font-weight: 500;
      color: #666;
    }

    .spec-value {
      color: #333;
    }

    .reviews-summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .rating-overview {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .average-rating {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .rating-number {
      font-size: 24px;
      font-weight: 600;
    }

    .total-reviews {
      color: #666;
    }

    .write-review-btn {
      height: 40px;
    }

    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-top: 24px;
    }

    .review-item {
      padding: 16px;
      border: 1px solid #eee;
      border-radius: 8px;
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .reviewer-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .reviewer-name {
      font-weight: 500;
    }

    .review-rating {
      display: flex;
    }

    .review-date {
      color: #666;
      font-size: 14px;
    }

    .review-comment {
      margin: 0 0 12px 0;
      line-height: 1.6;
    }

    .review-helpful {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 14px;
    }

    .no-content,
    .no-reviews {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .no-reviews mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #ddd;
    }

    .view-all-reviews {
      text-align: center;
      margin-top: 24px;
    }

    .shipping-info {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .shipping-info h3 {
      margin: 0 0 16px 0;
      color: var(--primary-color);
    }

    .info-item {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .info-item mat-icon {
      margin-top: 4px;
      color: var(--primary-color);
    }

    .info-item p {
      margin: 0 0 4px 0;
    }

    .related-products h2 {
      margin: 0 0 24px 0;
      text-align: center;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .product-card {
      transition: transform 0.3s ease;
    }

    .product-card:hover {
      transform: translateY(-4px);
    }

    .product-card .price {
      font-weight: 600;
      color: var(--primary-color);
      margin: 8px 0 0 0;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      gap: 20px;
    }

    @media (max-width: 768px) {
      .product-header {
        grid-template-columns: 1fr;
        gap: 24px;
      }

      .product-title h1 {
        font-size: 24px;
      }

      .current-price {
        font-size: 28px;
      }

      .action-buttons {
        flex-direction: column;
      }

      .spec-row {
        grid-template-columns: 1fr;
        gap: 4px;
      }

      .reviews-summary {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  selectedImage: string = '';
  selectedQuantity: number = 1;
  isInWishlist: boolean = false;
  recentReviews: Review[] = [];
  relatedProducts: Product[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private reviewService: ReviewService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(params => {
        const productId = params['id'];
        return this.productService.getProduct(productId);
      }),
      catchError(error => {
        console.error('Error loading product:', error);
        this.snackBar.open('Product not found', 'Close', { duration: 3000 });
        this.router.navigate(['/products']);
        return of(null);
      })
    ).subscribe(product => {
      if (product) {
        this.product = product;
        this.selectedImage = product.images[0]?.url || '';
        this.loadReviews(product.id);
        this.loadRelatedProducts(product.category?.name || '');
      }
    });
  }

  getStarArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  getDiscountPercentage(): number {
    // Simplified for now to avoid type issues
    return 0;
  }

  getStockIcon(): string {
    if (!this.product) return 'help';
    if (this.product.inventory.available === 0) return 'cancel';
    if (this.product.inventory.available < this.product.inventory.threshold) return 'warning';
    return 'check_circle';
  }

  getStockText(): string {
    if (!this.product) return '';
    if (this.product.inventory.available === 0) return 'Out of Stock';
    if (this.product.inventory.available < this.product.inventory.threshold) {
      return `Only ${this.product.inventory.available} left in stock`;
    }
    return 'In Stock';
  }

  getSpecificationEntries(): Array<{key: string, value: any}> {
    if (!this.product?.specifications) return [];
    return Object.entries(this.product.specifications)
      .map(([key, value]) => ({ key: this.formatSpecKey(key), value }));
  }

  private formatSpecKey(key: string): string {
    return key.replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

  increaseQuantity(): void {
    if (this.product && this.selectedQuantity < this.product.inventory.available) {
      this.selectedQuantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.selectedQuantity > 1) {
      this.selectedQuantity--;
    }
  }

  addToCart(): void {
    if (!this.product) return;
    
    this.cartService.addToCart(this.product, this.selectedQuantity);
    this.snackBar.open(`${this.selectedQuantity} item(s) added to cart`, 'Close', { duration: 3000 });
  }

  buyNow(): void {
    this.addToCart();
    this.router.navigate(['/cart']);
  }

  toggleWishlist(): void {
    this.isInWishlist = !this.isInWishlist;
    this.snackBar.open(this.isInWishlist ? 'Added to wishlist' : 'Removed from wishlist', 'Close', { duration: 3000 });
  }

  addRelatedToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
    this.snackBar.open(`${product.name} added to cart`, 'Close', { duration: 3000 });
  }

  openImageViewer(): void {
    // TODO: Implement image viewer modal
    console.log('Open image viewer');
  }

  canWriteReview(): boolean {
    return this.authService.isAuthenticated();
  }

  openReviewDialog(): void {
    // TODO: Implement review dialog
    console.log('Open review dialog');
  }

  private loadReviews(productId: string): void {
    // Mock recent reviews - replace with actual service call
    this.recentReviews = [
      {
        id: '1',
        productId: productId,
        customerId: 'customer1',
        customerName: 'John D.',
        rating: 5,
        comment: 'Excellent product! Great quality and fast shipping.',
        createdAt: new Date('2024-01-15'),
        helpfulCount: 12
      },
      {
        id: '2',
        productId: productId,
        customerId: 'customer2',
        customerName: 'Sarah M.',
        rating: 4,
        comment: 'Good value for money. Works as expected.',
        createdAt: new Date('2024-01-10'),
        helpfulCount: 8
      }
    ];
  }

  private loadRelatedProducts(category: string): void {
    // Simplified mock - will implement properly after server is running
    this.relatedProducts = [
      {
        id: '2',
        name: 'Smart Watch Pro',
        description: 'Advanced fitness tracking',
        price: 299.99,
        originalPrice: 349.99,
        category: { id: 'electronics', name: 'Electronics', level: 1 },
        sellerId: 'seller2',
        seller: {
          id: 'seller2',
          cognitoId: 'cognito-seller2',
          name: 'TechGear Store',
          email: 'seller@techgear.com',
          role: 'SELLER' as any,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        images: [{ id: '1', url: 'https://via.placeholder.com/400x400?text=Smart+Watch', altText: 'Smart Watch Pro', isPrimary: true, order: 1 }],
        rating: 4.3,
        reviewCount: 89,
        inventory: { available: 25, threshold: 5, reserved: 0, quantity: 25, status: 'IN_STOCK' as any },
        status: 'ACTIVE' as any,
        tags: ['electronics', 'wearable', 'fitness'],
        isActive: true,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-15')
      }
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