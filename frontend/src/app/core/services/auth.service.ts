import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UserApiService } from './api/user-api.service';
import { 
  User, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  UserRole 
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private userApi: UserApiService,
    private router: Router
  ) {
    this.loadFromStorage();
  }

  // Load auth state from localStorage
  private loadFromStorage(): void {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.tokenSubject.next(token);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        this.clearStorage();
      }
    }
  }

  // Save auth state to localStorage
  private saveToStorage(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('refreshToken', token); // In real app, separate refresh token
  }

  // Clear localStorage
  private clearStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
  }

  // Login method
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.userApi.login(credentials)
      .pipe(
        tap(response => {
          this.tokenSubject.next(response.token);
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
          this.saveToStorage(response.token, response.user);
        }),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  // Register method
  register(userData: RegisterRequest): Observable<LoginResponse> {
    return this.userApi.register(userData)
      .pipe(
        tap(response => {
          this.tokenSubject.next(response.token);
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
          this.saveToStorage(response.token, response.user);
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  // Logout method
  logout(): void {
    // Call logout API if needed
    this.userApi.logout().subscribe();
    
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.clearStorage();
    this.router.navigate(['/auth/login']);
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Get token
  getToken(): string | null {
    return this.tokenSubject.value;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // Check user role
  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  // Check if user is customer
  isCustomer(): boolean {
    return this.hasRole(UserRole.CUSTOMER);
  }

  // Check if user is seller
  isSeller(): boolean {
    return this.hasRole(UserRole.SELLER);
  }

  // Check if user is courier
  isCourier(): boolean {
    return this.hasRole(UserRole.COURIER);
  }

  // Update user profile
  updateProfile(userData: UpdateUserRequest): Observable<User> {
    return this.userApi.updateProfile(userData)
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
          const token = this.getToken();
          if (token) {
            this.saveToStorage(token, user);
          }
        })
      );
  }

  // Change password
  changePassword(passwordData: ChangePasswordRequest): Observable<any> {
    return this.userApi.changePassword(passwordData);
  }

  // Refresh token (if implemented)
  refreshToken(): Observable<LoginResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.userApi.refreshToken(refreshToken)
      .pipe(
        tap(response => {
          this.tokenSubject.next(response.token);
          this.currentUserSubject.next(response.user);
          this.saveToStorage(response.token, response.user);
        }),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  // Forgot password
  forgotPassword(email: string): Observable<any> {
    return this.userApi.requestPasswordReset(email);
  }

  // Reset password
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.userApi.resetPassword(token, newPassword);
  }

  // Verify email
  verifyEmail(token: string): Observable<any> {
    return this.userApi.verifyEmail(token);
  }

  // Resend verification email
  resendVerificationEmail(): Observable<any> {
    return this.userApi.resendVerificationEmail();
  }
}