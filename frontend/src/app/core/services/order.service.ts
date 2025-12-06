import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderApiService } from './api/order-api.service';
import { 
  Order, 
  OrderSearchRequest, 
  OrderSearchResponse, 
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  AssignCourierRequest
} from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private orderApi: OrderApiService) {}

  // Create new order (customer only)
  createOrder(orderData: CreateOrderRequest): Observable<Order> {
    return this.orderApi.createOrder(orderData);
  }

  // Get order by ID
  getOrder(id: string): Observable<Order> {
    return this.orderApi.getOrder(id);
  }

  // Search/filter orders
  searchOrders(searchRequest: OrderSearchRequest = {}): Observable<OrderSearchResponse> {
    return this.orderApi.searchOrders(searchRequest);
  }

  // Get customer orders
  getCustomerOrders(customerId: string, page = 0, size = 20): Observable<OrderSearchResponse> {
    return this.orderApi.getCustomerOrders(customerId, page, size);
  }

  // Get seller orders
  getSellerOrders(sellerId: string, page = 0, size = 20): Observable<OrderSearchResponse> {
    return this.orderApi.getSellerOrders(sellerId, page, size);
  }

  // Get courier orders
  getCourierOrders(courierId: string, page = 0, size = 20): Observable<OrderSearchResponse> {
    return this.orderApi.getCourierOrders(courierId, page, size);
  }

  // Update order status (seller/courier only)
  updateOrderStatus(id: string, statusData: UpdateOrderStatusRequest): Observable<Order> {
    return this.orderApi.updateOrderStatus(id, statusData);
  }

  // Assign courier to order (seller only)
  assignCourier(id: string, courierData: AssignCourierRequest): Observable<Order> {
    return this.orderApi.assignCourier(id, courierData);
  }

  // Cancel order (customer/seller)
  cancelOrder(id: string, reason?: string): Observable<Order> {
    return this.orderApi.cancelOrder(id, reason);
  }

  // Get order tracking info
  getOrderTracking(id: string): Observable<any> {
    return this.orderApi.getOrderTracking(id);
  }

  // Get order analytics (seller only)
  getOrderAnalytics(sellerId?: string): Observable<any> {
    return this.orderApi.getOrderAnalytics(sellerId);
  }

  // Get recent orders (dashboard)
  getRecentOrders(limit = 10): Observable<Order[]> {
    return this.orderApi.getRecentOrders(limit);
  }

  // Request return/refund
  requestReturn(orderId: string, returnData: any): Observable<any> {
    return this.orderApi.requestReturn(orderId, returnData);
  }

  // Process return/refund (seller/admin)
  processReturn(returnId: string, action: 'approve' | 'reject', reason?: string): Observable<any> {
    return this.orderApi.processReturn(returnId, action, reason);
  }

  // Generate invoice
  generateInvoice(orderId: string): Observable<Blob> {
    return this.orderApi.generateInvoice(orderId);
  }

  // Bulk operations
  bulkUpdateOrderStatus(orderIds: string[], status: string): Observable<any> {
    return this.orderApi.bulkUpdateOrderStatus(orderIds, status);
  }

  // Get fulfillment analytics
  getFulfillmentAnalytics(sellerId?: string): Observable<any> {
    return this.orderApi.getOrderAnalytics(undefined, sellerId);
  }
}