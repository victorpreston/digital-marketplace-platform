import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="loading-container" [ngClass]="'loading-' + type">
      
      <!-- Spinner Loading -->
      <div *ngIf="type === 'spinner'" class="spinner-loading">
        <mat-spinner [diameter]="size" [color]="color"></mat-spinner>
        <p class="loading-text" *ngIf="message">{{ message }}</p>
        <div class="loading-details" *ngIf="details">
          <small>{{ details }}</small>
        </div>
      </div>

      <!-- Progress Bar Loading -->
      <div *ngIf="type === 'progress'" class="progress-loading">
        <div class="progress-info">
          <h3 *ngIf="message">{{ message }}</h3>
          <p *ngIf="details">{{ details }}</p>
        </div>
        <mat-progress-bar 
          [mode]="progressMode" 
          [value]="progressValue"
          [color]="color">
        </mat-progress-bar>
        <div class="progress-text" *ngIf="progressMode === 'determinate'">
          {{ progressValue }}% complete
        </div>
      </div>

      <!-- Skeleton Loading -->
      <div *ngIf="type === 'skeleton'" class="skeleton-loading">
        <div class="skeleton-content">
          <!-- Card Skeleton -->
          <div *ngIf="skeletonType === 'card'" class="skeleton-card">
            <div class="skeleton-header">
              <div class="skeleton-avatar"></div>
              <div class="skeleton-lines">
                <div class="skeleton-line short"></div>
                <div class="skeleton-line medium"></div>
              </div>
            </div>
            <div class="skeleton-body">
              <div class="skeleton-line long"></div>
              <div class="skeleton-line medium"></div>
              <div class="skeleton-line short"></div>
            </div>
          </div>

          <!-- List Skeleton -->
          <div *ngIf="skeletonType === 'list'" class="skeleton-list">
            <div class="skeleton-list-item" *ngFor="let item of skeletonItems">
              <div class="skeleton-item-icon"></div>
              <div class="skeleton-item-content">
                <div class="skeleton-line short"></div>
                <div class="skeleton-line long"></div>
              </div>
              <div class="skeleton-item-action"></div>
            </div>
          </div>

          <!-- Table Skeleton -->
          <div *ngIf="skeletonType === 'table'" class="skeleton-table">
            <div class="skeleton-table-header">
              <div class="skeleton-line short" *ngFor="let col of skeletonColumns"></div>
            </div>
            <div class="skeleton-table-row" *ngFor="let row of skeletonRows">
              <div class="skeleton-line medium" *ngFor="let col of skeletonColumns"></div>
            </div>
          </div>

          <!-- Product Grid Skeleton -->
          <div *ngIf="skeletonType === 'product-grid'" class="skeleton-product-grid">
            <div class="skeleton-product-card" *ngFor="let item of skeletonItems">
              <div class="skeleton-product-image"></div>
              <div class="skeleton-product-info">
                <div class="skeleton-line medium"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-line long"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dots Loading -->
      <div *ngIf="type === 'dots'" class="dots-loading">
        <div class="dots-container">
          <div class="dot" [style.animation-delay]="'0ms'"></div>
          <div class="dot" [style.animation-delay]="'150ms'"></div>
          <div class="dot" [style.animation-delay]="'300ms'"></div>
        </div>
        <p class="loading-text" *ngIf="message">{{ message }}</p>
      </div>

      <!-- Pulse Loading -->
      <div *ngIf="type === 'pulse'" class="pulse-loading">
        <div class="pulse-circle"></div>
        <p class="loading-text" *ngIf="message">{{ message }}</p>
      </div>

      <!-- Custom Loading -->
      <div *ngIf="type === 'custom'" class="custom-loading">
        <div class="custom-animation">
          <mat-icon class="spinning-icon">{{ customIcon || 'autorenew' }}</mat-icon>
        </div>
        <p class="loading-text" *ngIf="message">{{ message }}</p>
      </div>

      <!-- Overlay Loading -->
      <div *ngIf="overlay" class="loading-overlay">
        <div class="overlay-content">
          <mat-spinner [diameter]="40" color="primary"></mat-spinner>
          <p *ngIf="message">{{ message }}</p>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      position: relative;
    }

    .loading-container.loading-inline {
      padding: 1rem;
    }

    .loading-container.loading-fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(255, 255, 255, 0.9);
      z-index: 9999;
    }

    /* Spinner Loading */
    .spinner-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .loading-text {
      margin: 0;
      font-size: 1rem;
      color: #666;
      text-align: center;
    }

    .loading-details {
      text-align: center;
      color: #999;
      font-size: 0.875rem;
    }

    /* Progress Loading */
    .progress-loading {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
      max-width: 400px;
    }

    .progress-info h3 {
      margin: 0;
      font-size: 1.1rem;
      color: #333;
    }

    .progress-info p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .progress-text {
      text-align: center;
      font-size: 0.875rem;
      color: #666;
      margin-top: 0.5rem;
    }

    /* Skeleton Loading */
    .skeleton-loading {
      width: 100%;
      max-width: 800px;
    }

    .skeleton-content {
      animation: skeleton-loading 1.5s ease-in-out infinite alternate;
    }

    @keyframes skeleton-loading {
      0% { opacity: 1; }
      100% { opacity: 0.6; }
    }

    .skeleton-line {
      height: 1rem;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: skeleton-wave 1.5s ease-in-out infinite;
      border-radius: 4px;
      margin: 0.5rem 0;
    }

    .skeleton-line.short { width: 30%; }
    .skeleton-line.medium { width: 60%; }
    .skeleton-line.long { width: 90%; }

    @keyframes skeleton-wave {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    /* Card Skeleton */
    .skeleton-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1rem;
    }

    .skeleton-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .skeleton-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: skeleton-wave 1.5s ease-in-out infinite;
    }

    .skeleton-lines {
      flex: 1;
    }

    /* List Skeleton */
    .skeleton-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .skeleton-list-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .skeleton-item-icon {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: skeleton-wave 1.5s ease-in-out infinite;
    }

    .skeleton-item-content {
      flex: 1;
    }

    .skeleton-item-action {
      width: 80px;
      height: 32px;
      border-radius: 4px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: skeleton-wave 1.5s ease-in-out infinite;
    }

    /* Table Skeleton */
    .skeleton-table {
      width: 100%;
    }

    .skeleton-table-header,
    .skeleton-table-row {
      display: grid;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .skeleton-table-header {
      background: #f8f9fa;
      font-weight: bold;
    }

    /* Product Grid Skeleton */
    .skeleton-product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }

    .skeleton-product-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }

    .skeleton-product-image {
      width: 100%;
      height: 150px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: skeleton-wave 1.5s ease-in-out infinite;
    }

    .skeleton-product-info {
      padding: 1rem;
    }

    /* Dots Loading */
    .dots-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .dots-container {
      display: flex;
      gap: 0.5rem;
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #ff7043;
      animation: dots-bounce 1.4s ease-in-out infinite both;
    }

    @keyframes dots-bounce {
      0%, 80%, 100% { 
        transform: scale(0.8);
        opacity: 0.5;
      } 
      40% { 
        transform: scale(1.2);
        opacity: 1;
      }
    }

    /* Pulse Loading */
    .pulse-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .pulse-circle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #ff7043;
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.2);
        opacity: 0.7;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    /* Custom Loading */
    .custom-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .custom-animation {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .spinning-icon {
      font-size: 48px;
      color: #ff7043;
      animation: spin 2s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Overlay Loading */
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .overlay-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .overlay-content p {
      margin: 0;
      color: #333;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .loading-container {
        padding: 1rem;
      }

      .skeleton-product-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      }

      .progress-loading {
        max-width: 100%;
      }
    }
  `]
})
export class LoadingStateComponent {
  @Input() type: 'spinner' | 'progress' | 'skeleton' | 'dots' | 'pulse' | 'custom' = 'spinner';
  @Input() message?: string;
  @Input() details?: string;
  @Input() size: number = 50;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() overlay: boolean = false;
  
  // Progress specific
  @Input() progressMode: 'determinate' | 'indeterminate' = 'indeterminate';
  @Input() progressValue: number = 0;
  
  // Skeleton specific
  @Input() skeletonType: 'card' | 'list' | 'table' | 'product-grid' = 'card';
  @Input() skeletonItems: number[] = [1, 2, 3];
  @Input() skeletonRows: number[] = [1, 2, 3, 4];
  @Input() skeletonColumns: number[] = [1, 2, 3, 4];
  
  // Custom specific
  @Input() customIcon?: string;
}