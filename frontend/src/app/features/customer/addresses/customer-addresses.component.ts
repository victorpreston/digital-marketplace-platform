import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-customer-addresses',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="addresses-container">
      <!-- Header -->
      <div class="addresses-header">
        <button mat-icon-button routerLink="/customer/dashboard" class="back-btn">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-content">
          <h1>My Addresses</h1>
          <p>Manage your shipping and billing addresses</p>
        </div>
        <button mat-raised-button color="primary" (click)="addNewAddress()" class="add-btn">
          <mat-icon>add</mat-icon>
          Add Address
        </button>
      </div>

      <!-- Addresses List -->
      <div class="addresses-grid" *ngIf="addresses.length > 0">
        <mat-card class="address-card" *ngFor="let address of addresses; trackBy: trackByAddressId">
          <!-- Address Type Badges -->
          <div class="address-badges">
            <mat-chip color="primary" selected *ngIf="address.isDefault">
              <mat-icon>home</mat-icon>
              Default
            </mat-chip>
            <mat-chip color="accent" selected *ngIf="address.type === 'billing'">
              <mat-icon>receipt</mat-icon>
              Billing
            </mat-chip>
          </div>

          <mat-card-content>
            <div class="address-content">
              <h3>{{ address.label }}</h3>
              <div class="address-details">
                <p><strong>{{ address.fullName }}</strong></p>
                <p>{{ address.streetAddress }}</p>
                <p *ngIf="address.apartment">{{ address.apartment }}</p>
                <p>{{ address.city }}, {{ address.state }} {{ address.zipCode }}</p>
                <p>{{ address.country }}</p>
                <p *ngIf="address.phone">
                  <mat-icon>phone</mat-icon>
                  {{ address.phone }}
                </p>
              </div>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-button (click)="editAddress(address)">
              <mat-icon>edit</mat-icon>
              Edit
            </button>
            <button mat-button (click)="setAsDefault(address.id)" *ngIf="!address.isDefault">
              <mat-icon>home</mat-icon>
              Set Default
            </button>
            <button mat-button color="warn" (click)="deleteAddress(address.id)" 
                    [disabled]="address.isDefault && addresses.length === 1">
              <mat-icon>delete</mat-icon>
              Delete
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="addresses.length === 0">
        <mat-icon>location_on</mat-icon>
        <h2>No addresses added</h2>
        <p>Add your shipping and billing addresses for faster checkout.</p>
        <button mat-raised-button color="primary" (click)="addNewAddress()">
          <mat-icon>add</mat-icon>
          Add Your First Address
        </button>
      </div>
    </div>
  `,
  styles: [`
    .addresses-container {
      padding: 24px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .addresses-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .back-btn {
      flex-shrink: 0;
    }

    .header-content {
      flex: 1;
    }

    .header-content h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 500;
      color: #333;
    }

    .header-content p {
      margin: 4px 0 0 0;
      color: #666;
    }

    .add-btn {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .addresses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
    }

    .address-card {
      position: relative;
      transition: transform 0.2s ease;
    }

    .address-card:hover {
      transform: translateY(-2px);
    }

    .address-badges {
      position: absolute;
      top: 16px;
      right: 16px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .address-badges mat-chip {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .address-badges mat-chip mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .address-content {
      padding-top: 20px;
    }

    .address-content h3 {
      margin: 0 0 16px 0;
      font-size: 1.2rem;
      font-weight: 500;
      color: #333;
    }

    .address-details p {
      margin: 4px 0;
      color: #666;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .address-details p:first-child {
      color: #333;
      font-weight: 500;
    }

    .address-details mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #1976d2;
    }

    mat-card-actions {
      padding: 16px 24px;
      display: flex;
      gap: 8px;
    }

    mat-card-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .empty-state {
      text-align: center;
      padding: 64px 16px;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty-state h2 {
      margin: 16px 0;
      color: #333;
    }

    .empty-state p {
      margin-bottom: 24px;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    .empty-state button {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 auto;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .addresses-container {
        padding: 16px;
      }

      .addresses-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .add-btn {
        align-self: stretch;
        justify-content: center;
      }

      .addresses-grid {
        grid-template-columns: 1fr;
      }

      mat-card-actions {
        flex-wrap: wrap;
      }
    }
  `]
})
export class CustomerAddressesComponent implements OnInit {
  addresses: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadAddresses();
  }

  loadAddresses() {
    // Mock data - replace with actual service call
    this.addresses = [
      {
        id: 1,
        label: 'Home',
        fullName: 'John Doe',
        streetAddress: '123 Main Street',
        apartment: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
        phone: '+1 (555) 123-4567',
        type: 'shipping',
        isDefault: true
      },
      {
        id: 2,
        label: 'Work',
        fullName: 'John Doe',
        streetAddress: '456 Business Ave',
        apartment: 'Suite 200',
        city: 'New York',
        state: 'NY',
        zipCode: '10002',
        country: 'United States',
        phone: '+1 (555) 987-6543',
        type: 'billing',
        isDefault: false
      }
    ];
  }

  addNewAddress() {
    // Open address form dialog
    console.log('Add new address');
    this.snackBar.open('Add address functionality coming soon!', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  editAddress(address: any) {
    // Open edit address dialog
    console.log('Edit address:', address);
    this.snackBar.open('Edit address functionality coming soon!', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  setAsDefault(addressId: number) {
    this.addresses.forEach(addr => {
      addr.isDefault = addr.id === addressId;
    });
    
    const address = this.addresses.find(a => a.id === addressId);
    this.snackBar.open(`${address?.label} set as default address`, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  deleteAddress(addressId: number) {
    const address = this.addresses.find(a => a.id === addressId);
    
    if (address?.isDefault && this.addresses.length > 1) {
      // Set another address as default before deleting
      const nextAddress = this.addresses.find(a => a.id !== addressId);
      if (nextAddress) {
        nextAddress.isDefault = true;
      }
    }
    
    this.addresses = this.addresses.filter(a => a.id !== addressId);
    
    this.snackBar.open(`${address?.label} address deleted`, 'Undo', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    }).onAction().subscribe(() => {
      // Undo delete
      this.addresses.push(address);
      if (address.isDefault) {
        this.addresses.forEach(a => {
          a.isDefault = a.id === address.id;
        });
      }
    });
  }

  trackByAddressId(index: number, address: any): number {
    return address.id;
  }
}