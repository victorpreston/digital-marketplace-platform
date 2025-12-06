import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatTabsModule
  ],
  template: `
    <div class="profile-container">
      <!-- Header -->
      <div class="profile-header">
        <button mat-icon-button routerLink="/customer/dashboard" class="back-btn">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-content">
          <h1>My Profile</h1>
          <p>Manage your personal information and preferences</p>
        </div>
      </div>

      <mat-tab-group class="profile-tabs" (selectedTabChange)="onTabChange($event)">
        <!-- Personal Information Tab -->
        <mat-tab label="Personal Info">
          <div class="tab-content">
            <mat-card class="profile-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>person</mat-icon>
                  Personal Information
                </mat-card-title>
                <mat-card-subtitle>Update your basic information</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <form [formGroup]="personalInfoForm" (ngSubmit)="updatePersonalInfo()">
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>First Name</mat-label>
                      <input matInput formControlName="firstName" required>
                      <mat-error *ngIf="personalInfoForm.get('firstName')?.errors?.['required']">
                        First name is required
                      </mat-error>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Last Name</mat-label>
                      <input matInput formControlName="lastName" required>
                      <mat-error *ngIf="personalInfoForm.get('lastName')?.errors?.['required']">
                        Last name is required
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Email Address</mat-label>
                    <input matInput formControlName="email" type="email" required>
                    <mat-error *ngIf="personalInfoForm.get('email')?.errors?.['required']">
                      Email is required
                    </mat-error>
                    <mat-error *ngIf="personalInfoForm.get('email')?.errors?.['email']">
                      Please enter a valid email
                    </mat-error>
                  </mat-form-field>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Phone Number</mat-label>
                      <input matInput formControlName="phone" type="tel">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Date of Birth</mat-label>
                      <input matInput [matDatepicker]="dobPicker" formControlName="dateOfBirth">
                      <mat-datepicker-toggle matIconSuffix [for]="dobPicker"></mat-datepicker-toggle>
                      <mat-datepicker #dobPicker></mat-datepicker>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Gender</mat-label>
                    <mat-select formControlName="gender">
                      <mat-option value="male">Male</mat-option>
                      <mat-option value="female">Female</mat-option>
                      <mat-option value="other">Other</mat-option>
                      <mat-option value="prefer-not-to-say">Prefer not to say</mat-option>
                    </mat-select>
                  </mat-form-field>
                </form>
              </mat-card-content>
              
              <mat-card-actions>
                <button mat-raised-button color="primary" 
                        [disabled]="personalInfoForm.invalid || isUpdating"
                        (click)="updatePersonalInfo()">
                  <mat-icon>save</mat-icon>
                  Update Information
                </button>
                <button mat-button (click)="resetPersonalInfo()">
                  <mat-icon>refresh</mat-icon>
                  Reset
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Security Tab -->
        <mat-tab label="Security">
          <div class="tab-content">
            <mat-card class="profile-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>security</mat-icon>
                  Password & Security
                </mat-card-title>
                <mat-card-subtitle>Manage your account security</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Current Password</mat-label>
                    <input matInput formControlName="currentPassword" 
                           [type]="hideCurrentPassword ? 'password' : 'text'" required>
                    <button mat-icon-button matIconSuffix 
                            (click)="hideCurrentPassword = !hideCurrentPassword"
                            type="button">
                      <mat-icon>{{hideCurrentPassword ? 'visibility' : 'visibility_off'}}</mat-icon>
                    </button>
                    <mat-error *ngIf="passwordForm.get('currentPassword')?.errors?.['required']">
                      Current password is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>New Password</mat-label>
                    <input matInput formControlName="newPassword" 
                           [type]="hideNewPassword ? 'password' : 'text'" required>
                    <button mat-icon-button matIconSuffix 
                            (click)="hideNewPassword = !hideNewPassword"
                            type="button">
                      <mat-icon>{{hideNewPassword ? 'visibility' : 'visibility_off'}}</mat-icon>
                    </button>
                    <mat-error *ngIf="passwordForm.get('newPassword')?.errors?.['required']">
                      New password is required
                    </mat-error>
                    <mat-error *ngIf="passwordForm.get('newPassword')?.errors?.['minlength']">
                      Password must be at least 8 characters
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Confirm New Password</mat-label>
                    <input matInput formControlName="confirmPassword" 
                           [type]="hideConfirmPassword ? 'password' : 'text'" required>
                    <button mat-icon-button matIconSuffix 
                            (click)="hideConfirmPassword = !hideConfirmPassword"
                            type="button">
                      <mat-icon>{{hideConfirmPassword ? 'visibility' : 'visibility_off'}}</mat-icon>
                    </button>
                    <mat-error *ngIf="passwordForm.get('confirmPassword')?.errors?.['required']">
                      Please confirm your password
                    </mat-error>
                    <mat-error *ngIf="passwordForm.errors?.['passwordMismatch']">
                      Passwords do not match
                    </mat-error>
                  </mat-form-field>
                </form>
              </mat-card-content>
              
              <mat-card-actions>
                <button mat-raised-button color="primary" 
                        [disabled]="passwordForm.invalid || isUpdating"
                        (click)="changePassword()">
                  <mat-icon>lock</mat-icon>
                  Change Password
                </button>
                <button mat-button (click)="resetPasswordForm()">
                  <mat-icon>refresh</mat-icon>
                  Reset
                </button>
              </mat-card-actions>
            </mat-card>

            <!-- Two-Factor Authentication -->
            <mat-card class="profile-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>verified_user</mat-icon>
                  Two-Factor Authentication
                </mat-card-title>
                <mat-card-subtitle>Add an extra layer of security</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <div class="two-factor-status">
                  <div class="status-info">
                    <mat-icon [color]="twoFactorEnabled ? 'accent' : 'warn'">
                      {{ twoFactorEnabled ? 'check_circle' : 'warning' }}
                    </mat-icon>
                    <div>
                      <h3>{{ twoFactorEnabled ? 'Enabled' : 'Disabled' }}</h3>
                      <p>{{ twoFactorEnabled ? 
                          'Your account is protected with 2FA' : 
                          'Enable 2FA for better security' }}</p>
                    </div>
                  </div>
                </div>
              </mat-card-content>
              
              <mat-card-actions>
                <button mat-raised-button 
                        [color]="twoFactorEnabled ? 'warn' : 'primary'"
                        (click)="toggleTwoFactor()">
                  <mat-icon>{{ twoFactorEnabled ? 'toggle_off' : 'toggle_on' }}</mat-icon>
                  {{ twoFactorEnabled ? 'Disable' : 'Enable' }} 2FA
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Preferences Tab -->
        <mat-tab label="Preferences">
          <div class="tab-content">
            <mat-card class="profile-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>settings</mat-icon>
                  Communication Preferences
                </mat-card-title>
                <mat-card-subtitle>Choose how you want to hear from us</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <form [formGroup]="preferencesForm">
                  <div class="preference-item">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Language</mat-label>
                      <mat-select formControlName="language">
                        <mat-option value="en">English</mat-option>
                        <mat-option value="es">Spanish</mat-option>
                        <mat-option value="fr">French</mat-option>
                        <mat-option value="de">German</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <div class="preference-item">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Currency</mat-label>
                      <mat-select formControlName="currency">
                        <mat-option value="USD">USD - US Dollar</mat-option>
                        <mat-option value="EUR">EUR - Euro</mat-option>
                        <mat-option value="GBP">GBP - British Pound</mat-option>
                        <mat-option value="CAD">CAD - Canadian Dollar</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <div class="preference-item">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Time Zone</mat-label>
                      <mat-select formControlName="timezone">
                        <mat-option value="America/New_York">Eastern Time</mat-option>
                        <mat-option value="America/Chicago">Central Time</mat-option>
                        <mat-option value="America/Denver">Mountain Time</mat-option>
                        <mat-option value="America/Los_Angeles">Pacific Time</mat-option>
                        <mat-option value="Europe/London">GMT</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                </form>
              </mat-card-content>
              
              <mat-card-actions>
                <button mat-raised-button color="primary" 
                        [disabled]="isUpdating"
                        (click)="updatePreferences()">
                  <mat-icon>save</mat-icon>
                  Save Preferences
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .back-btn {
      flex-shrink: 0;
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

    .profile-tabs {
      width: 100%;
    }

    .tab-content {
      padding: 24px 0;
    }

    .profile-card {
      margin-bottom: 24px;
    }

    .profile-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .half-width {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .preference-item {
      margin-bottom: 16px;
    }

    .two-factor-status {
      padding: 16px;
      border-radius: 8px;
      background-color: #f5f5f5;
    }

    .status-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .status-info mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .status-info h3 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 500;
    }

    .status-info p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 0.9rem;
    }

    mat-card-actions {
      padding: 16px 24px;
      display: flex;
      gap: 12px;
    }

    mat-card-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .profile-container {
        padding: 16px;
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .half-width {
        width: 100%;
      }

      mat-card-actions {
        flex-direction: column;
        align-items: stretch;
      }

      mat-card-actions button {
        justify-content: center;
      }
    }
  `]
})
export class CustomerProfileComponent implements OnInit {
  personalInfoForm!: FormGroup;
  passwordForm!: FormGroup;
  preferencesForm!: FormGroup;

  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  twoFactorEnabled = false;
  isUpdating = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  private initializeForms() {
    this.personalInfoForm = this.fb.group({
      firstName: ['John', Validators.required],
      lastName: ['Doe', Validators.required],
      email: ['john.doe@example.com', [Validators.required, Validators.email]],
      phone: ['+1 (555) 123-4567'],
      dateOfBirth: [new Date('1990-05-15')],
      gender: ['male']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.preferencesForm = this.fb.group({
      language: ['en'],
      currency: ['USD'],
      timezone: ['America/New_York']
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onTabChange(event: any) {
    // Handle tab changes if needed
    console.log('Tab changed to:', event.index);
  }

  updatePersonalInfo() {
    if (this.personalInfoForm.valid) {
      this.isUpdating = true;
      
      // TODO: Call actual service
      setTimeout(() => {
        this.isUpdating = false;
        this.snackBar.open('Profile updated successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }, 1500);
    }
  }

  resetPersonalInfo() {
    this.personalInfoForm.reset();
    this.loadUserProfile();
  }

  changePassword() {
    if (this.passwordForm.valid) {
      this.isUpdating = true;
      
      // TODO: Call actual service
      setTimeout(() => {
        this.isUpdating = false;
        this.passwordForm.reset();
        this.snackBar.open('Password changed successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }, 1500);
    }
  }

  resetPasswordForm() {
    this.passwordForm.reset();
  }

  toggleTwoFactor() {
    this.twoFactorEnabled = !this.twoFactorEnabled;
    const message = this.twoFactorEnabled ? 
      'Two-factor authentication enabled!' : 
      'Two-factor authentication disabled!';
    
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  updatePreferences() {
    this.isUpdating = true;
    
    // TODO: Call actual service
    setTimeout(() => {
      this.isUpdating = false;
      this.snackBar.open('Preferences updated successfully!', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }, 1500);
  }

  private loadUserProfile() {
    // TODO: Replace with actual service call
    // this.userService.getProfile().subscribe(profile => {
    //   this.personalInfoForm.patchValue(profile);
    // });
  }
}