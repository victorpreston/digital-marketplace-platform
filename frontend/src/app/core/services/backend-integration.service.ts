import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Interfaces
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class BackendIntegrationService {
  private baseUrl = environment.production ? 'https://api.nebulamart.com' : 'http://localhost:8080';
  private tokenSubject = new BehaviorSubject<string | null>(null);
  
  constructor(private http: HttpClient) {
    // Load token from storage on service initialization
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.tokenSubject.next(token);
    }
  }

  // Token management
  setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token);
    this.tokenSubject.next(token);
  }

  getAuthToken(): string | null {
    return this.tokenSubject.value;
  }

  clearAuthToken(): void {
    localStorage.removeItem('auth_token');
    this.tokenSubject.next(null);
  }

  // HTTP headers with authentication
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    const token = this.getAuthToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // Generic HTTP methods
  private get<T>(endpoint: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      retry(1),
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  private post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body, {
      headers: this.getHeaders()
    }).pipe(
      retry(1),
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  private put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body, {
      headers: this.getHeaders()
    }).pipe(
      retry(1),
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  private patch<T>(endpoint: string, body: any): Observable<T> {
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body, {
      headers: this.getHeaders()
    }).pipe(
      retry(1),
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  private delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders()
    }).pipe(
      retry(1),
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // File upload method
  private uploadFile(endpoint: string, file: File, additionalData?: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const token = this.getAuthToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post<ApiResponse<any>>(`${this.baseUrl}${endpoint}`, formData, {
      headers: headers
    }).pipe(
      retry(1),
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Error handling
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  // Authentication endpoints
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.post('/api/auth/login', credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          this.setAuthToken(response.token);
        }
      })
    );
  }

  register(userData: { 
    email: string; 
    password: string; 
    firstName: string; 
    lastName: string;
    role: string;
    phone?: string;
  }): Observable<any> {
    return this.post('/api/auth/register', userData).pipe(
      tap((response: any) => {
        if (response.token) {
          this.setAuthToken(response.token);
        }
      })
    );
  }

  logout(): Observable<any> {
    return this.post('/api/auth/logout', {}).pipe(
      tap(() => {
        this.clearAuthToken();
      })
    );
  }

  refreshToken(): Observable<any> {
    return this.post('/api/auth/refresh', {}).pipe(
      tap((response: any) => {
        if (response.token) {
          this.setAuthToken(response.token);
        }
      })
    );
  }

  // User endpoints
  getUserProfile(): Observable<any> {
    return this.get('/api/users/profile');
  }

  updateUserProfile(profileData: any): Observable<any> {
    return this.put('/api/users/profile', profileData);
  }

  changePassword(passwordData: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.post('/api/users/change-password', passwordData);
  }

  getUserAddresses(): Observable<any[]> {
    return this.get('/api/users/addresses');
  }

  addUserAddress(addressData: any): Observable<any> {
    return this.post('/api/users/addresses', addressData);
  }

  updateUserAddress(addressId: string, addressData: any): Observable<any> {
    return this.put(`/api/users/addresses/${addressId}`, addressData);
  }

  deleteUserAddress(addressId: string): Observable<any> {
    return this.delete(`/api/users/addresses/${addressId}`);
  }

  // Product endpoints
  searchProducts(searchParams: any = {}): Observable<PaginatedResponse<any>> {
    return this.get('/api/products/search', searchParams);
  }

  getProduct(productId: string): Observable<any> {
    return this.get(`/api/products/${productId}`);
  }

  createProduct(productData: any): Observable<any> {
    return this.post('/api/products', productData);
  }

  updateProduct(productId: string, productData: any): Observable<any> {
    return this.put(`/api/products/${productId}`, productData);
  }

  deleteProduct(productId: string): Observable<any> {
    return this.delete(`/api/products/${productId}`);
  }

  getProductCategories(): Observable<any[]> {
    return this.get('/api/products/categories');
  }

  getFeaturedProducts(limit: number = 10): Observable<any[]> {
    return this.get('/api/products/featured', { limit });
  }

  getTrendingProducts(limit: number = 10): Observable<any[]> {
    return this.get('/api/products/trending', { limit });
  }

  getSellerProducts(sellerId: string, page: number = 0, size: number = 20): Observable<PaginatedResponse<any>> {
    return this.get(`/api/products/seller/${sellerId}`, { page, size });
  }

  uploadProductImage(productId: string, imageFile: File): Observable<any> {
    return this.uploadFile(`/api/products/${productId}/images`, imageFile);
  }

  // Order endpoints
  createOrder(orderData: any): Observable<any> {
    return this.post('/api/orders', orderData);
  }

  getOrder(orderId: string): Observable<any> {
    return this.get(`/api/orders/${orderId}`);
  }

  getUserOrders(page: number = 0, size: number = 20): Observable<PaginatedResponse<any>> {
    return this.get('/api/orders/my-orders', { page, size });
  }

  getSellerOrders(sellerId: string, page: number = 0, size: number = 20): Observable<PaginatedResponse<any>> {
    return this.get(`/api/orders/seller/${sellerId}`, { page, size });
  }

  updateOrderStatus(orderId: string, status: string, notes?: string): Observable<any> {
    return this.patch(`/api/orders/${orderId}/status`, { status, notes });
  }

  cancelOrder(orderId: string, reason?: string): Observable<any> {
    return this.patch(`/api/orders/${orderId}/cancel`, { reason });
  }

  getOrderTracking(orderId: string): Observable<any> {
    return this.get(`/api/orders/${orderId}/tracking`);
  }

  // Review endpoints
  createReview(reviewData: any): Observable<any> {
    return this.post('/api/reviews', reviewData);
  }

  getProductReviews(productId: string, page: number = 0, size: number = 10): Observable<PaginatedResponse<any>> {
    return this.get(`/api/reviews/product/${productId}`, { page, size });
  }

  getUserReviews(page: number = 0, size: number = 10): Observable<PaginatedResponse<any>> {
    return this.get('/api/reviews/my-reviews', { page, size });
  }

  updateReview(reviewId: string, reviewData: any): Observable<any> {
    return this.put(`/api/reviews/${reviewId}`, reviewData);
  }

  deleteReview(reviewId: string): Observable<any> {
    return this.delete(`/api/reviews/${reviewId}`);
  }

  // Wishlist endpoints
  getWishlist(): Observable<any[]> {
    return this.get('/api/users/wishlist');
  }

  addToWishlist(productId: string): Observable<any> {
    return this.post('/api/users/wishlist', { productId });
  }

  removeFromWishlist(productId: string): Observable<any> {
    return this.delete(`/api/users/wishlist/${productId}`);
  }

  // Analytics endpoints
  getDashboardAnalytics(): Observable<any> {
    return this.get('/api/analytics/dashboard');
  }

  getSellerAnalytics(sellerId: string, timeRange: string = 'month'): Observable<any> {
    return this.get(`/api/analytics/seller/${sellerId}`, { timeRange });
  }

  getProductAnalytics(productId: string, timeRange: string = 'month'): Observable<any> {
    return this.get(`/api/analytics/product/${productId}`, { timeRange });
  }

  // Health check
  healthCheck(): Observable<any> {
    return this.get('/api/health');
  }

  // Connection status
  checkConnection(): Observable<boolean> {
    return this.healthCheck().pipe(
      map(() => true),
      catchError(() => {
        return throwError(() => new Error('Backend connection failed'));
      })
    );
  }
}