import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  unit: string;
}

export interface LoadTimeMetrics {
  domContentLoaded: number;
  fullyLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
}

export interface RoutePerformance {
  route: string;
  loadTime: number;
  timestamp: Date;
}

export interface ComponentPerformance {
  component: string;
  renderTime: number;
  timestamp: Date;
}

export interface PerformanceReport {
  loadTimes: LoadTimeMetrics;
  routes: RoutePerformance[];
  components: ComponentPerformance[];
  memoryUsage?: any;
  networkInfo?: any;
  deviceInfo: {
    userAgent: string;
    screenResolution: string;
    language: string;
    timezone: string;
  };
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceMonitoringService {
  private metricsSubject = new BehaviorSubject<PerformanceMetric[]>([]);
  private routeTimings: RoutePerformance[] = [];
  private componentTimings: ComponentPerformance[] = [];
  private maxMetrics = 1000;

  public metrics$ = this.metricsSubject.asObservable();

  constructor() {
    this.initializePerformanceMonitoring();
  }

  private initializePerformanceMonitoring(): void {
    // Monitor page load performance
    this.recordPageLoadMetrics();

    // Monitor memory usage periodically
    this.startMemoryMonitoring();

    // Monitor network performance
    this.monitorNetworkPerformance();

    // Monitor user interactions
    this.monitorUserInteractions();
  }

  private recordPageLoadMetrics(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const paintEntries = performance.getEntriesByType('paint');

          // Basic load metrics
          this.recordMetric('dom-content-loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart, 'ms');
          this.recordMetric('page-load-complete', navigation.loadEventEnd - navigation.fetchStart, 'ms');
          
          // Paint metrics
          paintEntries.forEach(entry => {
            this.recordMetric(entry.name, entry.startTime, 'ms');
          });

          // Core Web Vitals
          this.recordCoreWebVitals();
        }, 0);
      });
    }
  }

  private recordCoreWebVitals(): void {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('largest-contentful-paint', lastEntry.startTime, 'ms');
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const firstInput = list.getEntries()[0];
          if (firstInput) {
            const fid = (firstInput as any).processingStart - firstInput.startTime;
            this.recordMetric('first-input-delay', fid, 'ms');
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          this.recordMetric('cumulative-layout-shift', clsValue, 'score');
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }
  }

  private startMemoryMonitoring(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memInfo = (performance as any).memory;
        this.recordMetric('memory-used', memInfo.usedJSHeapSize / 1024 / 1024, 'MB');
        this.recordMetric('memory-total', memInfo.totalJSHeapSize / 1024 / 1024, 'MB');
        this.recordMetric('memory-limit', memInfo.jsHeapSizeLimit / 1024 / 1024, 'MB');
      }, 30000); // Every 30 seconds
    }
  }

  private monitorNetworkPerformance(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.recordMetric('network-downlink', connection.downlink, 'Mbps');
      this.recordMetric('network-rtt', connection.rtt, 'ms');
      
      connection.addEventListener('change', () => {
        this.recordMetric('network-downlink', connection.downlink, 'Mbps');
        this.recordMetric('network-rtt', connection.rtt, 'ms');
      });
    }
  }

  private monitorUserInteractions(): void {
    // Monitor scroll performance
    fromEvent(window, 'scroll')
      .pipe(debounceTime(100))
      .subscribe(() => {
        const start = performance.now();
        requestAnimationFrame(() => {
          const scrollTime = performance.now() - start;
          if (scrollTime > 16) { // More than one frame
            this.recordMetric('scroll-performance', scrollTime, 'ms');
          }
        });
      });

    // Monitor click response time
    fromEvent(document, 'click').subscribe(() => {
      const start = performance.now();
      setTimeout(() => {
        const responseTime = performance.now() - start;
        this.recordMetric('click-response-time', responseTime, 'ms');
      }, 0);
    });
  }

  recordMetric(name: string, value: number, unit: string): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date(),
      unit
    };

    const currentMetrics = this.metricsSubject.value;
    const updatedMetrics = [metric, ...currentMetrics].slice(0, this.maxMetrics);
    this.metricsSubject.next(updatedMetrics);
  }

  recordRoutePerformance(route: string, loadTime: number): void {
    const routePerf: RoutePerformance = {
      route,
      loadTime,
      timestamp: new Date()
    };

    this.routeTimings.push(routePerf);
    this.recordMetric(`route-load:${route}`, loadTime, 'ms');
  }

  recordComponentPerformance(component: string, renderTime: number): void {
    const componentPerf: ComponentPerformance = {
      component,
      renderTime,
      timestamp: new Date()
    };

    this.componentTimings.push(componentPerf);
    this.recordMetric(`component-render:${component}`, renderTime, 'ms');
  }

  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    this.recordMetric(`function:${name}`, duration, 'ms');
    return result;
  }

  measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    return fn().finally(() => {
      const duration = performance.now() - start;
      this.recordMetric(`async-function:${name}`, duration, 'ms');
    });
  }

  getLoadTimeMetrics(): LoadTimeMetrics | null {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return null;
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return null;

    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');

    const metrics = this.metricsSubject.value;
    const lcp = metrics.find(m => m.name === 'largest-contentful-paint');
    const fid = metrics.find(m => m.name === 'first-input-delay');
    const cls = metrics.find(m => m.name === 'cumulative-layout-shift');

    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      fullyLoaded: navigation.loadEventEnd - navigation.fetchStart,
      firstPaint: firstPaint?.startTime || 0,
      firstContentfulPaint: firstContentfulPaint?.startTime || 0,
      largestContentfulPaint: lcp?.value,
      firstInputDelay: fid?.value,
      cumulativeLayoutShift: cls?.value
    };
  }

  getPerformanceReport(): PerformanceReport {
    return {
      loadTimes: this.getLoadTimeMetrics() || {} as LoadTimeMetrics,
      routes: [...this.routeTimings],
      components: [...this.componentTimings],
      memoryUsage: (performance as any).memory,
      networkInfo: (navigator as any).connection,
      deviceInfo: {
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      timestamp: new Date()
    };
  }

  getMetricsByType(type: string): PerformanceMetric[] {
    return this.metricsSubject.value.filter(metric => metric.name.includes(type));
  }

  getAverageMetric(name: string, timeWindow?: number): number | null {
    let metrics = this.metricsSubject.value.filter(m => m.name === name);
    
    if (timeWindow) {
      const cutoff = new Date(Date.now() - timeWindow);
      metrics = metrics.filter(m => m.timestamp > cutoff);
    }

    if (metrics.length === 0) return null;

    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  getPerformanceSummary(): {
    totalMetrics: number;
    avgLoadTime: number | null;
    avgRouteLoadTime: number | null;
    memoryUsage: number | null;
    coreWebVitals: {
      lcp: number | null;
      fid: number | null;
      cls: number | null;
    };
  } {
    const metrics = this.metricsSubject.value;
    const loadTimeMetric = this.getAverageMetric('page-load-complete');
    const routeAvg = this.routeTimings.length > 0 
      ? this.routeTimings.reduce((sum, route) => sum + route.loadTime, 0) / this.routeTimings.length
      : null;

    const memoryMetric = metrics.find(m => m.name === 'memory-used');

    return {
      totalMetrics: metrics.length,
      avgLoadTime: loadTimeMetric,
      avgRouteLoadTime: routeAvg,
      memoryUsage: memoryMetric?.value || null,
      coreWebVitals: {
        lcp: this.getAverageMetric('largest-contentful-paint'),
        fid: this.getAverageMetric('first-input-delay'),
        cls: this.getAverageMetric('cumulative-layout-shift')
      }
    };
  }

  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metricsSubject.value,
      routes: this.routeTimings,
      components: this.componentTimings,
      summary: this.getPerformanceSummary(),
      report: this.getPerformanceReport()
    }, null, 2);
  }

  clearMetrics(): void {
    this.metricsSubject.next([]);
    this.routeTimings = [];
    this.componentTimings = [];
  }

  // Performance budget checking
  checkPerformanceBudget(budgets: { [key: string]: number }): { 
    passed: boolean; 
    results: { metric: string; actual: number; budget: number; passed: boolean }[] 
  } {
    const results = Object.entries(budgets).map(([metric, budget]) => {
      const actual = this.getAverageMetric(metric) || 0;
      return {
        metric,
        actual,
        budget,
        passed: actual <= budget
      };
    });

    return {
      passed: results.every(r => r.passed),
      results
    };
  }

  // Alert system for performance issues
  checkPerformanceAlerts(): { type: string; message: string; severity: 'low' | 'medium' | 'high' }[] {
    const alerts: { type: string; message: string; severity: 'low' | 'medium' | 'high' }[] = [];
    const summary = this.getPerformanceSummary();

    // Check load time
    if (summary.avgLoadTime && summary.avgLoadTime > 3000) {
      alerts.push({
        type: 'load-time',
        message: `Average load time is ${Math.round(summary.avgLoadTime)}ms (recommended: <3000ms)`,
        severity: summary.avgLoadTime > 5000 ? 'high' : 'medium'
      });
    }

    // Check memory usage
    if (summary.memoryUsage && summary.memoryUsage > 50) {
      alerts.push({
        type: 'memory-usage',
        message: `High memory usage: ${Math.round(summary.memoryUsage)}MB`,
        severity: summary.memoryUsage > 100 ? 'high' : 'medium'
      });
    }

    // Check Core Web Vitals
    if (summary.coreWebVitals.lcp && summary.coreWebVitals.lcp > 2500) {
      alerts.push({
        type: 'lcp',
        message: `LCP is ${Math.round(summary.coreWebVitals.lcp)}ms (recommended: <2500ms)`,
        severity: summary.coreWebVitals.lcp > 4000 ? 'high' : 'medium'
      });
    }

    if (summary.coreWebVitals.fid && summary.coreWebVitals.fid > 100) {
      alerts.push({
        type: 'fid',
        message: `FID is ${Math.round(summary.coreWebVitals.fid)}ms (recommended: <100ms)`,
        severity: summary.coreWebVitals.fid > 300 ? 'high' : 'medium'
      });
    }

    if (summary.coreWebVitals.cls && summary.coreWebVitals.cls > 0.1) {
      alerts.push({
        type: 'cls',
        message: `CLS is ${summary.coreWebVitals.cls.toFixed(3)} (recommended: <0.1)`,
        severity: summary.coreWebVitals.cls > 0.25 ? 'high' : 'medium'
      });
    }

    return alerts;
  }
}