import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

export interface AppState {
  ui: UIState;
  user: UserState;
  data: DataState;
  system: SystemState;
}

export interface UIState {
  loading: boolean;
  sidenavOpen: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationState[];
}

export interface UserState {
  isAuthenticated: boolean;
  profile: any | null;
  preferences: UserPreferences;
  permissions: string[];
}

export interface DataState {
  cart: {
    items: any[];
    total: number;
    lastUpdated: Date | null;
  };
  wishlist: {
    items: any[];
    lastUpdated: Date | null;
  };
  recentlyViewed: any[];
}

export interface SystemState {
  isOnline: boolean;
  backendConnected: boolean;
  version: string;
  maintenance: boolean;
  features: Record<string, boolean>;
}

export interface NotificationState {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  currency: string;
  timezone: string;
  autoSave: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StateManagementService {
  private initialState: AppState = {
    ui: {
      loading: false,
      sidenavOpen: true,
      theme: 'light',
      language: 'en',
      notifications: []
    },
    user: {
      isAuthenticated: false,
      profile: null,
      preferences: {
        emailNotifications: true,
        pushNotifications: false,
        currency: 'USD',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        autoSave: true
      },
      permissions: []
    },
    data: {
      cart: {
        items: [],
        total: 0,
        lastUpdated: null
      },
      wishlist: {
        items: [],
        lastUpdated: null
      },
      recentlyViewed: []
    },
    system: {
      isOnline: navigator.onLine,
      backendConnected: false,
      version: '1.0.0',
      maintenance: false,
      features: {
        enableOfflineMode: true,
        enablePushNotifications: false,
        enableAnalytics: true,
        enableTwoFactorAuth: false
      }
    }
  };

  private stateSubject = new BehaviorSubject<AppState>(this.initialState);
  
  // Selectors
  public state$ = this.stateSubject.asObservable();
  public ui$ = this.state$.pipe(map(state => state.ui), distinctUntilChanged());
  public user$ = this.state$.pipe(map(state => state.user), distinctUntilChanged());
  public data$ = this.state$.pipe(map(state => state.data), distinctUntilChanged());
  public system$ = this.state$.pipe(map(state => state.system), distinctUntilChanged());

  // Specific selectors
  public isLoading$ = this.ui$.pipe(map(ui => ui.loading));
  public isAuthenticated$ = this.user$.pipe(map(user => user.isAuthenticated));
  public cartItemsCount$ = this.data$.pipe(map(data => data.cart.items.length));
  public isOnline$ = this.system$.pipe(map(system => system.isOnline));

  constructor() {
    this.loadStateFromStorage();
    this.subscribeToStateChanges();
  }

  // State update methods
  updateUIState(partialState: Partial<UIState>): void {
    const currentState = this.stateSubject.value;
    const newState: AppState = {
      ...currentState,
      ui: { ...currentState.ui, ...partialState }
    };
    this.stateSubject.next(newState);
  }

  updateUserState(partialState: Partial<UserState>): void {
    const currentState = this.stateSubject.value;
    const newState: AppState = {
      ...currentState,
      user: { ...currentState.user, ...partialState }
    };
    this.stateSubject.next(newState);
  }

  updateDataState(partialState: Partial<DataState>): void {
    const currentState = this.stateSubject.value;
    const newState: AppState = {
      ...currentState,
      data: { ...currentState.data, ...partialState }
    };
    this.stateSubject.next(newState);
  }

  updateSystemState(partialState: Partial<SystemState>): void {
    const currentState = this.stateSubject.value;
    const newState: AppState = {
      ...currentState,
      system: { ...currentState.system, ...partialState }
    };
    this.stateSubject.next(newState);
  }

  // Specific actions
  setLoading(loading: boolean): void {
    this.updateUIState({ loading });
  }

  toggleSidenav(): void {
    const currentState = this.stateSubject.value;
    this.updateUIState({ sidenavOpen: !currentState.ui.sidenavOpen });
  }

  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.updateUIState({ theme });
  }

  addNotification(notification: Omit<NotificationState, 'id' | 'timestamp' | 'read'>): void {
    const currentState = this.stateSubject.value;
    const newNotification: NotificationState = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false
    };
    
    const updatedNotifications = [newNotification, ...currentState.ui.notifications].slice(0, 50);
    this.updateUIState({ notifications: updatedNotifications });
  }

  markNotificationRead(id: string): void {
    const currentState = this.stateSubject.value;
    const updatedNotifications = currentState.ui.notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    );
    this.updateUIState({ notifications: updatedNotifications });
  }

  clearNotifications(): void {
    this.updateUIState({ notifications: [] });
  }

  setUserProfile(profile: any): void {
    this.updateUserState({ 
      profile,
      isAuthenticated: true 
    });
  }

  logout(): void {
    this.updateUserState({
      isAuthenticated: false,
      profile: null,
      permissions: []
    });
    
    // Clear user-specific data
    this.updateDataState({
      cart: { items: [], total: 0, lastUpdated: null },
      wishlist: { items: [], lastUpdated: null }
    });
  }

  updateCartItems(items: any[]): void {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.updateDataState({
      cart: {
        items,
        total,
        lastUpdated: new Date()
      }
    });
  }

  addToCart(item: any): void {
    const currentState = this.stateSubject.value;
    const existingItem = currentState.data.cart.items.find(i => i.id === item.id);
    
    let updatedItems;
    if (existingItem) {
      updatedItems = currentState.data.cart.items.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      updatedItems = [...currentState.data.cart.items, { ...item, quantity: 1 }];
    }
    
    this.updateCartItems(updatedItems);
  }

  removeFromCart(itemId: string): void {
    const currentState = this.stateSubject.value;
    const updatedItems = currentState.data.cart.items.filter(item => item.id !== itemId);
    this.updateCartItems(updatedItems);
  }

  updateWishlist(items: any[]): void {
    this.updateDataState({
      wishlist: {
        items,
        lastUpdated: new Date()
      }
    });
  }

  addToRecentlyViewed(item: any): void {
    const currentState = this.stateSubject.value;
    const filtered = currentState.data.recentlyViewed.filter(i => i.id !== item.id);
    const updated = [item, ...filtered].slice(0, 20); // Keep last 20 items
    
    this.updateDataState({ recentlyViewed: updated });
  }

  setOnlineStatus(isOnline: boolean): void {
    this.updateSystemState({ isOnline });
  }

  setBackendConnectionStatus(connected: boolean): void {
    this.updateSystemState({ backendConnected: connected });
  }

  enableMaintenanceMode(): void {
    this.updateSystemState({ maintenance: true });
  }

  disableMaintenanceMode(): void {
    this.updateSystemState({ maintenance: false });
  }

  updateFeatureFlag(feature: string, enabled: boolean): void {
    const currentState = this.stateSubject.value;
    const updatedFeatures = {
      ...currentState.system.features,
      [feature]: enabled
    };
    this.updateSystemState({ features: updatedFeatures });
  }

  // Getters for current state
  getCurrentState(): AppState {
    return this.stateSubject.value;
  }

  getUIState(): UIState {
    return this.stateSubject.value.ui;
  }

  getUserState(): UserState {
    return this.stateSubject.value.user;
  }

  getDataState(): DataState {
    return this.stateSubject.value.data;
  }

  getSystemState(): SystemState {
    return this.stateSubject.value.system;
  }

  // Reset state
  resetState(): void {
    this.stateSubject.next(this.initialState);
    localStorage.removeItem('app_state');
  }

  // Export/Import state
  exportState(): string {
    return JSON.stringify(this.stateSubject.value, null, 2);
  }

  importState(stateJson: string): void {
    try {
      const importedState = JSON.parse(stateJson);
      this.stateSubject.next(importedState);
    } catch (error) {
      console.error('Failed to import state:', error);
    }
  }

  private loadStateFromStorage(): void {
    try {
      const savedState = localStorage.getItem('app_state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Merge with initial state to handle new properties
        const mergedState = this.deepMerge(this.initialState, parsedState);
        this.stateSubject.next(mergedState);
      }
    } catch (error) {
      console.warn('Failed to load state from storage:', error);
    }
  }

  private subscribeToStateChanges(): void {
    // Save state to localStorage on changes (debounced)
    let saveTimeout: any;
    this.state$.subscribe(state => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        try {
          localStorage.setItem('app_state', JSON.stringify(state));
        } catch (error) {
          console.warn('Failed to save state to storage:', error);
        }
      }, 1000);
    });
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Development helpers
  getStateSnapshot(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      state: this.stateSubject.value
    }, null, 2);
  }

  logCurrentState(): void {
    console.log('Current App State:', this.stateSubject.value);
  }
}