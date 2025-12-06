import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../core/models/common.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="cart-container">
      <div class="cart-header">
        <h1>
          <mat-icon>shopping_cart</mat-icon>
          Shopping Cart
        </h1>
        <p *ngIf="cartItems.length > 0">{{ cartItems.length }} item(s) in your cart</p>
      </div>

      <!-- Empty Cart State -->
      <div *ngIf="cartItems.length === 0" class="empty-cart">
        <mat-card>
          <mat-card-content>
            <div class="empty-cart-content">
              <mat-icon class="empty-icon">shopping_cart</mat-icon>
              <h2>Your cart is empty</h2>
              <p>Add some products to get started!</p>
              <button mat-raised-button color="primary" routerLink="/products">
                <mat-icon>storefront</mat-icon>
                Continue Shopping
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Cart Items -->
      <div *ngIf="cartItems.length > 0" class="cart-content">
        <div class="cart-items">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Cart Items</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="cart-item" *ngFor="let item of cartItems">
                <div class="item-image">
                  <img [src]="item.product.images[0].url" [alt]="item.product.name">
                </div>
                
                <div class="item-details">
                  <h3>{{ item.product.name }}</h3>
                  <p class="item-description">{{ item.product.description }}</p>
                  <p class="item-price">\${{ item.product.price | number:'1.2-2' }}</p>
                  <p class="item-availability" [class.low-stock]="item.product.inventory.available < item.product.inventory.threshold">
                    <mat-icon>{{ item.product.inventory.available > 0 ? 'check_circle' : 'cancel' }}</mat-icon>
                    {{ item.product.inventory.available > 0 ? 'In Stock' : 'Out of Stock' }}
                  </p>
                </div>
                
                <div class="item-quantity">
                  <label>Quantity:</label>
                  <div class="quantity-controls">
                    <button mat-icon-button (click)="decreaseQuantity(item.productId)" [disabled]="item.quantity <= 1">
                      <mat-icon>remove</mat-icon>
                    </button>
                    <span class="quantity">{{ item.quantity }}</span>
                    <button mat-icon-button (click)="increaseQuantity(item.productId)" 
                            [disabled]="item.quantity >= item.product.inventory.available">
                      <mat-icon>add</mat-icon>
                    </button>
                  </div>
                </div>
                
                <div class="item-total">
                  <p class="total-price">\${{ (item.product.price * item.quantity) | number:'1.2-2' }}</p>
                  <button mat-icon-button color="warn" (click)="removeItem(item.productId)" class="remove-btn">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
        
        <div class="cart-summary">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Order Summary</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="summary-row">
                <span>Subtotal ({{ cartSummary.itemCount }} items):</span>
                <span>\${{ cartSummary.subtotal | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row">
                <span>Estimated Tax:</span>
                <span>\${{ cartSummary.estimatedTax | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row">
                <span>Shipping:</span>
                <span *ngIf="cartSummary.estimatedShipping === 0" class="free-shipping">FREE</span>
                <span *ngIf="cartSummary.estimatedShipping > 0">\${{ cartSummary.estimatedShipping | number:'1.2-2' }}</span>
              </div>
              <mat-divider></mat-divider>
              <div class="summary-row total-row">
                <span><strong>Total:</strong></span>
                <span><strong>\${{ cartSummary.total | number:'1.2-2' }}</strong></span>
              </div>
              
              <div class="shipping-note" *ngIf="cartSummary.subtotal < 50">
                <mat-icon>info</mat-icon>
                <span>Add \${{ (50 - cartSummary.subtotal) | number:'1.2-2' }} more for free shipping!</span>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button routerLink="/products">
                <mat-icon>storefront</mat-icon>
                Continue Shopping
              </button>
              <button mat-raised-button color="primary" routerLink="/cart/checkout" class="checkout-btn">
                <mat-icon>payment</mat-icon>
                Proceed to Checkout
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div *ngIf="cartItems.length > 0" class="quick-actions">
        <button mat-button color="warn" (click)="clearCart()" class="clear-cart-btn">
          <mat-icon>clear_all</mat-icon>
          Clear Cart
        </button>
      </div>
    </div>
  `,
  styles: [`
    .cart-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .cart-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .cart-header h1 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: var(--primary-color);
      margin-bottom: 8px;
    }

    .cart-header p {
      color: #666;
      font-size: 16px;
    }

    .empty-cart {
      display: flex;
      justify-content: center;
    }

    .empty-cart-content {
      text-align: center;
      padding: 60px 40px;
    }

    .empty-icon {
      font-size: 120px;
      width: 120px;
      height: 120px;
      color: #ccc;
      margin-bottom: 20px;
    }

    .cart-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 100px 1fr auto auto;
      gap: 20px;
      padding: 20px 0;
      border-bottom: 1px solid #eee;
      align-items: start;
    }

    .cart-item:last-child {
      border-bottom: none;
    }

    .item-image img {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 8px;
    }

    .item-details h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 500;
    }

    .item-description {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 14px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .item-price {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--primary-color);
    }

    .item-availability {
      display: flex;
      align-items: center;
      gap: 4px;
      margin: 0;
      font-size: 14px;
      color: #4caf50;
    }

    .item-availability.low-stock {
      color: #ff9800;
    }

    .item-availability mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .item-quantity {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .item-quantity label {
      font-size: 14px;
      font-weight: 500;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 4px;
    }

    .quantity {
      min-width: 40px;
      text-align: center;
      font-weight: 500;
    }

    .item-total {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }

    .total-price {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--primary-color);
    }

    .remove-btn {
      opacity: 0.7;
    }

    .remove-btn:hover {
      opacity: 1;
    }

    .cart-summary {
      position: sticky;
      top: 20px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .total-row {
      margin-top: 16px;
      font-size: 18px;
    }

    .free-shipping {
      color: #4caf50;
      font-weight: 600;
    }

    .shipping-note {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 12px;
      background-color: #e3f2fd;
      border-radius: 4px;
      font-size: 14px;
      color: var(--accent-color);
    }

    .shipping-note mat-icon {
      font-size: 18px;
    }

    .checkout-btn {
      width: 100%;
      height: 48px;
      margin-top: 16px;
    }

    .quick-actions {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }

    .clear-cart-btn {
      opacity: 0.7;
    }

    .clear-cart-btn:hover {
      opacity: 1;
    }

    @media (max-width: 768px) {
      .cart-content {
        grid-template-columns: 1fr;
      }

      .cart-item {
        grid-template-columns: 80px 1fr;
        grid-template-rows: auto auto auto;
        gap: 12px;
      }

      .item-quantity {
        grid-column: 1 / -1;
        flex-direction: row;
        justify-content: space-between;
      }

      .item-total {
        grid-column: 1 / -1;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
    }
  `]
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartSummary: any = {};

  constructor(
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.cartItems = this.cartService.getCartItems();
    this.cartSummary = this.cartService.getCartSummary();
  }

  increaseQuantity(productId: string): void {
    const currentQuantity = this.cartService.getItemQuantity(productId);
    this.cartService.updateQuantity(productId, currentQuantity + 1);
    this.loadCart();
    this.showSnackBar('Quantity updated');
  }

  decreaseQuantity(productId: string): void {
    const currentQuantity = this.cartService.getItemQuantity(productId);
    if (currentQuantity > 1) {
      this.cartService.updateQuantity(productId, currentQuantity - 1);
      this.loadCart();
      this.showSnackBar('Quantity updated');
    }
  }

  removeItem(productId: string): void {
    this.cartService.removeFromCart(productId);
    this.loadCart();
    this.showSnackBar('Item removed from cart');
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
      this.loadCart();
      this.showSnackBar('Cart cleared');
    }
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}