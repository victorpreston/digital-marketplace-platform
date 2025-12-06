import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

export interface PaymentDetails {
  method: 'credit_card' | 'paypal' | 'bank_transfer';
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  cardholderName?: string;
  paypalEmail?: string;
  bankAccount?: string;
  bankRoutingNumber?: string;
  savePaymentMethod: boolean;
}

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDividerModule
  ],
  template: `
    <div class="payment-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>payment</mat-icon>
            Payment Information
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()">
            
            <!-- Payment Method Selection -->
            <div class="payment-method-section">
              <h3>Payment Method</h3>
              <mat-radio-group formControlName="method" class="payment-methods">
                <mat-radio-button value="credit_card" class="payment-option">
                  <div class="payment-option-content">
                    <mat-icon>credit_card</mat-icon>
                    <span>Credit/Debit Card</span>
                  </div>
                </mat-radio-button>
                
                <mat-radio-button value="paypal" class="payment-option">
                  <div class="payment-option-content">
                    <mat-icon>account_balance_wallet</mat-icon>
                    <span>PayPal</span>
                  </div>
                </mat-radio-button>
                
                <mat-radio-button value="bank_transfer" class="payment-option">
                  <div class="payment-option-content">
                    <mat-icon>account_balance</mat-icon>
                    <span>Bank Transfer</span>
                  </div>
                </mat-radio-button>
              </mat-radio-group>
            </div>

            <mat-divider></mat-divider>

            <!-- Credit Card Details -->
            <div class="card-details-section" *ngIf="paymentForm.get('method')?.value === 'credit_card'">
              <h3>Card Details</h3>
              
              <div class="form-row">
                <mat-form-field class="full-width">
                  <mat-label>Cardholder Name</mat-label>
                  <input matInput formControlName="cardholderName" placeholder="John Doe">
                  <mat-icon matSuffix>person</mat-icon>
                  <mat-error *ngIf="paymentForm.get('cardholderName')?.hasError('required')">
                    Cardholder name is required
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field class="full-width">
                  <mat-label>Card Number</mat-label>
                  <input matInput formControlName="cardNumber" 
                         placeholder="1234 5678 9012 3456"
                         maxlength="19"
                         (input)="formatCardNumber($event)">
                  <mat-icon matSuffix [ngClass]="getCardType()">credit_card</mat-icon>
                  <mat-error *ngIf="paymentForm.get('cardNumber')?.hasError('required')">
                    Card number is required
                  </mat-error>
                  <mat-error *ngIf="paymentForm.get('cardNumber')?.hasError('pattern')">
                    Invalid card number
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field>
                  <mat-label>Expiry Month</mat-label>
                  <mat-select formControlName="expiryMonth">
                    <mat-option *ngFor="let month of months" [value]="month.value">
                      {{ month.label }}
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="paymentForm.get('expiryMonth')?.hasError('required')">
                    Expiry month is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Expiry Year</mat-label>
                  <mat-select formControlName="expiryYear">
                    <mat-option *ngFor="let year of years" [value]="year">
                      {{ year }}
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="paymentForm.get('expiryYear')?.hasError('required')">
                    Expiry year is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field>
                  <mat-label>CVV</mat-label>
                  <input matInput formControlName="cvv" 
                         type="password" 
                         maxlength="4" 
                         placeholder="123">
                  <mat-icon matSuffix matTooltip="3-4 digit security code on back of card">info</mat-icon>
                  <mat-error *ngIf="paymentForm.get('cvv')?.hasError('required')">
                    CVV is required
                  </mat-error>
                  <mat-error *ngIf="paymentForm.get('cvv')?.hasError('pattern')">
                    Invalid CVV
                  </mat-error>
                </mat-form-field>
              </div>
            </div>

            <!-- PayPal Details -->
            <div class="paypal-details-section" *ngIf="paymentForm.get('method')?.value === 'paypal'">
              <h3>PayPal Details</h3>
              <div class="form-row">
                <mat-form-field class="full-width">
                  <mat-label>PayPal Email</mat-label>
                  <input matInput formControlName="paypalEmail" 
                         type="email" 
                         placeholder="your-email@example.com">
                  <mat-icon matSuffix>email</mat-icon>
                  <mat-error *ngIf="paymentForm.get('paypalEmail')?.hasError('required')">
                    PayPal email is required
                  </mat-error>
                  <mat-error *ngIf="paymentForm.get('paypalEmail')?.hasError('email')">
                    Invalid email address
                  </mat-error>
                </mat-form-field>
              </div>
              
              <div class="paypal-info">
                <mat-icon>info</mat-icon>
                <p>You will be redirected to PayPal to complete your payment securely.</p>
              </div>
            </div>

            <!-- Bank Transfer Details -->
            <div class="bank-details-section" *ngIf="paymentForm.get('method')?.value === 'bank_transfer'">
              <h3>Bank Transfer Details</h3>
              <div class="form-row">
                <mat-form-field class="full-width">
                  <mat-label>Account Number</mat-label>
                  <input matInput formControlName="bankAccount" placeholder="1234567890">
                  <mat-icon matSuffix>account_balance</mat-icon>
                  <mat-error *ngIf="paymentForm.get('bankAccount')?.hasError('required')">
                    Account number is required
                  </mat-error>
                </mat-form-field>
              </div>
              
              <div class="form-row">
                <mat-form-field class="full-width">
                  <mat-label>Routing Number</mat-label>
                  <input matInput formControlName="bankRoutingNumber" placeholder="021000021">
                  <mat-icon matSuffix>route</mat-icon>
                  <mat-error *ngIf="paymentForm.get('bankRoutingNumber')?.hasError('required')">
                    Routing number is required
                  </mat-error>
                </mat-form-field>
              </div>
              
              <div class="bank-info">
                <mat-icon>info</mat-icon>
                <p>Bank transfer payments may take 3-5 business days to process.</p>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Save Payment Method -->
            <div class="save-payment-section">
              <mat-checkbox formControlName="savePaymentMethod">
                Save payment method for future purchases
              </mat-checkbox>
            </div>

            <!-- Security Info -->
            <div class="security-info">
              <mat-icon>security</mat-icon>
              <p>Your payment information is encrypted and secure</p>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .payment-form-container {
      max-width: 600px;
      margin: 0 auto;
    }

    .payment-method-section {
      margin-bottom: 24px;
    }

    .payment-methods {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 12px;
    }

    .payment-option {
      padding: 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .payment-option:hover {
      border-color: #ff7043;
    }

    .payment-option.mat-radio-checked {
      border-color: #ff7043;
      background-color: rgba(255, 112, 67, 0.05);
    }

    .payment-option-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .card-details-section,
    .paypal-details-section,
    .bank-details-section {
      margin: 24px 0;
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

    .paypal-info,
    .bank-info,
    .security-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
      margin-top: 16px;
    }

    .save-payment-section {
      margin: 24px 0;
    }

    .visa { color: #1a1f71; }
    .mastercard { color: #eb001b; }
    .amex { color: #006fcf; }
    .discover { color: #ff6000; }

    @media (max-width: 768px) {
      .payment-methods {
        flex-direction: column;
      }
      
      .form-row {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class PaymentFormComponent implements OnInit {
  @Input() initialData?: Partial<PaymentDetails>;
  @Output() paymentChange = new EventEmitter<PaymentDetails>();
  @Output() validityChange = new EventEmitter<boolean>();

  paymentForm: FormGroup;
  months = [
    { value: '01', label: 'January (01)' },
    { value: '02', label: 'February (02)' },
    { value: '03', label: 'March (03)' },
    { value: '04', label: 'April (04)' },
    { value: '05', label: 'May (05)' },
    { value: '06', label: 'June (06)' },
    { value: '07', label: 'July (07)' },
    { value: '08', label: 'August (08)' },
    { value: '09', label: 'September (09)' },
    { value: '10', label: 'October (10)' },
    { value: '11', label: 'November (11)' },
    { value: '12', label: 'December (12)' }
  ];
  years: string[] = [];

  constructor(private fb: FormBuilder) {
    this.paymentForm = this.createForm();
    this.generateYears();
  }

  ngOnInit(): void {
    if (this.initialData) {
      this.paymentForm.patchValue(this.initialData);
    }

    // Watch for form changes
    this.paymentForm.valueChanges.subscribe(() => {
      this.paymentChange.emit(this.paymentForm.value);
      this.validityChange.emit(this.paymentForm.valid);
    });

    // Watch for payment method changes to update validators
    this.paymentForm.get('method')?.valueChanges.subscribe(() => {
      this.updateValidators();
    });

    this.updateValidators();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      method: ['credit_card', Validators.required],
      cardNumber: [''],
      expiryMonth: [''],
      expiryYear: [''],
      cvv: [''],
      cardholderName: [''],
      paypalEmail: [''],
      bankAccount: [''],
      bankRoutingNumber: [''],
      savePaymentMethod: [false]
    });
  }

  private generateYears(): void {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 20 }, (_, i) => (currentYear + i).toString());
  }

  private updateValidators(): void {
    const method = this.paymentForm.get('method')?.value;
    
    // Clear all validators first
    Object.keys(this.paymentForm.controls).forEach(key => {
      if (key !== 'method' && key !== 'savePaymentMethod') {
        this.paymentForm.get(key)?.clearValidators();
      }
    });

    // Add validators based on payment method
    switch (method) {
      case 'credit_card':
        this.paymentForm.get('cardNumber')?.setValidators([
          Validators.required,
          Validators.pattern(/^[0-9\s]{13,19}$/)
        ]);
        this.paymentForm.get('expiryMonth')?.setValidators([Validators.required]);
        this.paymentForm.get('expiryYear')?.setValidators([Validators.required]);
        this.paymentForm.get('cvv')?.setValidators([
          Validators.required,
          Validators.pattern(/^[0-9]{3,4}$/)
        ]);
        this.paymentForm.get('cardholderName')?.setValidators([Validators.required]);
        break;
        
      case 'paypal':
        this.paymentForm.get('paypalEmail')?.setValidators([
          Validators.required,
          Validators.email
        ]);
        break;
        
      case 'bank_transfer':
        this.paymentForm.get('bankAccount')?.setValidators([Validators.required]);
        this.paymentForm.get('bankRoutingNumber')?.setValidators([Validators.required]);
        break;
    }

    // Update form controls
    Object.keys(this.paymentForm.controls).forEach(key => {
      this.paymentForm.get(key)?.updateValueAndValidity();
    });
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\s/g, '');
    let formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
    if (formattedValue !== event.target.value) {
      this.paymentForm.get('cardNumber')?.setValue(formattedValue, { emitEvent: false });
    }
  }

  getCardType(): string {
    const cardNumber = this.paymentForm.get('cardNumber')?.value?.replace(/\s/g, '') || '';
    
    if (cardNumber.startsWith('4')) return 'visa';
    if (cardNumber.startsWith('5') || cardNumber.startsWith('2')) return 'mastercard';
    if (cardNumber.startsWith('3')) return 'amex';
    if (cardNumber.startsWith('6')) return 'discover';
    
    return '';
  }

  onSubmit(): void {
    if (this.paymentForm.valid) {
      this.paymentChange.emit(this.paymentForm.value);
    }
  }
}