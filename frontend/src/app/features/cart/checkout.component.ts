import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { CartItem, CreateOrderRequest, Address, PaymentMethod } from '../../core/models/common.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDividerModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="checkout-container">
      <div class="checkout-header">
        <h1>
          <mat-icon>payment</mat-icon>
          Checkout
        </h1>
        <p>Complete your order</p>
      </div>

      <div class="checkout-content">
        <mat-stepper #stepper [linear]="true" class="checkout-stepper">
          
          <!-- Step 1: Shipping Information -->
          <mat-step [stepControl]="shippingForm" label="Shipping Information">
            <form [formGroup]="shippingForm" class="step-form">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Shipping Address</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-row">
                    <mat-form-field>
                      <mat-label>First Name</mat-label>
                      <input matInput formControlName="firstName" required>
                      <mat-error *ngIf="shippingForm.get('firstName')?.hasError('required')">
                        First name is required
                      </mat-error>
                    </mat-form-field>
                    
                    <mat-form-field>
                      <mat-label>Last Name</mat-label>
                      <input matInput formControlName="lastName" required>
                      <mat-error *ngIf="shippingForm.get('lastName')?.hasError('required')">
                        Last name is required
                      </mat-error>
                    </mat-form-field>
                  </div>
                  
                  <div class="form-row">
                    <mat-form-field class="full-width">
                      <mat-label>Street Address</mat-label>
                      <input matInput formControlName="street" required>
                      <mat-error *ngIf="shippingForm.get('street')?.hasError('required')">
                        Street address is required
                      </mat-error>
                    </mat-form-field>
                  </div>
                  
                  <div class="form-row">
                    <mat-form-field>
                      <mat-label>City</mat-label>
                      <input matInput formControlName="city" required>
                      <mat-error *ngIf="shippingForm.get('city')?.hasError('required')">
                        City is required
                      </mat-error>
                    </mat-form-field>
                    
                    <mat-form-field>
                      <mat-label>State</mat-label>
                      <mat-select formControlName="state" required>
                        <mat-option *ngFor="let state of states" [value]="state.code">
                          {{ state.name }}
                        </mat-option>
                      </mat-select>
                      <mat-error *ngIf="shippingForm.get('state')?.hasError('required')">
                        State is required
                      </mat-error>
                    </mat-form-field>
                    
                    <mat-form-field>
                      <mat-label>ZIP Code</mat-label>
                      <input matInput formControlName="zipCode" required>
                      <mat-error *ngIf="shippingForm.get('zipCode')?.hasError('required')">
                        ZIP code is required
                      </mat-error>
                    </mat-form-field>
                  </div>
                  
                  <div class="form-row">
                    <mat-form-field class="full-width">
                      <mat-label>Phone Number</mat-label>
                      <input matInput formControlName="phone" type="tel">
                    </mat-form-field>
                  </div>
                  
                  <mat-checkbox formControlName="saveAddress">
                    Save this address for future orders
                  </mat-checkbox>
                </mat-card-content>
              </mat-card>
              
              <div class="step-actions">
                <button mat-raised-button matStepperNext color="primary" [disabled]="!shippingForm.valid">
                  Continue to Payment
                </button>
              </div>
            </form>
          </mat-step>
          
          <!-- Step 2: Payment Information -->
          <mat-step [stepControl]="paymentForm" label="Payment Information">
            <form [formGroup]="paymentForm" class="step-form">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Payment Method</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <mat-radio-group formControlName="paymentType" class="payment-options">
                    <mat-radio-button value="credit_card">
                      <mat-icon>credit_card</mat-icon>
                      Credit/Debit Card
                    </mat-radio-button>
                    <mat-radio-button value="paypal">
                      <mat-icon>account_balance_wallet</mat-icon>
                      PayPal
                    </mat-radio-button>
                    <mat-radio-button value="apple_pay">
                      <mat-icon>phone_iphone</mat-icon>
                      Apple Pay
                    </mat-radio-button>
                  </mat-radio-group>
                  
                  <!-- Credit Card Form -->
                  <div *ngIf="paymentForm.get('paymentType')?.value === 'credit_card'" class="credit-card-form">
                    <div class="form-row">
                      <mat-form-field class="full-width">
                        <mat-label>Card Number</mat-label>
                        <input matInput formControlName="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19">
                        <mat-icon matSuffix>credit_card</mat-icon>
                      </mat-form-field>
                    </div>
                    
                    <div class="form-row">
                      <mat-form-field>
                        <mat-label>Expiry Date</mat-label>
                        <input matInput formControlName="expiryDate" placeholder="MM/YY" maxlength="5">
                      </mat-form-field>
                      
                      <mat-form-field>
                        <mat-label>CVV</mat-label>
                        <input matInput formControlName="cvv" type="password" maxlength="4">
                        <mat-icon matSuffix>security</mat-icon>
                      </mat-form-field>
                    </div>
                    
                    <div class="form-row">
                      <mat-form-field class="full-width">
                        <mat-label>Cardholder Name</mat-label>
                        <input matInput formControlName="cardholderName">
                      </mat-form-field>
                    </div>
                  </div>
                  
                  <!-- Alternative Payment Messages -->
                  <div *ngIf="paymentForm.get('paymentType')?.value === 'paypal'" class="payment-message">
                    <mat-icon>info</mat-icon>
                    <p>You will be redirected to PayPal to complete your payment securely.</p>
                  </div>
                  
                  <div *ngIf="paymentForm.get('paymentType')?.value === 'apple_pay'" class="payment-message">
                    <mat-icon>info</mat-icon>
                    <p>Use Touch ID or Face ID to pay with Apple Pay.</p>
                  </div>
                </mat-card-content>
              </mat-card>
              
              <div class="step-actions">
                <button mat-button matStepperPrevious>Back</button>
                <button mat-raised-button matStepperNext color="primary" [disabled]="!paymentForm.valid">
                  Review Order
                </button>
              </div>
            </form>
          </mat-step>
          
          <!-- Step 3: Order Review -->
          <mat-step label="Review & Place Order">
            <div class="step-form">
              <div class="review-sections">
                <!-- Order Items -->
                <mat-card class="review-section">
                  <mat-card-header>
                    <mat-card-title>Order Items</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="review-item" *ngFor="let item of cartItems">
                      <img [src]="item.product.images[0].url" [alt]="item.product.name" class="review-item-image">
                      <div class="review-item-details">
                        <h4>{{ item.product.name }}</h4>
                        <p>Quantity: {{ item.quantity }}</p>
                        <p class="item-price">\${{ (item.product.price * item.quantity) | number:'1.2-2' }}</p>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
                
                <!-- Shipping Address -->
                <mat-card class="review-section">
                  <mat-card-header>
                    <mat-card-title>Shipping Address</mat-card-title>
                    <button mat-icon-button (click)="stepper.selectedIndex = 0">
                      <mat-icon>edit</mat-icon>
                    </button>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="address-display">
                      <p><strong>{{ shippingForm.get('firstName')?.value }} {{ shippingForm.get('lastName')?.value }}</strong></p>
                      <p>{{ shippingForm.get('street')?.value }}</p>
                      <p>{{ shippingForm.get('city')?.value }}, {{ shippingForm.get('state')?.value }} {{ shippingForm.get('zipCode')?.value }}</p>
                      <p *ngIf="shippingForm.get('phone')?.value">{{ shippingForm.get('phone')?.value }}</p>
                    </div>
                  </mat-card-content>
                </mat-card>
                
                <!-- Payment Method -->
                <mat-card class="review-section">
                  <mat-card-header>
                    <mat-card-title>Payment Method</mat-card-title>
                    <button mat-icon-button (click)="stepper.selectedIndex = 1">
                      <mat-icon>edit</mat-icon>
                    </button>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="payment-display">
                      <div *ngIf="paymentForm.get('paymentType')?.value === 'credit_card'">
                        <p><mat-icon>credit_card</mat-icon> Credit/Debit Card</p>
                        <p *ngIf="paymentForm.get('cardNumber')?.value">**** **** **** {{ getLastFourDigits(paymentForm.get('cardNumber')?.value) }}</p>
                      </div>
                      <div *ngIf="paymentForm.get('paymentType')?.value === 'paypal'">
                        <p><mat-icon>account_balance_wallet</mat-icon> PayPal</p>
                      </div>
                      <div *ngIf="paymentForm.get('paymentType')?.value === 'apple_pay'">
                        <p><mat-icon>phone_iphone</mat-icon> Apple Pay</p>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
              
              <div class="step-actions">
                <button mat-button matStepperPrevious>Back</button>
                <button mat-raised-button color="primary" (click)="placeOrder()" [disabled]="isProcessingOrder" class="place-order-btn">
                  <mat-spinner *ngIf="isProcessingOrder" diameter="20" class="spinner"></mat-spinner>
                  <mat-icon *ngIf="!isProcessingOrder">shopping_bag</mat-icon>
                  {{ isProcessingOrder ? 'Processing...' : 'Place Order' }}
                </button>
              </div>
            </div>
          </mat-step>
        </mat-stepper>
        
        <!-- Order Summary Sidebar -->
        <div class="order-summary">
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
                <span>Shipping:</span>
                <span *ngIf="cartSummary.estimatedShipping === 0" class="free-shipping">FREE</span>
                <span *ngIf="cartSummary.estimatedShipping > 0">\${{ cartSummary.estimatedShipping | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row">
                <span>Tax:</span>
                <span>\${{ cartSummary.estimatedTax | number:'1.2-2' }}</span>
              </div>
              <mat-divider></mat-divider>
              <div class="summary-row total-row">
                <span><strong>Total:</strong></span>
                <span><strong>\${{ cartSummary.total | number:'1.2-2' }}</strong></span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .checkout-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .checkout-header h1 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: var(--primary-color);
      margin-bottom: 8px;
    }

    .checkout-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 30px;
    }

    .checkout-stepper {
      background: transparent;
    }

    .step-form {
      margin-top: 20px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-row mat-form-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .payment-options {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .payment-options mat-radio-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .payment-options mat-radio-button:hover {
      background-color: #f5f5f5;
    }

    .payment-options mat-radio-button.mat-radio-checked {
      border-color: var(--primary-color);
      background-color: rgba(255, 152, 0, 0.1);
    }

    .credit-card-form {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .payment-message {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background-color: #e3f2fd;
      border-radius: 8px;
      margin-top: 20px;
    }

    .payment-message mat-icon {
      color: var(--accent-color);
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .review-sections {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .review-section mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .review-item {
      display: flex;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid #eee;
    }

    .review-item:last-child {
      border-bottom: none;
    }

    .review-item-image {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 8px;
    }

    .review-item-details h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
    }

    .review-item-details p {
      margin: 4px 0;
      color: #666;
    }

    .item-price {
      color: var(--primary-color) !important;
      font-weight: 600 !important;
    }

    .address-display p,
    .payment-display p {
      margin: 8px 0;
    }

    .payment-display {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .place-order-btn {
      min-width: 200px;
      height: 48px;
      position: relative;
    }

    .spinner {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }

    .order-summary {
      position: sticky;
      top: 20px;
      height: fit-content;
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

    @media (max-width: 768px) {
      .checkout-content {
        grid-template-columns: 1fr;
      }

      .form-row {
        flex-direction: column;
      }

      .order-summary {
        order: -1;
        position: static;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  shippingForm: FormGroup;
  paymentForm: FormGroup;
  cartItems: CartItem[] = [];
  cartSummary: any = {};
  isProcessingOrder = false;

  states = [
    { code: 'AL', name: 'Alabama' },
    { code: 'CA', name: 'California' },
    { code: 'FL', name: 'Florida' },
    { code: 'NY', name: 'New York' },
    { code: 'TX', name: 'Texas' },
    // Add more states as needed
  ];

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.shippingForm = this.createShippingForm();
    this.paymentForm = this.createPaymentForm();
  }

  ngOnInit(): void {
    this.loadCart();
    this.loadUserProfile();
  }

  private createShippingForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      street: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
      phone: [''],
      saveAddress: [false]
    });
  }

  private createPaymentForm(): FormGroup {
    return this.fb.group({
      paymentType: ['credit_card', [Validators.required]],
      cardNumber: [''],
      expiryDate: [''],
      cvv: [''],
      cardholderName: ['']
    });
  }

  private loadCart(): void {
    this.cartItems = this.cartService.getCartItems();
    this.cartSummary = this.cartService.getCartSummary();
    
    if (this.cartItems.length === 0) {
      this.router.navigate(['/cart']);
    }
  }

  private loadUserProfile(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.shippingForm.patchValue({
        firstName: (currentUser as any).firstName || '',
        lastName: (currentUser as any).lastName || ''
      });
    }
  }

  getLastFourDigits(cardNumber: string): string {
    if (!cardNumber) return '';
    return cardNumber.replace(/\s/g, '').slice(-4);
  }

  async placeOrder(): Promise<void> {
    if (!this.shippingForm.valid || !this.paymentForm.valid) {
      this.showSnackBar('Please complete all required fields');
      return;
    }

    this.isProcessingOrder = true;

    try {
      const shippingAddress: Address = {
        street: this.shippingForm.get('street')?.value,
        city: this.shippingForm.get('city')?.value,
        state: this.shippingForm.get('state')?.value,
        zipCode: this.shippingForm.get('zipCode')?.value,
        country: 'US'
      };

      const paymentMethod: PaymentMethod = {
        type: this.paymentForm.get('paymentType')?.value,
        cardNumber: this.paymentForm.get('cardNumber')?.value,
        expiryDate: this.paymentForm.get('expiryDate')?.value
      };

      const orderRequest: CreateOrderRequest = {
        items: this.cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price
        })),
        shippingAddress,
        paymentMethod,
        totalAmount: this.cartSummary.total
      };

      const order = await this.orderService.createOrder(orderRequest).toPromise();
      
      if (order) {
        // Clear cart after successful order
        this.cartService.clearCart();
        
        // Navigate to order confirmation
        this.router.navigate(['/orders', order.id]);
      }
      
      this.showSnackBar('Order placed successfully!');

    } catch (error) {
      console.error('Order creation failed:', error);
      this.showSnackBar('Failed to place order. Please try again.');
    } finally {
      this.isProcessingOrder = false;
    }
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}