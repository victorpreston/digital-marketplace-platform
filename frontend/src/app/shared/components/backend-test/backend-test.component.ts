import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { BackendTestService, BackendStatus, TestResult } from '../../../core/services/backend-test.service';

@Component({
  selector: 'app-backend-test',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatChipsModule
  ],
  template: `
    <div class="backend-test-container">
      <mat-card class="status-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon [color]="status.isConnected ? 'primary' : 'warn'">
              {{ status.isConnected ? 'cloud_done' : 'cloud_off' }}
            </mat-icon>
            Backend Connection Status
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div class="status-info">
            <div class="status-row">
              <span class="label">Status:</span>
              <mat-chip [color]="status.isConnected ? 'primary' : 'warn'">
                {{ status.isConnected ? 'Connected' : 'Disconnected' }}
              </mat-chip>
            </div>
            
            <div class="status-row">
              <span class="label">Last Checked:</span>
              <span>{{ status.lastChecked | date:'medium' }}</span>
            </div>
            
            <div class="status-row" *ngIf="status.responseTime">
              <span class="label">Response Time:</span>
              <span [class]="getResponseTimeClass(status.responseTime)">
                {{ status.responseTime }}ms
              </span>
            </div>
            
            <div class="status-row" *ngIf="status.error">
              <span class="label">Error:</span>
              <span class="error-message">{{ status.error }}</span>
            </div>
            
            <div class="server-info" *ngIf="status.serverInfo">
              <h4>Server Information</h4>
              <div class="info-grid">
                <div *ngIf="status.serverInfo.version">
                  <span class="label">Version:</span>
                  <span>{{ status.serverInfo.version }}</span>
                </div>
                <div *ngIf="status.serverInfo.status">
                  <span class="label">Server Status:</span>
                  <span>{{ status.serverInfo.status }}</span>
                </div>
                <div *ngIf="status.serverInfo.timestamp">
                  <span class="label">Server Time:</span>
                  <span>{{ status.serverInfo.timestamp | date:'medium' }}</span>
                </div>
              </div>
            </div>
          </div>
        </mat-card-content>
        
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="testConnection()" [disabled]="testing">
            <mat-icon>refresh</mat-icon>
            Test Connection
          </button>
          <button mat-raised-button (click)="testAllEndpoints()" [disabled]="testing">
            <mat-icon>assessment</mat-icon>
            Run Full Test
          </button>
        </mat-card-actions>
        
        <mat-progress-bar *ngIf="testing" mode="indeterminate"></mat-progress-bar>
      </mat-card>

      <!-- Test Results -->
      <mat-card class="test-results" *ngIf="testResults">
        <mat-card-header>
          <mat-card-title>API Test Results</mat-card-title>
          <mat-card-subtitle>
            Passed: {{ testResults.overall.passed }} | 
            Failed: {{ testResults.overall.failed }} | 
            Total: {{ testResults.overall.total }}
          </mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <mat-accordion>
            <!-- Authentication Tests -->
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>
                  Authentication Endpoints
                  <mat-chip [color]="getTestSuiteColor(testResults.auth)" class="test-chip">
                    {{ getPassedCount(testResults.auth) }}/{{ testResults.auth.length }}
                  </mat-chip>
                </mat-panel-title>
              </mat-expansion-panel-header>
              
              <div class="test-list">
                <div *ngFor="let test of testResults.auth" class="test-item">
                  <mat-icon [color]="test.success ? 'primary' : 'warn'">
                    {{ test.success ? 'check_circle' : 'error' }}
                  </mat-icon>
                  <span class="endpoint">{{ test.endpoint }}</span>
                  <span class="response-time">{{ test.responseTime }}ms</span>
                  <span *ngIf="test.error" class="error-message">{{ test.error }}</span>
                </div>
              </div>
            </mat-expansion-panel>

            <!-- Product Tests -->
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>
                  Product Endpoints
                  <mat-chip [color]="getTestSuiteColor(testResults.products)" class="test-chip">
                    {{ getPassedCount(testResults.products) }}/{{ testResults.products.length }}
                  </mat-chip>
                </mat-panel-title>
              </mat-expansion-panel-header>
              
              <div class="test-list">
                <div *ngFor="let test of testResults.products" class="test-item">
                  <mat-icon [color]="test.success ? 'primary' : 'warn'">
                    {{ test.success ? 'check_circle' : 'error' }}
                  </mat-icon>
                  <span class="endpoint">{{ test.endpoint }}</span>
                  <span class="response-time">{{ test.responseTime }}ms</span>
                  <span *ngIf="test.error" class="error-message">{{ test.error }}</span>
                </div>
              </div>
            </mat-expansion-panel>

            <!-- User Tests -->
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>
                  User Endpoints
                  <mat-chip [color]="getTestSuiteColor(testResults.users)" class="test-chip">
                    {{ getPassedCount(testResults.users) }}/{{ testResults.users.length }}
                  </mat-chip>
                </mat-panel-title>
              </mat-expansion-panel-header>
              
              <div class="test-list">
                <div *ngFor="let test of testResults.users" class="test-item">
                  <mat-icon [color]="test.success ? 'primary' : 'warn'">
                    {{ test.success ? 'check_circle' : 'error' }}
                  </mat-icon>
                  <span class="endpoint">{{ test.endpoint }}</span>
                  <span class="response-time">{{ test.responseTime }}ms</span>
                  <span *ngIf="test.error" class="error-message">{{ test.error }}</span>
                </div>
              </div>
            </mat-expansion-panel>

            <!-- Order Tests -->
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>
                  Order Endpoints
                  <mat-chip [color]="getTestSuiteColor(testResults.orders)" class="test-chip">
                    {{ getPassedCount(testResults.orders) }}/{{ testResults.orders.length }}
                  </mat-chip>
                </mat-panel-title>
              </mat-expansion-panel-header>
              
              <div class="test-list">
                <div *ngFor="let test of testResults.orders" class="test-item">
                  <mat-icon [color]="test.success ? 'primary' : 'warn'">
                    {{ test.success ? 'check_circle' : 'error' }}
                  </mat-icon>
                  <span class="endpoint">{{ test.endpoint }}</span>
                  <span class="response-time">{{ test.responseTime }}ms</span>
                  <span *ngIf="test.error" class="error-message">{{ test.error }}</span>
                </div>
              </div>
            </mat-expansion-panel>
          </mat-accordion>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .backend-test-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .status-card {
      margin-bottom: 20px;
    }

    .status-info {
      margin: 16px 0;
    }

    .status-row {
      display: flex;
      align-items: center;
      margin: 8px 0;
      gap: 12px;
    }

    .label {
      font-weight: 500;
      min-width: 120px;
    }

    .error-message {
      color: #f44336;
      font-family: monospace;
    }

    .response-time-fast {
      color: #4caf50;
      font-weight: 500;
    }

    .response-time-medium {
      color: #ff9800;
      font-weight: 500;
    }

    .response-time-slow {
      color: #f44336;
      font-weight: 500;
    }

    .server-info {
      margin-top: 16px;
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .server-info h4 {
      margin: 0 0 12px 0;
    }

    .info-grid > div {
      display: flex;
      align-items: center;
      margin: 4px 0;
      gap: 12px;
    }

    .test-results {
      margin-top: 20px;
    }

    .test-chip {
      margin-left: 8px;
    }

    .test-list {
      padding: 16px 0;
    }

    .test-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }

    .test-item:last-child {
      border-bottom: none;
    }

    .endpoint {
      flex: 1;
      font-family: monospace;
      font-size: 0.9em;
    }

    .response-time {
      min-width: 60px;
      text-align: right;
      font-size: 0.9em;
      color: #666;
    }

    mat-card-actions {
      display: flex;
      gap: 12px;
    }

    mat-progress-bar {
      margin-top: 16px;
    }
  `]
})
export class BackendTestComponent implements OnInit {
  status: BackendStatus = {
    isConnected: false,
    lastChecked: new Date()
  };
  
  testResults: any = null;
  testing = false;

  constructor(private backendTestService: BackendTestService) {}

  ngOnInit(): void {
    // Subscribe to status updates
    this.backendTestService.status$.subscribe(status => {
      this.status = status;
    });

    // Initial connection test
    this.testConnection();
  }

  testConnection(): void {
    this.testing = true;
    this.backendTestService.testConnection().subscribe({
      next: (status) => {
        this.status = status;
        this.testing = false;
      },
      error: (error) => {
        console.error('Connection test failed:', error);
        this.testing = false;
      }
    });
  }

  testAllEndpoints(): void {
    this.testing = true;
    this.backendTestService.testAllEndpoints().subscribe({
      next: (results) => {
        this.testResults = results;
        this.testing = false;
      },
      error: (error) => {
        console.error('Endpoint tests failed:', error);
        this.testing = false;
      }
    });
  }

  getResponseTimeClass(responseTime: number): string {
    if (responseTime < 500) return 'response-time-fast';
    if (responseTime < 2000) return 'response-time-medium';
    return 'response-time-slow';
  }

  getTestSuiteColor(tests: TestResult[]): 'primary' | 'accent' | 'warn' {
    const passed = tests.filter(t => t.success).length;
    const total = tests.length;
    
    if (passed === total) return 'primary';
    if (passed === 0) return 'warn';
    return 'accent';
  }

  getPassedCount(tests: TestResult[]): number {
    return tests.filter(t => t.success).length;
  }
}