import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { 
  Review, 
  ReviewSearchRequest, 
  ReviewSearchResponse, 
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewSummary
} from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly endpoint = '/reviews';

  constructor(private apiService: ApiService) {}

  // Create new review (customer only)
  createReview(reviewData: CreateReviewRequest): Observable<Review> {
    return this.apiService.post<Review>(this.endpoint, reviewData);
  }

  // Get review by ID
  getReview(id: string): Observable<Review> {
    return this.apiService.get<Review>(`${this.endpoint}/${id}`);
  }

  // Update review (customer only)
  updateReview(id: string, reviewData: UpdateReviewRequest): Observable<Review> {
    return this.apiService.put<Review>(`${this.endpoint}/${id}`, reviewData);
  }

  // Delete review (customer only)
  deleteReview(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  // Get reviews for a product
  getProductReviews(productId: string, page = 0, size = 20): Observable<ReviewSearchResponse> {
    return this.apiService.get<ReviewSearchResponse>(`/products/${productId}/reviews`, { page, size });
  }

  // Get customer reviews
  getCustomerReviews(customerId: string, page = 0, size = 20): Observable<ReviewSearchResponse> {
    return this.apiService.get<ReviewSearchResponse>(`/customers/${customerId}/reviews`, { page, size });
  }

  // Search/filter reviews
  searchReviews(searchRequest: ReviewSearchRequest = {}): Observable<ReviewSearchResponse> {
    return this.apiService.get<ReviewSearchResponse>(`${this.endpoint}/search`, searchRequest);
  }

  // Get review summary for a product
  getProductReviewSummary(productId: string): Observable<ReviewSummary> {
    return this.apiService.get<ReviewSummary>(`/products/${productId}/reviews/summary`);
  }

  // Get public reviews (approved only)
  getPublicReviews(productId: string, page = 0, size = 20): Observable<ReviewSearchResponse> {
    return this.apiService.get<ReviewSearchResponse>(`/public/products/${productId}/reviews`, { page, size });
  }

  // Moderate review (admin only)
  moderateReview(id: string, approved: boolean): Observable<Review> {
    return this.apiService.patch<Review>(`${this.endpoint}/${id}/moderate`, { approved });
  }

  // Get recent reviews for seller dashboard
  getRecentReviews(sellerId: string, limit = 10): Observable<Review[]> {
    return this.apiService.get<Review[]>(`/sellers/${sellerId}/reviews/recent`, { limit });
  }

  // Check if customer can review product
  canReviewProduct(productId: string, customerId: string): Observable<boolean> {
    return this.apiService.get<boolean>(`/products/${productId}/can-review`, { customerId });
  }
}