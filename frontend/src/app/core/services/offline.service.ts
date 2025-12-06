import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, merge } from 'rxjs';
import { map, startWith, share, distinctUntilChanged } from 'rxjs/operators';
import { NotificationService } from './notification.service';

export interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  data: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  priority: 'high' | 'medium' | 'low';
  headers?: { [key: string]: string };
}

export interface OfflineData {
  key: string;
  data: any;
  timestamp: Date;
  expiry?: Date;
  size?: number;
}

export interface CacheConfig {
  key: string;
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of items to cache
  priority: number; // Higher number = higher priority
}

@Injectable({
  providedIn: 'root'
})
export class OfflineService {
  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  private offlineActions: OfflineAction[] = [];
  private offlineData = new Map<string, OfflineData>();
  
  public isOnline$ = this.isOnlineSubject.asObservable().pipe(distinctUntilChanged());

  constructor(private notificationService: NotificationService) {
    this.initializeOfflineCapabilities();
    this.loadOfflineData();
  }

  private initializeOfflineCapabilities(): void {
    // Monitor online/offline status
    merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).pipe(
      startWith(navigator.onLine),
      share()
    ).subscribe(isOnline => {
      this.isOnlineSubject.next(isOnline);
      
      if (isOnline) {
        this.handleGoingOnline();
      } else {
        this.handleGoingOffline();
      }
    });

    // Save offline data periodically
    setInterval(() => {
      this.saveOfflineData();
    }, 30000); // Every 30 seconds
  }

  private handleGoingOnline(): void {
    console.log('🌐 Back online - syncing offline actions');
    this.notificationService.show({
      type: 'success',
      title: 'Back Online',
      message: 'Connection restored. Syncing your changes...',
      duration: 3000
    });

    this.syncOfflineActions();
  }

  private handleGoingOffline(): void {
    console.log('📴 Gone offline - enabling offline mode');
    this.notificationService.show({
      type: 'warning',
      title: 'Offline Mode',
      message: 'You are now offline. Changes will be saved and synced when you reconnect.',
      duration: 5000
    });
  }

  // Public API
  isOnline(): boolean {
    return this.isOnlineSubject.value;
  }

  isOffline(): boolean {
    return !this.isOnline();
  }

  // Queue actions for offline sync
  queueAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): void {
    const offlineAction: OfflineAction = {
      ...action,
      id: this.generateId(),
      timestamp: new Date(),
      retryCount: 0
    };

    this.offlineActions.push(offlineAction);
    this.saveOfflineData();
    
    console.log('📋 Queued offline action:', offlineAction);
  }

  // Store data for offline access
  storeOfflineData(key: string, data: any, expiryHours?: number): void {
    const offlineData: OfflineData = {
      key,
      data,
      timestamp: new Date(),
      expiry: expiryHours ? new Date(Date.now() + expiryHours * 60 * 60 * 1000) : undefined
    };

    this.offlineData.set(key, offlineData);
    this.saveOfflineData();
  }

  // Retrieve offline data
  getOfflineData<T>(key: string): T | null {
    const data = this.offlineData.get(key);
    
    if (!data) {
      return null;
    }

    // Check if data has expired
    if (data.expiry && new Date() > data.expiry) {
      this.offlineData.delete(key);
      this.saveOfflineData();
      return null;
    }

    return data.data as T;
  }

  // Check if specific data exists offline
  hasOfflineData(key: string): boolean {
    return this.offlineData.has(key) && this.getOfflineData(key) !== null;
  }

  // Clear specific offline data
  clearOfflineData(key: string): void {
    this.offlineData.delete(key);
    this.saveOfflineData();
  }

  // Clear all offline data
  clearAllOfflineData(): void {
    this.offlineData.clear();
    this.offlineActions = [];
    this.saveOfflineData();
  }

  // Get offline statistics
  getOfflineStats(): {
    pendingActions: number;
    storedDataItems: number;
    totalStorageSize: number;
    oldestAction?: Date;
  } {
    const storageString = JSON.stringify({
      actions: this.offlineActions,
      data: Array.from(this.offlineData.values())
    });

    return {
      pendingActions: this.offlineActions.length,
      storedDataItems: this.offlineData.size,
      totalStorageSize: new Blob([storageString]).size,
      oldestAction: this.offlineActions.length > 0 
        ? new Date(Math.min(...this.offlineActions.map(a => a.timestamp.getTime())))
        : undefined
    };
  }

  // Essential data for offline mode
  cacheEssentialData(): Promise<void> {
    return new Promise((resolve) => {
      // Cache user profile
      const userProfile = localStorage.getItem('user');
      if (userProfile) {
        this.storeOfflineData('user_profile', JSON.parse(userProfile), 24);
      }

      // Cache recent orders (mock data)
      const recentOrders = this.getMockRecentOrders();
      this.storeOfflineData('recent_orders', recentOrders, 4);

      // Cache product categories
      const categories = this.getMockCategories();
      this.storeOfflineData('product_categories', categories, 12);

      // Cache cart data
      const cartData = localStorage.getItem('shopping_cart');
      if (cartData) {
        this.storeOfflineData('shopping_cart', JSON.parse(cartData), 168); // 1 week
      }

      console.log('💾 Essential data cached for offline use');
      resolve();
    });
  }

  private syncOfflineActions(): void {
    if (this.offlineActions.length === 0) {
      return;
    }

    console.log(`🔄 Syncing ${this.offlineActions.length} offline actions`);

    // Process actions in order
    const actionsToSync = [...this.offlineActions];
    this.offlineActions = [];

    actionsToSync.forEach(action => {
      this.syncAction(action);
    });
  }

  private syncAction(action: OfflineAction): void {
    // In a real implementation, you would make HTTP calls here
    console.log('🔄 Syncing action:', action);

    // Simulate success/failure
    const success = Math.random() > 0.1; // 90% success rate

    if (success) {
      console.log('✅ Action synced successfully:', action.id);
    } else {
      action.retryCount++;
      
      if (action.retryCount < action.maxRetries) {
        console.log('🔄 Retrying action:', action.id, `(${action.retryCount}/${action.maxRetries})`);
        this.offlineActions.push(action);
      } else {
        console.error('❌ Action failed permanently:', action.id);
        this.notificationService.show({
          type: 'error',
          title: 'Sync Failed',
          message: `Failed to sync action: ${action.type} ${action.endpoint}`,
          duration: 5000
        });
      }
    }

    this.saveOfflineData();
  }

  private saveOfflineData(): void {
    try {
      const dataToSave = {
        actions: this.offlineActions,
        data: Array.from(this.offlineData.entries()).map(([key, value]) => ({
          key,
          ...value
        })),
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('offline_data', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  private loadOfflineData(): void {
    try {
      const savedData = localStorage.getItem('offline_data');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        
        this.offlineActions = parsed.actions || [];
        
        if (parsed.data) {
          parsed.data.forEach((item: any) => {
            this.offlineData.set(item.key, {
              key: item.key,
              data: item.data,
              timestamp: new Date(item.timestamp),
              expiry: item.expiry ? new Date(item.expiry) : undefined
            });
          });
        }

        console.log('📂 Loaded offline data:', this.getOfflineStats());
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Mock data for demo purposes
  private getMockRecentOrders(): any[] {
    return [
      {
        id: '1',
        date: new Date(Date.now() - 86400000), // 1 day ago
        status: 'delivered',
        total: 129.99,
        items: 3
      },
      {
        id: '2', 
        date: new Date(Date.now() - 172800000), // 2 days ago
        status: 'shipped',
        total: 89.50,
        items: 2
      }
    ];
  }

  private getMockCategories(): any[] {
    return [
      { id: '1', name: 'Electronics', slug: 'electronics' },
      { id: '2', name: 'Clothing', slug: 'clothing' },
      { id: '3', name: 'Home & Garden', slug: 'home-garden' },
      { id: '4', name: 'Sports', slug: 'sports' },
      { id: '5', name: 'Books', slug: 'books' }
    ];
  }

  // Utility methods for components
  showOfflineBanner(): boolean {
    return this.isOffline();
  }

  getOfflineModeMessage(): string {
    const stats = this.getOfflineStats();
    if (stats.pendingActions > 0) {
      return `Offline mode: ${stats.pendingActions} changes waiting to sync`;
    }
    return 'You are currently offline';
  }

  // Clean up expired data
  cleanupExpiredData(): void {
    const now = new Date();
    let cleanedCount = 0;

    for (const [key, data] of this.offlineData.entries()) {
      if (data.expiry && now > data.expiry) {
        this.offlineData.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired offline data items`);
      this.saveOfflineData();
    }
  }
}