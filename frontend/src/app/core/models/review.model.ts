export interface Review {
  id: string;
  productId: string;
  product?: Product;
  customerId: string;
  customer?: User;
  orderId: string;
  rating: number;
  comment?: string;
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface CreateReviewRequest {
  productId: string;
  orderId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

export interface ReviewSearchRequest {
  productId?: string;
  customerId?: string;
  rating?: number;
  status?: ReviewStatus;
  isVerifiedPurchase?: boolean;
  page?: number;
  size?: number;
}

export interface ReviewSearchResponse {
  reviews: Review[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

// Import dependencies
import { Product } from './product.model';
import { User } from './user.model';