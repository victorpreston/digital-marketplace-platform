import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { Subscription, interval } from 'rxjs';

import { ErrorHandlingService, ErrorStats } from '../../../core/services/error-handling.service';
import { PerformanceMonitoringService } from '../../../core/services/performance-monitoring.service';
import { StateManagementService } from '../../../core/services/state-management.service';
import { ConnectionService } from '../../../core/services/connection.service';
import { OfflineService } from '../../../core/services/offline.service';

@Component({
  selector: 'app-health-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatTableModule
  ],
  template: `
    <div class="health-dashboard">
      <div class="dashboard-header">
        <h1>
          <mat-icon>health_and_safety</mat-icon>
          Application Health Dashboard
        </h1>
        <div class="last-updated">
          Last updated: {{ lastUpdated | date:'medium' }}
          <button mat-icon-button (click)="refresh()" [disabled]="refreshing">
            <mat-icon [class.spinning]="refreshing">refresh</mat-icon>
          </button>
        </div>
      </div>

      <mat-tab-group>
        <!-- System Status Tab -->
        <mat-tab label="System Status">
          <div class="tab-content">
            <div class="status-grid">
              <!-- Overall Health -->
              <mat-card class="status-card">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon [color]="getOverallHealthColor()">
                      {{ getOverallHealthIcon() }}
                    </mat-icon>
                    Overall Health
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="health-score">
                    <span class="score">{{ overallHealthScore }}</span>
                    <span class="max">/100</span>
                  </div>
                  <mat-chip [color]="getOverallHealthColor()" selected>
                    {{ getOverallHealthStatus() }}
                  </mat-chip>
                </mat-card-content>
              </mat-card>

              <!-- Connection Status -->
              <mat-card class="status-card">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon [color]="connectionState.status === 'connected' ? 'primary' : 'warn'">
                      {{ connectionState.status === 'connected' ? 'cloud_done' : 'cloud_off' }}
                    </mat-icon>
                    Connection
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <mat-chip [color]="connectionState.status === 'connected' ? 'primary' : 'warn'" selected>
                    {{ connectionState.status | titlecase }}
                  </mat-chip>
                  <div class="status-details" *ngIf="connectionState.responseTime">
                    Response: {{ connectionState.responseTime }}ms
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Error Rate -->
              <mat-card class="status-card">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon [color]="getErrorRateColor()">error_outline</mat-icon>
                    Error Rate
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="metric-value">
                    {{ errorStats.unresolved }} errors
                  </div>
                  <mat-chip [color]="getErrorRateColor()" selected>
                    {{ getErrorRateStatus() }}
                  </mat-chip>
                </mat-card-content>
              </mat-card>

              <!-- Performance -->
              <mat-card class="status-card">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon [color]="getPerformanceColor()">speed</mat-icon>
                    Performance
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="metric-value">
                    {{ performanceSummary.avgLoadTime ? (performanceSummary.avgLoadTime | number:'1.0-0') + 'ms' : 'N/A' }}
                  </div>
                  <mat-chip [color]="getPerformanceColor()" selected>
                    {{ getPerformanceStatus() }}
                  </mat-chip>
                </mat-card-content>
              </mat-card>
            </div>

            <!-- Performance Alerts -->
            <mat-card *ngIf="performanceAlerts.length > 0" class="alerts-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon color="warn">warning</mat-icon>
                  Performance Alerts
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="alert-list">
                  <div *ngFor="let alert of performanceAlerts" class="alert-item">
                    <mat-icon [color]="alert.severity === 'high' ? 'warn' : 'accent'">
                      {{ alert.severity === 'high' ? 'error' : 'warning' }}
                    </mat-icon>
                    <span class="alert-message">{{ alert.message }}</span>
                    <mat-chip [color]="alert.severity === 'high' ? 'warn' : 'accent'" class="severity-chip">
                      {{ alert.severity }}
                    </mat-chip>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Error Tracking Tab -->
        <mat-tab label="Error Tracking">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Error Statistics</mat-card-title>
                <mat-card-subtitle>
                  Total: {{ errorStats.total }} | 
                  Unresolved: {{ errorStats.unresolved }} |
                  Resolved: {{ errorStats.resolved }}
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="error-breakdown">
                  <div class="severity-stats">
                    <div *ngFor="let severity of getSeverityList()" class="severity-item">
                      <mat-chip [color]="getSeverityColor(severity)" selected>
                        {{ severity }}: {{ errorStats.byseverity[severity] || 0 }}
                      </mat-chip>
                    </div>
                  </div>
                </div>

                <!-- Recent Errors -->
                <mat-expansion-panel *ngIf="errorStats.recent.length > 0">
                  <mat-expansion-panel-header>
                    <mat-panel-title>Recent Errors ({{ errorStats.recent.length }})</mat-panel-title>
                  </mat-expansion-panel-header>
                  
                  <div class="error-list">
                    <div *ngFor="let error of errorStats.recent" class="error-item">
                      <div class="error-header">
                        <mat-icon [color]="getSeverityColor(error.severity)">
                          {{ error.resolved ? 'check_circle' : 'error' }}
                        </mat-icon>
                        <span class="error-context">{{ error.context || 'Unknown' }}</span>
                        <span class="error-time">{{ error.timestamp | date:'short' }}</span>
                      </div>
                      <div class="error-message">{{ getErrorMessage(error.error) }}</div>
                    </div>
                  </div>
                </mat-expansion-panel>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button (click)="clearResolvedErrors()">Clear Resolved</button>
                <button mat-button (click)="exportErrors()">Export Errors</button>
              </mat-card-actions>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Performance Tab -->
        <mat-tab label="Performance">
          <div class="tab-content">
            <div class="performance-grid">
              <!-- Core Web Vitals -->
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Core Web Vitals</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="vitals-grid">
                    <div class="vital-item">
                      <div class="vital-label">LCP</div>
                      <div class="vital-value" [class]="getLCPClass()">
                        {{ performanceSummary.coreWebVitals.lcp ? (performanceSummary.coreWebVitals.lcp | number:'1.0-0') + 'ms' : 'N/A' }}
                      </div>
                    </div>
                    <div class="vital-item">
                      <div class="vital-label">FID</div>
                      <div class="vital-value" [class]="getFIDClass()">
                        {{ performanceSummary.coreWebVitals.fid ? (performanceSummary.coreWebVitals.fid | number:'1.0-0') + 'ms' : 'N/A' }}
                      </div>
                    </div>
                    <div class="vital-item">
                      <div class="vital-label">CLS</div>
                      <div class="vital-value" [class]="getCLSClass()">
                        {{ performanceSummary.coreWebVitals.cls ? (performanceSummary.coreWebVitals.cls | number:'1.0-3') : 'N/A' }}
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Memory Usage -->
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Memory Usage</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="memory-info">
                    <div class="memory-value">
                      {{ performanceSummary.memoryUsage ? (performanceSummary.memoryUsage | number:'1.0-1') + ' MB' : 'N/A' }}
                    </div>
                    <mat-progress-bar 
                      [value]="getMemoryUsagePercentage()" 
                      [color]="getMemoryUsageColor()">
                    </mat-progress-bar>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Load Times -->
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Load Performance</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="load-times">
                    <div class="load-item">
                      <span class="label">Page Load:</span>
                      <span class="value">{{ performanceSummary.avgLoadTime ? (performanceSummary.avgLoadTime | number:'1.0-0') + 'ms' : 'N/A' }}</span>
                    </div>
                    <div class="load-item">
                      <span class="label">Route Load:</span>
                      <span class="value">{{ performanceSummary.avgRouteLoadTime ? (performanceSummary.avgRouteLoadTime | number:'1.0-0') + 'ms' : 'N/A' }}</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- System State Tab -->
        <mat-tab label="Application State">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Current Application State</mat-card-title>
                <mat-card-subtitle>Real-time state information</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="state-grid">
                  <div class="state-section">
                    <h4>User State</h4>
                    <div class="state-item">
                      <span class="label">Authenticated:</span>
                      <mat-chip [color]="appState.user.isAuthenticated ? 'primary' : 'default'" selected>
                        {{ appState.user.isAuthenticated ? 'Yes' : 'No' }}
                      </mat-chip>
                    </div>
                    <div class="state-item">
                      <span class="label">Profile:</span>
                      <span>{{ appState.user.profile?.name || 'Anonymous' }}</span>
                    </div>
                  </div>

                  <div class="state-section">
                    <h4>System State</h4>
                    <div class="state-item">
                      <span class="label">Online:</span>
                      <mat-chip [color]="appState.system.isOnline ? 'primary' : 'warn'" selected>
                        {{ appState.system.isOnline ? 'Yes' : 'No' }}
                      </mat-chip>
                    </div>
                    <div class="state-item">
                      <span class="label">Backend:</span>
                      <mat-chip [color]="appState.system.backendConnected ? 'primary' : 'warn'" selected>
                        {{ appState.system.backendConnected ? 'Connected' : 'Disconnected' }}
                      </mat-chip>
                    </div>
                  </div>

                  <div class="state-section">
                    <h4>Data State</h4>
                    <div class="state-item">
                      <span class="label">Cart Items:</span>
                      <span>{{ appState.data.cart.items.length }}</span>
                    </div>
                    <div class="state-item">
                      <span class="label">Wishlist Items:</span>
                      <span>{{ appState.data.wishlist.items.length }}</span>
                    </div>
                  </div>

                  <div class="state-section">
                    <h4>Offline State</h4>
                    <div class="state-item">
                      <span class="label">Pending Actions:</span>
                      <span>{{ offlineStats.pendingActions }}</span>
                    </div>
                    <div class="state-item">
                      <span class="label">Cached Items:</span>
                      <span>{{ offlineStats.storedDataItems }}</span>
                    </div>
                  </div>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button (click)="exportState()">Export State</button>
                <button mat-button (click)="clearCache()" color="warn">Clear Cache</button>
              </mat-card-actions>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .health-dashboard {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .dashboard-header h1 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }

    .last-updated {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .tab-content {
      padding: 20px 0;
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .status-card {
      text-align: center;
    }

    .health-score .score {
      font-size: 2em;
      font-weight: bold;
      color: #4caf50;
    }

    .health-score .max {
      color: #666;
    }

    .metric-value {
      font-size: 1.5em;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .status-details {
      font-size: 0.9em;
      color: #666;
      margin-top: 8px;
    }

    .alerts-card {
      border-left: 4px solid #ff9800;
    }

    .alert-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .alert-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .alert-message {
      flex: 1;
    }

    .severity-chip {
      margin-left: auto;
    }

    .error-breakdown {
      margin-bottom: 16px;
    }

    .severity-stats {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .error-list {
      margin-top: 16px;
    }

    .error-item {
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }

    .error-item:last-child {
      border-bottom: none;
    }

    .error-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .error-context {
      font-weight: 500;
    }

    .error-time {
      margin-left: auto;
      font-size: 0.9em;
      color: #666;
    }

    .error-message {
      font-family: monospace;
      font-size: 0.9em;
      color: #666;
      padding-left: 32px;
    }

    .performance-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .vitals-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .vital-item {
      text-align: center;
    }

    .vital-label {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .vital-value {
      font-size: 1.2em;
      font-weight: bold;
    }

    .vital-value.good { color: #4caf50; }
    .vital-value.needs-improvement { color: #ff9800; }
    .vital-value.poor { color: #f44336; }

    .memory-info {
      text-align: center;
    }

    .memory-value {
      font-size: 1.5em;
      font-weight: 500;
      margin-bottom: 12px;
    }

    .load-times {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .load-item {
      display: flex;
      justify-content: space-between;
    }

    .state-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .state-section h4 {
      margin: 0 0 12px 0;
      color: #333;
    }

    .state-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0;
    }

    .state-item .label {
      font-weight: 500;
      min-width: 100px;
    }
  `]
})
export class HealthDashboardComponent implements OnInit, OnDestroy {
  lastUpdated = new Date();
  refreshing = false;
  overallHealthScore = 85;
  
  errorStats: ErrorStats = {
    total: 0,
    resolved: 0,
    unresolved: 0,
    byseverity: {},
    recent: []
  };
  
  performanceSummary: any = {
    totalMetrics: 0,
    avgLoadTime: null,
    avgRouteLoadTime: null,
    memoryUsage: null,
    coreWebVitals: {
      lcp: null,
      fid: null,
      cls: null
    }
  };
  
  performanceAlerts: any[] = [];
  connectionState: any = { status: 'disconnected' };
  appState: any = {};
  offlineStats: any = { pendingActions: 0, storedDataItems: 0 };
  
  private subscriptions: Subscription[] = [];

  constructor(
    private errorHandlingService: ErrorHandlingService,
    private performanceService: PerformanceMonitoringService,
    private stateService: StateManagementService,
    private connectionService: ConnectionService,
    private offlineService: OfflineService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.setupAutoRefresh();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadData(): void {
    // Load error statistics
    this.errorStats = this.errorHandlingService.getErrorStats();
    
    // Load performance summary
    this.performanceSummary = this.performanceService.getPerformanceSummary();
    
    // Load performance alerts
    this.performanceAlerts = this.performanceService.checkPerformanceAlerts();
    
    // Load connection state
    this.connectionState = this.connectionService.getConnectionState();
    
    // Load app state
    this.appState = this.stateService.getCurrentState();
    
    // Load offline stats
    this.offlineStats = this.offlineService.getOfflineStats();
    
    // Calculate overall health score
    this.calculateOverallHealth();
    
    this.lastUpdated = new Date();
  }

  private setupAutoRefresh(): void {
    // Auto refresh every 30 seconds
    const autoRefresh = interval(30000).subscribe(() => {
      this.loadData();
    });
    
    this.subscriptions.push(autoRefresh);
  }

  private calculateOverallHealth(): void {
    let score = 100;
    
    // Deduct points for errors
    score -= this.errorStats.unresolved * 5;
    score -= this.errorStats.byseverity['critical'] * 20;
    score -= this.errorStats.byseverity['high'] * 10;
    
    // Deduct points for performance issues
    this.performanceAlerts.forEach(alert => {
      if (alert.severity === 'high') score -= 15;
      if (alert.severity === 'medium') score -= 10;
    });
    
    // Deduct points for connection issues
    if (this.connectionState.status !== 'connected') score -= 20;
    
    this.overallHealthScore = Math.max(0, Math.min(100, score));
  }

  refresh(): void {
    this.refreshing = true;
    setTimeout(() => {
      this.loadData();
      this.refreshing = false;
    }, 1000);
  }

  // Helper methods for styling
  getOverallHealthColor(): 'primary' | 'accent' | 'warn' {
    if (this.overallHealthScore >= 80) return 'primary';
    if (this.overallHealthScore >= 60) return 'accent';
    return 'warn';
  }

  getOverallHealthIcon(): string {
    if (this.overallHealthScore >= 80) return 'check_circle';
    if (this.overallHealthScore >= 60) return 'warning';
    return 'error';
  }

  getOverallHealthStatus(): string {
    if (this.overallHealthScore >= 80) return 'Healthy';
    if (this.overallHealthScore >= 60) return 'Warning';
    return 'Critical';
  }

  getErrorRateColor(): 'primary' | 'accent' | 'warn' {
    if (this.errorStats.unresolved <= 5) return 'primary';
    if (this.errorStats.unresolved <= 20) return 'accent';
    return 'warn';
  }

  getErrorRateStatus(): string {
    if (this.errorStats.unresolved <= 5) return 'Low';
    if (this.errorStats.unresolved <= 20) return 'Medium';
    return 'High';
  }

  getPerformanceColor(): 'primary' | 'accent' | 'warn' {
    if (!this.performanceSummary.avgLoadTime) return 'primary';
    if (this.performanceSummary.avgLoadTime <= 3000) return 'primary';
    if (this.performanceSummary.avgLoadTime <= 5000) return 'accent';
    return 'warn';
  }

  getPerformanceStatus(): string {
    if (!this.performanceSummary.avgLoadTime) return 'Good';
    if (this.performanceSummary.avgLoadTime <= 3000) return 'Good';
    if (this.performanceSummary.avgLoadTime <= 5000) return 'Fair';
    return 'Poor';
  }

  getSeverityList(): string[] {
    return ['low', 'medium', 'high', 'critical'];
  }

  getSeverityColor(severity: string): 'primary' | 'accent' | 'warn' {
    switch (severity) {
      case 'low': return 'primary';
      case 'medium': return 'accent';
      case 'high': 
      case 'critical': return 'warn';
      default: return 'primary';
    }
  }

  getLCPClass(): string {
    const lcp = this.performanceSummary.coreWebVitals.lcp;
    if (!lcp) return 'good';
    if (lcp <= 2500) return 'good';
    if (lcp <= 4000) return 'needs-improvement';
    return 'poor';
  }

  getFIDClass(): string {
    const fid = this.performanceSummary.coreWebVitals.fid;
    if (!fid) return 'good';
    if (fid <= 100) return 'good';
    if (fid <= 300) return 'needs-improvement';
    return 'poor';
  }

  getCLSClass(): string {
    const cls = this.performanceSummary.coreWebVitals.cls;
    if (!cls) return 'good';
    if (cls <= 0.1) return 'good';
    if (cls <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  getMemoryUsagePercentage(): number {
    if (!this.performanceSummary.memoryUsage) return 0;
    return Math.min((this.performanceSummary.memoryUsage / 100) * 100, 100);
  }

  getMemoryUsageColor(): 'primary' | 'accent' | 'warn' {
    const usage = this.performanceSummary.memoryUsage;
    if (!usage || usage <= 50) return 'primary';
    if (usage <= 80) return 'accent';
    return 'warn';
  }

  getErrorMessage(error: any): string {
    return error?.message || error?.toString() || 'Unknown error';
  }

  // Actions
  clearResolvedErrors(): void {
    this.errorHandlingService.clearResolvedErrors();
    this.loadData();
  }

  exportErrors(): void {
    const data = this.errorHandlingService.exportErrors();
    this.downloadData(data, 'error-report.json');
  }

  exportState(): void {
    const data = this.stateService.exportState();
    this.downloadData(data, 'app-state.json');
  }

  clearCache(): void {
    this.offlineService.clearAllOfflineData();
    this.loadData();
  }

  private downloadData(data: string, filename: string): void {
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}