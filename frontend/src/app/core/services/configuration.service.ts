import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ApiConfiguration {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  enableLogging: boolean;
  version: string;
}

export interface FeatureFlags {
  enableOfflineMode: boolean;
  enablePushNotifications: boolean;
  enableAnalytics: boolean;
  enableTwoFactorAuth: boolean;
  enableRealTimeUpdates: boolean;
  maxFileUploadSize: number; // in MB
  supportedImageFormats: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private readonly defaultApiConfig: ApiConfiguration = {
    baseUrl: 'http://localhost:8080/api',
    timeout: 30000,
    retryAttempts: 3,
    enableLogging: true,
    version: 'v1'
  };

  private readonly defaultFeatureFlags: FeatureFlags = {
    enableOfflineMode: true,
    enablePushNotifications: false,
    enableAnalytics: true,
    enableTwoFactorAuth: false,
    enableRealTimeUpdates: false,
    maxFileUploadSize: 5, // 5MB
    supportedImageFormats: ['.jpg', '.jpeg', '.png', '.webp']
  };

  private apiConfigSubject = new BehaviorSubject<ApiConfiguration>(this.defaultApiConfig);
  private featureFlagsSubject = new BehaviorSubject<FeatureFlags>(this.defaultFeatureFlags);

  public apiConfig$ = this.apiConfigSubject.asObservable();
  public featureFlags$ = this.featureFlagsSubject.asObservable();

  constructor() {
    this.loadConfiguration();
  }

  // Load configuration from localStorage or environment
  private loadConfiguration(): void {
    // Load API configuration
    const savedApiConfig = localStorage.getItem('api_config');
    if (savedApiConfig) {
      try {
        const config = JSON.parse(savedApiConfig);
        this.apiConfigSubject.next({ ...this.defaultApiConfig, ...config });
      } catch (error) {
        console.warn('Failed to load API configuration from storage');
      }
    }

    // Load feature flags
    const savedFeatureFlags = localStorage.getItem('feature_flags');
    if (savedFeatureFlags) {
      try {
        const flags = JSON.parse(savedFeatureFlags);
        this.featureFlagsSubject.next({ ...this.defaultFeatureFlags, ...flags });
      } catch (error) {
        console.warn('Failed to load feature flags from storage');
      }
    }

    // Override with environment-specific settings
    if (this.isProduction()) {
      this.updateApiConfig({
        baseUrl: 'https://api.nebulamart.com/api',
        enableLogging: false,
        timeout: 10000
      });
      
      this.updateFeatureFlags({
        enablePushNotifications: true,
        enableTwoFactorAuth: true,
        enableRealTimeUpdates: true
      });
    }
  }

  // Environment detection
  isProduction(): boolean {
    return window.location.hostname !== 'localhost' && 
           window.location.hostname !== '127.0.0.1' && 
           !window.location.hostname.includes('dev');
  }

  isDevelopment(): boolean {
    return !this.isProduction();
  }

  // API Configuration methods
  getApiConfig(): ApiConfiguration {
    return this.apiConfigSubject.value;
  }

  updateApiConfig(partialConfig: Partial<ApiConfiguration>): void {
    const currentConfig = this.apiConfigSubject.value;
    const newConfig = { ...currentConfig, ...partialConfig };
    this.apiConfigSubject.next(newConfig);
    localStorage.setItem('api_config', JSON.stringify(newConfig));
  }

  // Feature flags methods
  getFeatureFlags(): FeatureFlags {
    return this.featureFlagsSubject.value;
  }

  updateFeatureFlags(partialFlags: Partial<FeatureFlags>): void {
    const currentFlags = this.featureFlagsSubject.value;
    const newFlags = { ...currentFlags, ...partialFlags };
    this.featureFlagsSubject.next(newFlags);
    localStorage.setItem('feature_flags', JSON.stringify(newFlags));
  }

  isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    return Boolean(this.featureFlagsSubject.value[feature]);
  }

  // Specific configuration getters
  getBaseUrl(): string {
    return this.getApiConfig().baseUrl;
  }

  getTimeout(): number {
    return this.getApiConfig().timeout;
  }

  getRetryAttempts(): number {
    return this.getApiConfig().retryAttempts;
  }

  isLoggingEnabled(): boolean {
    return this.getApiConfig().enableLogging;
  }

  getMaxFileUploadSize(): number {
    return this.getFeatureFlags().maxFileUploadSize;
  }

  getSupportedImageFormats(): string[] {
    return this.getFeatureFlags().supportedImageFormats;
  }

  // Connection settings
  getConnectionConfig() {
    return {
      baseUrl: this.getBaseUrl(),
      timeout: this.getTimeout(),
      retryAttempts: this.getRetryAttempts(),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Version': this.getApiConfig().version
      }
    };
  }

  // Reset to defaults
  resetConfiguration(): void {
    this.apiConfigSubject.next(this.defaultApiConfig);
    this.featureFlagsSubject.next(this.defaultFeatureFlags);
    localStorage.removeItem('api_config');
    localStorage.removeItem('feature_flags');
  }

  // Health check configuration
  getHealthCheckConfig() {
    return {
      interval: 30000, // 30 seconds
      timeout: 5000,   // 5 seconds
      retries: 3,
      endpoints: [
        '/health',
        '/health/db',
        '/health/redis'
      ]
    };
  }

  // Cache configuration
  getCacheConfig() {
    return {
      defaultTTL: 300000, // 5 minutes
      maxSize: 100,       // 100 items
      strategies: {
        products: { ttl: 600000 }, // 10 minutes
        orders: { ttl: 60000 },    // 1 minute  
        user: { ttl: 900000 }      // 15 minutes
      }
    };
  }

  // Upload configuration
  getUploadConfig() {
    return {
      maxSize: this.getMaxFileUploadSize() * 1024 * 1024, // Convert MB to bytes
      allowedTypes: this.getSupportedImageFormats(),
      compressionQuality: 0.8,
      maxWidth: 2048,
      maxHeight: 2048
    };
  }
}