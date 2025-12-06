import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User, UserRole, UserProfile } from '../models/user.model';
import { PaginationRequest, PaginationResponse } from '../models/common.model';

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  dateOfBirth?: Date;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  avatar?: string;
  preferences?: {
    language?: string;
    currency?: string;
    timezone?: string;
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
  };
}

export interface AddressCreateRequest {
  label: string;
  fullName: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  type: 'shipping' | 'billing';
  isDefault?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  private readonly endpoint = '/users';
  private readonly authEndpoint = '/auth';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private authTokenSubject = new BehaviorSubject<string | null>(null);
  
  public currentUser$ = this.currentUserSubject.asObservable();
  public authToken$ = this.authTokenSubject.asObservable();
  public isLoggedIn$ = this.currentUser$.pipe(map(user => !!user));

  constructor(private apiService: ApiService) {
    this.initializeFromStorage();
  }

  // Authentication
  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>(`${this.authEndpoint}/login`, credentials).pipe(
      tap(response => {
        this.setAuthData(response);
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>(`${this.authEndpoint}/register`, userData).pipe(
      tap(response => {
        this.setAuthData(response);
      })
    );
  }

  logout(): Observable<void> {
    return this.apiService.post<void>(`${this.authEndpoint}/logout`, {}).pipe(
      tap(() => {
        this.clearAuthData();
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.apiService.post<AuthResponse>(`${this.authEndpoint}/refresh`, { refreshToken }).pipe(
      tap(response => {
        this.setAuthData(response);
      })
    );
  }

  forgotPassword(email: string): Observable<void> {
    return this.apiService.post<void>(`${this.authEndpoint}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.apiService.post<void>(`${this.authEndpoint}/reset-password`, { token, newPassword });
  }

  verifyEmail(token: string): Observable<void> {
    return this.apiService.post<void>(`${this.authEndpoint}/verify-email`, { token });
  }

  // User Profile Management
  getProfile(): Observable<UserProfile> {
    return this.apiService.get<UserProfile>(`${this.endpoint}/profile`);
  }

  updateProfile(profileData: ProfileUpdateRequest): Observable<UserProfile> {
    return this.apiService.put<UserProfile>(`${this.endpoint}/profile`, profileData).pipe(
      tap(updatedProfile => {
        // Update current user with new profile data
        const currentUser = this.currentUserSubject.value;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updatedProfile };
          this.currentUserSubject.next(updatedUser);
          this.saveUserToStorage(updatedUser);
        }
      })
    );
  }

  changePassword(passwordData: PasswordChangeRequest): Observable<void> {
    return this.apiService.post<void>(`${this.endpoint}/change-password`, passwordData);
  }

  uploadAvatar(avatarFile: File): Observable<{ avatarUrl: string }> {
    return this.apiService.uploadFile<{ avatarUrl: string }>(`${this.endpoint}/avatar`, avatarFile).pipe(
      tap(response => {
        // Update current user avatar
        const currentUser = this.currentUserSubject.value;
        if (currentUser) {
          const updatedUser = { ...currentUser, avatar: response.avatarUrl };
          this.currentUserSubject.next(updatedUser);
          this.saveUserToStorage(updatedUser);
        }
      })
    );
  }

  deleteAvatar(): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/avatar`).pipe(
      tap(() => {
        // Remove avatar from current user
        const currentUser = this.currentUserSubject.value;
        if (currentUser) {
          const updatedUser = { ...currentUser, avatar: undefined };
          this.currentUserSubject.next(updatedUser);
          this.saveUserToStorage(updatedUser);
        }
      })
    );
  }

  // Address Management
  getAddresses(): Observable<any[]> {
    return this.apiService.get<any[]>(`${this.endpoint}/addresses`);
  }

  createAddress(addressData: AddressCreateRequest): Observable<any> {
    return this.apiService.post<any>(`${this.endpoint}/addresses`, addressData);
  }

  updateAddress(addressId: string, addressData: Partial<AddressCreateRequest>): Observable<any> {
    return this.apiService.put<any>(`${this.endpoint}/addresses/${addressId}`, addressData);
  }

  deleteAddress(addressId: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/addresses/${addressId}`);
  }

  setDefaultAddress(addressId: string): Observable<void> {
    return this.apiService.post<void>(`${this.endpoint}/addresses/${addressId}/set-default`, {});
  }

  // User Preferences
  updatePreferences(preferences: any): Observable<any> {
    return this.apiService.put<any>(`${this.endpoint}/preferences`, preferences);
  }

  // Two-Factor Authentication
  enableTwoFactor(): Observable<{ secret: string; qrCode: string }> {
    return this.apiService.post<{ secret: string; qrCode: string }>(`${this.endpoint}/2fa/enable`, {});
  }

  confirmTwoFactor(token: string, secret: string): Observable<{ backupCodes: string[] }> {
    return this.apiService.post<{ backupCodes: string[] }>(`${this.endpoint}/2fa/confirm`, { token, secret });
  }

  disableTwoFactor(password: string): Observable<void> {
    return this.apiService.post<void>(`${this.endpoint}/2fa/disable`, { password });
  }

  // Customer-specific operations
  getWishlist(): Observable<any[]> {
    return this.apiService.get<any[]>(`${this.endpoint}/wishlist`);
  }

  addToWishlist(productId: string): Observable<void> {
    return this.apiService.post<void>(`${this.endpoint}/wishlist`, { productId });
  }

  removeFromWishlist(productId: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/wishlist/${productId}`);
  }

  getReviews(pagination: PaginationRequest): Observable<PaginationResponse<any>> {
    return this.apiService.getPaginated<any>(`${this.endpoint}/reviews`, pagination);
  }

  // Seller-specific operations
  getSellerProfile(sellerId?: string): Observable<any> {
    const endpoint = sellerId ? `/sellers/${sellerId}/profile` : `/sellers/profile`;
    return this.apiService.get<any>(endpoint);
  }

  updateSellerProfile(profileData: any): Observable<any> {
    return this.apiService.put<any>(`/sellers/profile`, profileData);
  }

  getSellerAnalytics(dateRange?: { start: Date; end: Date }): Observable<any> {
    const params = dateRange ? {
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString()
    } : {};

    return this.apiService.get<any>(`/sellers/analytics`, params);
  }

  // Admin operations (if needed)
  getAllUsers(request: PaginationRequest & { role?: UserRole; status?: string }): Observable<PaginationResponse<User>> {
    return this.apiService.getPaginated<User>('/admin/users', request);
  }

  getUserById(userId: string): Observable<User> {
    return this.apiService.get<User>(`/admin/users/${userId}`);
  }

  updateUserStatus(userId: string, status: 'active' | 'suspended' | 'banned'): Observable<User> {
    return this.apiService.put<User>(`/admin/users/${userId}/status`, { status });
  }

  // Utility methods
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserId(): string | null {
    const user = this.getCurrentUser();
    return user ? user.id : null;
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser() && !!this.authTokenSubject.value;
  }

  // Private methods
  private setAuthData(authResponse: AuthResponse): void {
    localStorage.setItem('auth_token', authResponse.token);
    localStorage.setItem('refresh_token', authResponse.refreshToken);
    
    this.authTokenSubject.next(authResponse.token);
    this.currentUserSubject.next(authResponse.user);
    this.saveUserToStorage(authResponse.user);

    // Set token expiration timer
    this.setTokenExpirationTimer(authResponse.expiresIn);
  }

  private clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
    
    this.authTokenSubject.next(null);
    this.currentUserSubject.next(null);
    
    this.clearTokenExpirationTimer();
  }

  private saveUserToStorage(user: User): void {
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  private initializeFromStorage(): void {
    const token = localStorage.getItem('auth_token');
    const userJson = localStorage.getItem('current_user');
    
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this.authTokenSubject.next(token);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearAuthData();
      }
    }
  }

  private tokenExpirationTimer: any;

  private setTokenExpirationTimer(expiresIn: number): void {
    this.clearTokenExpirationTimer();
    
    // Refresh token 5 minutes before expiration
    const refreshTime = (expiresIn - 300) * 1000;
    
    this.tokenExpirationTimer = setTimeout(() => {
      this.refreshToken().subscribe({
        error: () => {
          // If refresh fails, logout user
          this.clearAuthData();
        }
      });
    }, refreshTime);
  }

  private clearTokenExpirationTimer(): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
  }
}