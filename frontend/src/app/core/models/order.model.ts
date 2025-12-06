export interface Order {
  id: string;
  customerId: string;
  customer?: User;
  sellerId: string;
  seller?: User;
  courierId?: string;
  courier?: User;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: Address;
  billingAddress?: Address;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingInfo?: ShippingInfo;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface ShippingInfo {
  courier: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  shippingCost: number;
}

export interface CreateOrderRequest {
  items: {
    productId: string;
    quantity: number;
  }[];
  shippingAddress: Address;
  billingAddress?: Address;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
}

export interface AssignCourierRequest {
  courierId: string;
  estimatedDelivery?: Date;
}

export interface OrderSearchRequest {
  customerId?: string;
  sellerId?: string;
  courierId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  size?: number;
}

export interface OrderSearchResponse {
  orders: Order[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

// Import dependencies
import { User, Address } from './user.model';
import { Product } from './product.model';