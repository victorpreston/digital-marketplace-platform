import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationService } from './notification.service';

export interface ErrorLog {
  id: string;
  timestamp: Date;
  error: any;
  context?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  userAgent?: string;
  url?: string;
  userId?: string;
}

export interface ErrorStats {
  total: number;
  resolved: number;
  unresolved: number;
  byseverity: Record<string, number>;
  recent: ErrorLog[];
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  private errorsSubject = new BehaviorSubject<ErrorLog[]>([]);
  private maxErrors = 100; // Keep last 100 errors
  
  public errors$ = this.errorsSubject.asObservable();

  constructor(private notificationService: NotificationService) {
    this.loadErrorsFromStorage();
    this.setupGlobalErrorHandling();
  }

  private setupGlobalErrorHandling(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(event.reason, 'unhandled-promise-rejection', 'high');
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError(event.error, 'javascript-error', 'high');
    });

    // Handle Angular errors (if using a global error handler)
    // This would typically be set up in app.config.ts or main.ts
  }

  logError(
    error: any, 
    context?: string, 
    severity: ErrorLog['severity'] = 'medium',
    showNotification: boolean = true
  ): ErrorLog {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      error: this.serializeError(error),
      context,
      severity,
      resolved: false,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId()
    };

    this.addError(errorLog);

    // Show notification based on severity
    if (showNotification) {
      this.showErrorNotification(errorLog);
    }

    // Log to console in development
    if (this.isDevelopment()) {
      console.group(`🚨 Error [${severity.toUpperCase()}]`);
      console.log('Context:', context);
      console.log('Error:', error);
      console.log('Timestamp:', errorLog.timestamp);
      console.groupEnd();
    }

    return errorLog;
  }

  private addError(errorLog: ErrorLog): void {
    const currentErrors = this.errorsSubject.value;
    const updatedErrors = [errorLog, ...currentErrors].slice(0, this.maxErrors);
    
    this.errorsSubject.next(updatedErrors);
    this.saveErrorsToStorage(updatedErrors);
  }

  private showErrorNotification(errorLog: ErrorLog): void {
    const message = this.getErrorMessage(errorLog.error);
    
    switch (errorLog.severity) {
      case 'low':
        // Don't show notifications for low severity errors
        break;
      case 'medium':
        this.notificationService.show({
          type: 'warning',
          title: 'Warning',
          message: message,
          duration: 3000
        });
        break;
      case 'high':
        this.notificationService.show({
          type: 'error',
          title: 'Error Occurred',
          message: message,
          duration: 5000
        });
        break;
      case 'critical':
        this.notificationService.show({
          type: 'error',
          title: 'Critical Error',
          message: `${message} - Please refresh the page or contact support.`,
          duration: 0 // Persistent
        });
        break;
    }
  }

  resolveError(errorId: string): void {
    const currentErrors = this.errorsSubject.value;
    const updatedErrors = currentErrors.map(error => 
      error.id === errorId ? { ...error, resolved: true } : error
    );
    
    this.errorsSubject.next(updatedErrors);
    this.saveErrorsToStorage(updatedErrors);
  }

  clearResolvedErrors(): void {
    const currentErrors = this.errorsSubject.value;
    const unresolvedErrors = currentErrors.filter(error => !error.resolved);
    
    this.errorsSubject.next(unresolvedErrors);
    this.saveErrorsToStorage(unresolvedErrors);
  }

  clearAllErrors(): void {
    this.errorsSubject.next([]);
    localStorage.removeItem('error_logs');
  }

  getErrorStats(): ErrorStats {
    const errors = this.errorsSubject.value;
    
    return {
      total: errors.length,
      resolved: errors.filter(e => e.resolved).length,
      unresolved: errors.filter(e => !e.resolved).length,
      byseverity: {
        low: errors.filter(e => e.severity === 'low').length,
        medium: errors.filter(e => e.severity === 'medium').length,
        high: errors.filter(e => e.severity === 'high').length,
        critical: errors.filter(e => e.severity === 'critical').length
      },
      recent: errors.slice(0, 10) // Last 10 errors
    };
  }

  getUnresolvedErrors(): ErrorLog[] {
    return this.errorsSubject.value.filter(error => !error.resolved);
  }

  searchErrors(query: string): ErrorLog[] {
    const errors = this.errorsSubject.value;
    const lowercaseQuery = query.toLowerCase();
    
    return errors.filter(error => 
      error.context?.toLowerCase().includes(lowercaseQuery) ||
      JSON.stringify(error.error).toLowerCase().includes(lowercaseQuery) ||
      error.url?.toLowerCase().includes(lowercaseQuery)
    );
  }

  exportErrors(): string {
    const errors = this.errorsSubject.value;
    return JSON.stringify(errors, null, 2);
  }

  // Specific error type handlers
  handleApiError(error: any, endpoint: string): ErrorLog {
    let severity: ErrorLog['severity'] = 'medium';
    
    if (error.status >= 500) {
      severity = 'high';
    } else if (error.status === 401 || error.status === 403) {
      severity = 'medium';
    } else if (error.status >= 400) {
      severity = 'low';
    }

    return this.logError(error, `api-error:${endpoint}`, severity);
  }

  handleValidationError(error: any, formName: string): ErrorLog {
    return this.logError(error, `validation-error:${formName}`, 'low', false);
  }

  handleNetworkError(error: any): ErrorLog {
    return this.logError(error, 'network-error', 'high');
  }

  handleAuthenticationError(error: any): ErrorLog {
    return this.logError(error, 'authentication-error', 'medium');
  }

  private serializeError(error: any): any {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }
    
    if (error && typeof error === 'object') {
      return {
        ...error,
        toString: error.toString?.()
      };
    }
    
    return { value: error, type: typeof error };
  }

  private getErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    if (error?.error?.message) {
      return error.error.message;
    }
    
    return 'An unexpected error occurred';
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getCurrentUserId(): string | undefined {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id;
    } catch {
      return undefined;
    }
  }

  private isDevelopment(): boolean {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }

  private saveErrorsToStorage(errors: ErrorLog[]): void {
    try {
      localStorage.setItem('error_logs', JSON.stringify(errors));
    } catch (error) {
      console.warn('Failed to save error logs to storage:', error);
    }
  }

  private loadErrorsFromStorage(): void {
    try {
      const savedErrors = localStorage.getItem('error_logs');
      if (savedErrors) {
        const errors = JSON.parse(savedErrors).map((error: any) => ({
          ...error,
          timestamp: new Date(error.timestamp)
        }));
        this.errorsSubject.next(errors);
      }
    } catch (error) {
      console.warn('Failed to load error logs from storage:', error);
    }
  }

  // Health check - identify patterns in errors
  analyzeErrorPatterns(): {
    frequentErrors: { message: string; count: number }[];
    errorTrends: { hour: number; count: number }[];
    problematicUrls: { url: string; count: number }[];
  } {
    const errors = this.errorsSubject.value;
    
    // Count frequent error messages
    const errorMessages = new Map<string, number>();
    const urlCounts = new Map<string, number>();
    const hourCounts = new Array(24).fill(0);
    
    errors.forEach(error => {
      const message = this.getErrorMessage(error.error);
      errorMessages.set(message, (errorMessages.get(message) || 0) + 1);
      
      if (error.url) {
        urlCounts.set(error.url, (urlCounts.get(error.url) || 0) + 1);
      }
      
      const hour = error.timestamp.getHours();
      hourCounts[hour]++;
    });
    
    return {
      frequentErrors: Array.from(errorMessages.entries())
        .map(([message, count]) => ({ message, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      
      errorTrends: hourCounts.map((count, hour) => ({ hour, count })),
      
      problematicUrls: Array.from(urlCounts.entries())
        .map(([url, count]) => ({ url, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    };
  }
}