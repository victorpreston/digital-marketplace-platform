import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, timer, fromEvent } from 'rxjs';
import { map, catchError, tap, switchMap, startWith, share } from 'rxjs/operators';
import { BackendIntegrationService } from './backend-integration.service';
import { ConfigurationService } from './configuration.service';
import { NotificationService } from './notification.service';

export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

export interface ConnectionState {
  status: ConnectionStatus;
  lastConnected?: Date;
  lastError?: string;
  retryAttempt: number;
  networkOnline: boolean;
  backendReachable: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  private connectionStateSubject = new BehaviorSubject<ConnectionState>({
    status: ConnectionStatus.DISCONNECTED,
    retryAttempt: 0,
    networkOnline: navigator.onLine,
    backendReachable: false
  });

  public connectionState$ = this.connectionStateSubject.asObservable();
  private healthCheckInterval$: Observable<any>;
  private reconnectTimer$: Observable<any> | null = null;

  constructor(
    private backendService: BackendIntegrationService,
    private configService: ConfigurationService,
    private notificationService: NotificationService
  ) {
    this.initializeConnectionMonitoring();
  }

  private initializeConnectionMonitoring(): void {
    // Monitor network connectivity
    fromEvent(window, 'online').subscribe(() => {
      this.updateConnectionState({ networkOnline: true });
      this.checkBackendConnection();
    });

    fromEvent(window, 'offline').subscribe(() => {
      this.updateConnectionState({ 
        networkOnline: false,
        status: ConnectionStatus.DISCONNECTED,
        backendReachable: false
      });
    });

    // Initialize health check monitoring
    const healthConfig = this.configService.getHealthCheckConfig();
    this.healthCheckInterval$ = interval(healthConfig.interval).pipe(
      startWith(0), // Check immediately
      switchMap(() => this.performHealthCheck()),
      share()
    );

    // Start monitoring
    this.startHealthCheckMonitoring();
  }

  private startHealthCheckMonitoring(): void {
    this.healthCheckInterval$.subscribe({
      next: (isHealthy) => {
        if (isHealthy) {
          this.handleSuccessfulConnection();
        } else {
          this.handleConnectionFailure();
        }
      },
      error: (error) => {
        console.error('Health check monitoring error:', error);
        this.handleConnectionFailure(error.message);
      }
    });
  }

  private performHealthCheck(): Observable<boolean> {
    const currentState = this.connectionStateSubject.value;
    
    // Skip if network is offline
    if (!currentState.networkOnline) {
      return new Observable(subscriber => subscriber.next(false));
    }

    // Update status to connecting if not already connected
    if (currentState.status !== ConnectionStatus.CONNECTED) {
      this.updateConnectionState({ status: ConnectionStatus.CONNECTING });
    }

    return this.backendService.healthCheck().pipe(
      map(() => true),
      catchError((error) => {
        console.warn('Backend health check failed:', error);
        return new Observable(subscriber => subscriber.next(false));
      })
    );
  }

  private handleSuccessfulConnection(): void {
    const currentState = this.connectionStateSubject.value;
    
    // Only update if status changed or first successful connection
    if (currentState.status !== ConnectionStatus.CONNECTED) {
      this.updateConnectionState({
        status: ConnectionStatus.CONNECTED,
        lastConnected: new Date(),
        lastError: undefined,
        retryAttempt: 0,
        backendReachable: true
      });

      // Notify user if they were previously disconnected
      if (currentState.status === ConnectionStatus.DISCONNECTED || 
          currentState.status === ConnectionStatus.RECONNECTING) {
        this.notificationService.showSuccess('Connection restored');
      }

      // Cancel any ongoing reconnection attempts
      this.reconnectTimer$ = null;
    }
  }

  private handleConnectionFailure(errorMessage?: string): void {
    const currentState = this.connectionStateSubject.value;
    
    this.updateConnectionState({
      status: ConnectionStatus.ERROR,
      lastError: errorMessage || 'Backend connection failed',
      backendReachable: false,
      retryAttempt: currentState.retryAttempt + 1
    });

    // Start reconnection attempts if network is online
    if (currentState.networkOnline) {
      this.startReconnectionAttempts();
    }

    // Notify user of connection issues
    if (currentState.status === ConnectionStatus.CONNECTED) {
      this.notificationService.showError('Connection lost. Attempting to reconnect...');
    }
  }

  private startReconnectionAttempts(): void {
    const currentState = this.connectionStateSubject.value;
    const maxRetries = this.configService.getRetryAttempts();
    
    if (currentState.retryAttempt >= maxRetries) {
      this.updateConnectionState({ 
        status: ConnectionStatus.DISCONNECTED,
        lastError: `Failed to reconnect after ${maxRetries} attempts`
      });
      this.notificationService.showError('Connection failed. Please check your internet connection.');
      return;
    }

    this.updateConnectionState({ status: ConnectionStatus.RECONNECTING });

    // Exponential backoff: 2^attempt * 1000ms (max 30s)
    const delay = Math.min(Math.pow(2, currentState.retryAttempt) * 1000, 30000);
    
    this.reconnectTimer$ = timer(delay).pipe(
      tap(() => this.checkBackendConnection())
    );

    this.reconnectTimer$.subscribe();
  }

  private updateConnectionState(partialState: Partial<ConnectionState>): void {
    const currentState = this.connectionStateSubject.value;
    const newState = { ...currentState, ...partialState };
    this.connectionStateSubject.next(newState);
  }

  // Public methods
  public checkBackendConnection(): void {
    this.performHealthCheck().subscribe({
      next: (isHealthy) => {
        if (isHealthy) {
          this.handleSuccessfulConnection();
        } else {
          this.handleConnectionFailure();
        }
      },
      error: (error) => {
        this.handleConnectionFailure(error.message);
      }
    });
  }

  public getConnectionState(): ConnectionState {
    return this.connectionStateSubject.value;
  }

  public isConnected(): boolean {
    const state = this.connectionStateSubject.value;
    return state.status === ConnectionStatus.CONNECTED && 
           state.networkOnline && 
           state.backendReachable;
  }

  public isOffline(): boolean {
    const state = this.connectionStateSubject.value;
    return !state.networkOnline || 
           state.status === ConnectionStatus.DISCONNECTED;
  }

  public getConnectionStatusText(): string {
    const state = this.connectionStateSubject.value;
    
    switch (state.status) {
      case ConnectionStatus.CONNECTED:
        return 'Connected';
      case ConnectionStatus.CONNECTING:
        return 'Connecting...';
      case ConnectionStatus.RECONNECTING:
        return `Reconnecting... (${state.retryAttempt})`;
      case ConnectionStatus.ERROR:
        return `Error: ${state.lastError}`;
      case ConnectionStatus.DISCONNECTED:
        return state.networkOnline ? 'Disconnected from server' : 'No internet connection';
      default:
        return 'Unknown status';
    }
  }

  public forceReconnect(): void {
    this.updateConnectionState({ 
      retryAttempt: 0,
      lastError: undefined 
    });
    this.checkBackendConnection();
  }

  // Observable helpers
  public whenConnected(): Observable<boolean> {
    return this.connectionState$.pipe(
      map(state => state.status === ConnectionStatus.CONNECTED),
      share()
    );
  }

  public whenDisconnected(): Observable<boolean> {
    return this.connectionState$.pipe(
      map(state => state.status === ConnectionStatus.DISCONNECTED || 
                   state.status === ConnectionStatus.ERROR),
      share()
    );
  }

  // Connection quality estimation
  public getConnectionQuality(): 'excellent' | 'good' | 'fair' | 'poor' | 'offline' {
    const state = this.connectionStateSubject.value;
    
    if (!state.networkOnline || !state.backendReachable) {
      return 'offline';
    }

    if (state.status === ConnectionStatus.CONNECTED && state.retryAttempt === 0) {
      return 'excellent';
    }

    if (state.status === ConnectionStatus.CONNECTED && state.retryAttempt < 3) {
      return 'good';
    }

    if (state.status === ConnectionStatus.RECONNECTING) {
      return state.retryAttempt < 5 ? 'fair' : 'poor';
    }

    return 'poor';
  }

  // Statistics
  public getConnectionStats(): {
    uptime: number;
    lastConnectedAgo: number | null;
    totalRetries: number;
    currentQuality: string;
  } {
    const state = this.connectionStateSubject.value;
    const now = new Date().getTime();
    
    return {
      uptime: state.lastConnected ? now - state.lastConnected.getTime() : 0,
      lastConnectedAgo: state.lastConnected ? now - state.lastConnected.getTime() : null,
      totalRetries: state.retryAttempt,
      currentQuality: this.getConnectionQuality()
    };
  }
}