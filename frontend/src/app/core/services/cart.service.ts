import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { CartItem } from '../models/common.model';
import { Product } from '../models/product.model';

interface CartMetadata {
  createdAt: Date;
  lastUpdated: Date;
  userId?: string;
  sessionId: string;
  version: number;
}

interface CartStorage {
  items: CartItem[];
  metadata: CartMetadata;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_KEY = 'nebulamart_cart';
  private readonly CART_BACKUP_KEY = 'nebulamart_cart_backup';
  private readonly CART_EXPIRY_DAYS = 30; // Cart expires after 30 days
  private readonly SYNC_INTERVAL = 30000; // Sync every 30 seconds when online
  
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private cartCountSubject = new BehaviorSubject<number>(0);
  private cartTotalSubject = new BehaviorSubject<number>(0);
  private cartMetadata!: CartMetadata;
  private syncTimer: any;
  private isOnline = navigator.onLine;
  private pendingSyncSubject = new Subject<boolean>();

  public cartItems$ = this.cartItemsSubject.asObservable();
  public cartCount$ = this.cartCountSubject.asObservable();
  public cartTotal$ = this.cartTotalSubject.asObservable();
  public pendingSync$ = this.pendingSyncSubject.asObservable();

  constructor() {
    this.initializeCart();
    this.setupNetworkListeners();
    this.startSyncTimer();
  }

  // Add item to cart
  addToCart(product: Product, quantity: number = 1): void {
    const currentItems = this.cartItemsSubject.value;
    const existingItemIndex = currentItems.findIndex(item => item.productId === product.id);

    if (existingItemIndex > -1) {
      // Update existing item
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex].quantity += quantity;
      this.updateCart(updatedItems);
    } else {
      // Add new item
      const newItem: CartItem = {
        productId: product.id,
        product,
        quantity,
        addedAt: new Date()
      };
      this.updateCart([...currentItems, newItem]);
    }
  }

  // Remove item from cart
  removeFromCart(productId: string): void {
    const currentItems = this.cartItemsSubject.value;
    const updatedItems = currentItems.filter(item => item.productId !== productId);
    this.updateCart(updatedItems);
  }

  // Update item quantity
  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentItems = this.cartItemsSubject.value;
    const itemIndex = currentItems.findIndex(item => item.productId === productId);

    if (itemIndex > -1) {
      const updatedItems = [...currentItems];
      updatedItems[itemIndex].quantity = quantity;
      this.updateCart(updatedItems);
    }
  }

  // Clear cart
  clearCart(): void {
    this.updateCart([]);
  }

  // Get cart item count
  getCartCount(): number {
    return this.cartCountSubject.value;
  }

  // Get cart total
  getCartTotal(): number {
    return this.cartTotalSubject.value;
  }

  // Get cart items
  getCartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  // Check if item is in cart
  isInCart(productId: string): boolean {
    return this.cartItemsSubject.value.some(item => item.productId === productId);
  }

  // Get item quantity in cart
  getItemQuantity(productId: string): number {
    const item = this.cartItemsSubject.value.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  }

  // Enhanced cart management methods
  recoverCart(): boolean {
    try {
      const backupData = localStorage.getItem(this.CART_BACKUP_KEY);
      if (backupData) {
        const backup: CartStorage = JSON.parse(backupData);
        if (this.isCartValid(backup)) {
          this.loadCartData(backup);
          this.saveCartToStorage(backup.items);
          localStorage.removeItem(this.CART_BACKUP_KEY);
          return true;
        }
      }
    } catch (error) {
      console.error('Error recovering cart:', error);
    }
    return false;
  }

  createCartSnapshot(): void {
    try {
      const cartData: CartStorage = {
        items: this.getCartItems(),
        metadata: this.cartMetadata
      };
      localStorage.setItem(this.CART_BACKUP_KEY, JSON.stringify(cartData));
    } catch (error) {
      console.error('Error creating cart snapshot:', error);
    }
  }

  getCartAge(): number {
    return Date.now() - this.cartMetadata.createdAt.getTime();
  }

  isCartExpired(): boolean {
    const ageInDays = this.getCartAge() / (1000 * 60 * 60 * 24);
    return ageInDays > this.CART_EXPIRY_DAYS;
  }

  getCartMetadata(): CartMetadata {
    return { ...this.cartMetadata };
  }

  // Sync with server methods
  async syncWithServer(): Promise<void> {
    if (!this.isOnline) {
      this.pendingSyncSubject.next(true);
      return;
    }

    try {
      // TODO: Implement actual server sync
      // const serverCart = await this.http.post('/api/cart/sync', {
      //   items: this.getCartItems(),
      //   metadata: this.cartMetadata
      // }).toPromise();
      // this.mergeWithServerCart(serverCart.items);
      
      this.pendingSyncSubject.next(false);
      console.log('Cart synced with server');
    } catch (error) {
      console.error('Error syncing cart with server:', error);
      this.pendingSyncSubject.next(true);
    }
  }

  // Private methods
  private initializeCart(): void {
    this.generateSessionId();
    this.loadCartFromStorage();
    
    if (this.isCartExpired()) {
      console.log('Cart expired, clearing...');
      this.clearCart();
    }
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Network online, syncing cart...');
      this.syncWithServer();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.pendingSyncSubject.next(true);
      console.log('Network offline, cart will sync when online');
    });
  }

  private startSyncTimer(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(() => {
      if (this.isOnline && this.getCartCount() > 0) {
        this.syncWithServer();
      }
    }, this.SYNC_INTERVAL);
  }

  private updateCart(items: CartItem[]): void {
    this.cartItemsSubject.next(items);
    this.updateCartCount(items);
    this.updateCartTotal(items);
    this.updateMetadata();
    this.saveCartToStorage(items);
    
    if (this.isOnline) {
      this.syncWithServer();
    }
  }

  private updateCartCount(items: CartItem[]): void {
    const count = items.reduce((total, item) => total + item.quantity, 0);
    this.cartCountSubject.next(count);
  }

  private updateCartTotal(items: CartItem[]): void {
    const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    this.cartTotalSubject.next(total);
  }

  private updateMetadata(): void {
    this.cartMetadata.lastUpdated = new Date();
    this.cartMetadata.version += 1;
  }

  private generateSessionId(): void {
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    this.cartMetadata = {
      createdAt: new Date(),
      lastUpdated: new Date(),
      sessionId,
      version: 1
    };
  }

  private saveCartToStorage(items: CartItem[]): void {
    try {
      const cartData: CartStorage = {
        items,
        metadata: this.cartMetadata
      };
      localStorage.setItem(this.CART_KEY, JSON.stringify(cartData));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
      // Try to save to backup location
      this.createCartSnapshot();
    }
  }

  private loadCartFromStorage(): void {
    try {
      const cartData = localStorage.getItem(this.CART_KEY);
      if (cartData) {
        const storage: CartStorage = JSON.parse(cartData);
        if (this.isCartValid(storage)) {
          this.loadCartData(storage);
        } else {
          // Try to recover from backup
          if (!this.recoverCart()) {
            this.clearCart();
          }
        }
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      // Try to recover from backup
      if (!this.recoverCart()) {
        this.clearCart();
      }
    }
  }

  private loadCartData(storage: CartStorage): void {
    // Convert date strings back to Date objects
    storage.items.forEach(item => {
      item.addedAt = new Date(item.addedAt);
    });
    
    this.cartMetadata = {
      ...storage.metadata,
      createdAt: new Date(storage.metadata.createdAt),
      lastUpdated: new Date(storage.metadata.lastUpdated)
    };
    
    this.cartItemsSubject.next(storage.items);
    this.updateCartCount(storage.items);
    this.updateCartTotal(storage.items);
  }

  private isCartValid(storage: CartStorage): boolean {
    if (!storage.items || !storage.metadata) {
      return false;
    }
    
    // Check if cart is not corrupted
    if (!Array.isArray(storage.items)) {
      return false;
    }
    
    // Check each item has required properties
    return storage.items.every(item => 
      item.productId && item.product && typeof item.quantity === 'number' && item.addedAt
    );
  }

  // Cleanup method
  ngOnDestroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
  }

  // Merge cart with server (when user logs in)
  mergeWithServerCart(serverCartItems: CartItem[]): void {
    const localItems = this.cartItemsSubject.value;
    const mergedItems: CartItem[] = [...serverCartItems];

    // Add local items that don't exist on server
    localItems.forEach(localItem => {
      const existsOnServer = serverCartItems.some(serverItem => 
        serverItem.productId === localItem.productId
      );
      
      if (!existsOnServer) {
        mergedItems.push(localItem);
      } else {
        // Update server item with higher quantity
        const serverItemIndex = mergedItems.findIndex(item => 
          item.productId === localItem.productId
        );
        if (serverItemIndex > -1 && localItem.quantity > mergedItems[serverItemIndex].quantity) {
          mergedItems[serverItemIndex].quantity = localItem.quantity;
        }
      }
    });

    this.updateCart(mergedItems);
  }

  // Get cart summary for checkout
  getCartSummary(): {
    items: CartItem[];
    subtotal: number;
    itemCount: number;
    estimatedTax: number;
    estimatedShipping: number;
    total: number;
  } {
    const items = this.getCartItems();
    const subtotal = this.getCartTotal();
    const itemCount = this.getCartCount();
    const estimatedTax = subtotal * 0.08; // 8% tax estimate
    const estimatedShipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
    const total = subtotal + estimatedTax + estimatedShipping;

    return {
      items,
      subtotal,
      itemCount,
      estimatedTax,
      estimatedShipping,
      total
    };
  }
}