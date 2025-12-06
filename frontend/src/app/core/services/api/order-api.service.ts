import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Order, OrderStatus, OrderItem } from '../models/order.model';
import { PaginationRequest, PaginationResponse } from '../models/common.model';

export interface OrderCreateRequest {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  billingAddress?: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  paymentMethod: {
    type: 'card' | 'paypal' | 'bank_transfer';
    cardToken?: string;
    paypalToken?: string;
  };
  notes?: string;
}

export interface OrderUpdateRequest {
  status?: OrderStatus;
  trackingNumber?: string;
  carrierCode?: string;
  notes?: string;
}

export interface OrderSearchRequest extends PaginationRequest {
  customerId?: string;
  sellerId?: string;
  status?: OrderStatus[];
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: { [key in OrderStatus]: number };
  revenueByMonth: Array<{ month: string; revenue: number; orders: number }>;
  topProducts: Array<{ productId: string; productName: string; quantity: number; revenue: number }>;
}

@Injectable({
  providedIn: 'root'
})
export class OrderApiService {
  private readonly endpoint = '/orders';
  private ordersCache = new BehaviorSubject<Order[]>([]);
  private orderAnalyticsCache = new BehaviorSubject<OrderAnalytics | null>(null);

  constructor(private apiService: ApiService) {}

  // Order CRUD Operations
  getOrders(request: OrderSearchRequest = { page: 0, size: 20 }): Observable<PaginationResponse<Order>> {
    const params = this.buildOrderParams(request);
    
    return this.apiService.getPaginated<Order>(this.endpoint, { ...request, ...params }).pipe(
      tap(response => {
        // Update cache with new orders
        const currentOrders = this.ordersCache.value;
        const updatedOrders = [...currentOrders];
        
        response.content.forEach(order => {
          const existingIndex = updatedOrders.findIndex(o => o.id === order.id);
          if (existingIndex >= 0) {
            updatedOrders[existingIndex] = order;
          } else {
            updatedOrders.push(order);
          }
        });
        
        this.ordersCache.next(updatedOrders);
      })
    );
  }

  getOrder(id: string): Observable<Order> {
    return this.apiService.get<Order>(`${this.endpoint}/${id}`).pipe(
      tap(order => {
        // Update cache
        const currentOrders = this.ordersCache.value;
        const index = currentOrders.findIndex(o => o.id === order.id);
        if (index >= 0) {
          currentOrders[index] = order;
        } else {
          currentOrders.push(order);
        }
        this.ordersCache.next([...currentOrders]);
      })
    );
  }

  createOrder(orderRequest: OrderCreateRequest): Observable<Order> {
    return this.apiService.post<Order>(this.endpoint, orderRequest).pipe(
      tap(newOrder => {
        // Add to cache
        const currentOrders = this.ordersCache.value;
        this.ordersCache.next([newOrder, ...currentOrders]);
        
        // Clear analytics cache to force refresh
        this.orderAnalyticsCache.next(null);
      })
    );
  }

  updateOrder(orderId: string, updateRequest: OrderUpdateRequest): Observable<Order> {
    return this.apiService.put<Order>(`${this.endpoint}/${orderId}`, updateRequest).pipe(
      tap(updatedOrder => {
        // Update cache
        const currentOrders = this.ordersCache.value;
        const index = currentOrders.findIndex(o => o.id === updatedOrder.id);
        if (index >= 0) {
          currentOrders[index] = updatedOrder;
          this.ordersCache.next([...currentOrders]);
        }
      })
    );
  }

  cancelOrder(orderId: string, reason?: string): Observable<Order> {
    return this.apiService.post<Order>(`${this.endpoint}/${orderId}/cancel`, { reason }).pipe(
      tap(cancelledOrder => {
        // Update cache
        const currentOrders = this.ordersCache.value;
        const index = currentOrders.findIndex(o => o.id === cancelledOrder.id);
        if (index >= 0) {
          currentOrders[index] = cancelledOrder;
          this.ordersCache.next([...currentOrders]);
        }
      })
    );
  }

  // Customer-specific order operations
  getCustomerOrders(customerId: string, pagination: PaginationRequest): Observable<PaginationResponse<Order>> {
    return this.apiService.getPaginated<Order>(`/customers/${customerId}/orders`, pagination);
  }

  getCustomerOrderHistory(customerId: string): Observable<Order[]> {
    return this.apiService.get<Order[]>(`/customers/${customerId}/orders/history`);
  }

  // Seller-specific order operations
  getSellerOrders(sellerId: string, request: OrderSearchRequest): Observable<PaginationResponse<Order>> {
    const params = this.buildOrderParams(request);
    return this.apiService.getPaginated<Order>(`/sellers/${sellerId}/orders`, { ...request, ...params });
  }

  updateOrderStatus(orderId: string, status: OrderStatus, notes?: string): Observable<Order> {
    return this.updateOrder(orderId, { status, notes });
  }

  addTrackingInfo(orderId: string, trackingNumber: string, carrierCode: string): Observable<Order> {
    return this.updateOrder(orderId, { trackingNumber, carrierCode });
  }

  // Order fulfillment operations
  processOrder(orderId: string): Observable<Order> {
    return this.apiService.post<Order>(`${this.endpoint}/${orderId}/process`, {});
  }

  shipOrder(orderId: string, trackingInfo: { trackingNumber: string; carrierCode: string }): Observable<Order> {
    return this.apiService.post<Order>(`${this.endpoint}/${orderId}/ship`, trackingInfo);
  }

  deliverOrder(orderId: string): Observable<Order> {
    return this.apiService.post<Order>(`${this.endpoint}/${orderId}/deliver`, {});
  }

  // Return and refund operations
  initiateReturn(orderId: string, items: Array<{ orderItemId: string; quantity: number; reason: string }>): Observable<any> {
    return this.apiService.post(`${this.endpoint}/${orderId}/returns`, { items });
  }

  processRefund(orderId: string, amount: number, reason: string): Observable<any> {
    return this.apiService.post(`${this.endpoint}/${orderId}/refunds`, { amount, reason });
  }

  // Order analytics and reporting
  getOrderAnalytics(dateRange?: { start: Date; end: Date }, sellerId?: string): Observable<OrderAnalytics> {
    // Check cache first (only for current user's analytics)
    if (!sellerId && this.orderAnalyticsCache.value && !dateRange) {
      return this.orderAnalyticsCache.asObservable().pipe(
        map(analytics => analytics!)
      );
    }

    const params: any = {};
    if (dateRange) {
      params.startDate = dateRange.start.toISOString();
      params.endDate = dateRange.end.toISOString();
    }
    if (sellerId) {
      params.sellerId = sellerId;
    }

    const endpoint = sellerId ? `/sellers/${sellerId}/analytics` : `${this.endpoint}/analytics`;
    
    return this.apiService.get<OrderAnalytics>(endpoint, params).pipe(
      tap(analytics => {
        // Cache analytics if it's for current user and no date range
        if (!sellerId && !dateRange) {
          this.orderAnalyticsCache.next(analytics);
        }
      })
    );
  }

  getOrderTrendData(period: 'week' | 'month' | 'quarter' | 'year', sellerId?: string): Observable<any> {
    const endpoint = sellerId ? `/sellers/${sellerId}/trends` : `${this.endpoint}/trends`;
    return this.apiService.get(endpoint, { period });
  }

  // Invoice and receipt operations
  generateInvoice(orderId: string): Observable<Blob> {
    return this.apiService.get<Blob>(`${this.endpoint}/${orderId}/invoice`, {}, { responseType: 'blob' });
  }

  emailInvoice(orderId: string, email?: string): Observable<void> {
    return this.apiService.post<void>(`${this.endpoint}/${orderId}/email-invoice`, { email });
  }

  // Order validation and estimation
  validateOrder(orderRequest: OrderCreateRequest): Observable<{ isValid: boolean; errors: string[]; estimatedTotal: number }> {
    return this.apiService.post(`${this.endpoint}/validate`, orderRequest);
  }

  estimateShipping(items: OrderItem[], address: any): Observable<{ cost: number; estimatedDeliveryDate: Date; options: any[] }> {
    return this.apiService.post(`${this.endpoint}/estimate-shipping`, { items, address });
  }

  calculateTax(items: OrderItem[], address: any): Observable<{ taxAmount: number; taxRate: number }> {
    return this.apiService.post(`${this.endpoint}/calculate-tax`, { items, address });
  }

  // Bulk operations
  bulkUpdateOrderStatus(orderIds: string[], status: OrderStatus): Observable<Order[]> {
    return this.apiService.post<Order[]>(`${this.endpoint}/bulk-status-update`, { orderIds, status }).pipe(
      tap(updatedOrders => {
        // Update cache
        const currentOrders = this.ordersCache.value;
        updatedOrders.forEach(updatedOrder => {
          const index = currentOrders.findIndex(o => o.id === updatedOrder.id);
          if (index >= 0) {
            currentOrders[index] = updatedOrder;
          }
        });
        this.ordersCache.next([...currentOrders]);
      })
    );
  }

  exportOrders(request: OrderSearchRequest, format: 'csv' | 'xlsx' | 'pdf'): Observable<Blob> {
    const params = { ...this.buildOrderParams(request), format };
    return this.apiService.get<Blob>(`${this.endpoint}/export`, params, { responseType: 'blob' });
  }

  // Cache management
  getCachedOrders(): Observable<Order[]> {
    return this.ordersCache.asObservable();
  }

  clearOrderCache(): void {
    this.ordersCache.next([]);
    this.orderAnalyticsCache.next(null);
  }

  // Private helper methods
  private buildOrderParams(request: OrderSearchRequest): any {
    const params: any = {};
    
    if (request.customerId) params.customerId = request.customerId;
    if (request.sellerId) params.sellerId = request.sellerId;
    if (request.status && request.status.length > 0) params.status = request.status.join(',');
    if (request.startDate) params.startDate = request.startDate.toISOString();
    if (request.endDate) params.endDate = request.endDate.toISOString();
    if (request.minAmount) params.minAmount = request.minAmount.toString();
    if (request.maxAmount) params.maxAmount = request.maxAmount.toString();
    
    return params;
  }
}