// Common interfaces
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: Date;
}

export interface PaginationRequest {
  page: number;
  size: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  status: number;
  timestamp: Date;
  path?: string;
}

// Loading states
export interface LoadingState {
  [key: string]: boolean;
}

// Generic entity state
export interface EntityState<T> {
  entities: { [id: string]: T };
  ids: string[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
}

// File upload
export interface FileUploadResponse {
  url: string;
  key: string;
  originalName: string;
  size: number;
  contentType: string;
}

// Cart item (for local state)
export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  addedAt: Date;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

export enum NotificationType {
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PRODUCT_LOW_STOCK = 'PRODUCT_LOW_STOCK',
  REVIEW_RECEIVED = 'REVIEW_RECEIVED',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT'
}

// Dashboard statistics
export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
  topProducts: Product[];
}

// Review interface
export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  helpfulCount?: number;
  images?: string[];
  sellerReply?: {
    message: string;
    createdAt: Date;
  };
}

// Address interface
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Payment Method interface
export interface PaymentMethod {
  type: 'credit_card' | 'paypal' | 'apple_pay';
  cardNumber?: string;
  expiryDate?: string;
}

// Create Order Request interface
export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  totalAmount: number;
}

// Import dependencies
import { Product } from './product.model';
import { Order } from './order.model';

// Re-export Product and Order
export type { Product, Order };