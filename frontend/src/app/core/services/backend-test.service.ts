import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface BackendStatus {
  isConnected: boolean;
  lastChecked: Date;
  responseTime?: number;
  error?: string;
  serverInfo?: {
    version?: string;
    status?: string;
    timestamp?: string;
  };
}

export interface TestResult {
  endpoint: string;
  success: boolean;
  responseTime: number;
  error?: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class BackendTestService {
  private baseUrl = environment.production 
    ? 'https://api.nebulamart.com' 
    : 'http://localhost:8080';
  
  private statusSubject = new BehaviorSubject<BackendStatus>({
    isConnected: false,
    lastChecked: new Date()
  });

  public status$ = this.statusSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Test basic connectivity
  testConnection(): Observable<BackendStatus> {
    const startTime = Date.now();
    
    return this.http.get(`${this.baseUrl}/api/health`).pipe(
      timeout(10000), // 10 second timeout
      map((response: any) => {
        const responseTime = Date.now() - startTime;
        const status: BackendStatus = {
          isConnected: true,
          lastChecked: new Date(),
          responseTime,
          serverInfo: {
            version: response.version || '1.0.0',
            status: response.status || 'OK',
            timestamp: response.timestamp || new Date().toISOString()
          }
        };
        
        this.statusSubject.next(status);
        return status;
      }),
      catchError(error => {
        const status: BackendStatus = {
          isConnected: false,
          lastChecked: new Date(),
          responseTime: Date.now() - startTime,
          error: this.getErrorMessage(error)
        };
        
        this.statusSubject.next(status);
        return of(status);
      })
    );
  }

  // Test authentication endpoints
  testAuthEndpoints(): Observable<TestResult[]> {
    const tests: Observable<TestResult>[] = [
      this.testEndpoint('POST', '/api/auth/login', {
        email: 'test@example.com',
        password: 'testpass'
      }),
      this.testEndpoint('GET', '/api/auth/validate'),
      this.testEndpoint('POST', '/api/auth/refresh')
    ];

    return this.runTestSuite(tests);
  }

  // Test product endpoints
  testProductEndpoints(): Observable<TestResult[]> {
    const tests: Observable<TestResult>[] = [
      this.testEndpoint('GET', '/api/products/search?q=test'),
      this.testEndpoint('GET', '/api/products/categories'),
      this.testEndpoint('GET', '/api/products/featured')
    ];

    return this.runTestSuite(tests);
  }

  // Test user endpoints (requires authentication)
  testUserEndpoints(): Observable<TestResult[]> {
    const tests: Observable<TestResult>[] = [
      this.testEndpoint('GET', '/api/users/profile'),
      this.testEndpoint('GET', '/api/users/orders'),
      this.testEndpoint('GET', '/api/users/wishlist')
    ];

    return this.runTestSuite(tests);
  }

  // Test order endpoints
  testOrderEndpoints(): Observable<TestResult[]> {
    const tests: Observable<TestResult>[] = [
      this.testEndpoint('GET', '/api/orders'),
      this.testEndpoint('GET', '/api/orders/recent')
    ];

    return this.runTestSuite(tests);
  }

  // Comprehensive API test
  testAllEndpoints(): Observable<{
    overall: { passed: number; failed: number; total: number };
    auth: TestResult[];
    products: TestResult[];
    users: TestResult[];
    orders: TestResult[];
  }> {
    return new Observable(subscriber => {
      const results = {
        overall: { passed: 0, failed: 0, total: 0 },
        auth: [] as TestResult[],
        products: [] as TestResult[],
        users: [] as TestResult[],
        orders: [] as TestResult[]
      };

      let completedTests = 0;
      const totalTestSuites = 4;

      // Test auth endpoints
      this.testAuthEndpoints().subscribe(authResults => {
        results.auth = authResults;
        completedTests++;
        this.updateOverallStats(results, authResults);
        if (completedTests === totalTestSuites) {
          subscriber.next(results);
          subscriber.complete();
        }
      });

      // Test product endpoints
      this.testProductEndpoints().subscribe(productResults => {
        results.products = productResults;
        completedTests++;
        this.updateOverallStats(results, productResults);
        if (completedTests === totalTestSuites) {
          subscriber.next(results);
          subscriber.complete();
        }
      });

      // Test user endpoints
      this.testUserEndpoints().subscribe(userResults => {
        results.users = userResults;
        completedTests++;
        this.updateOverallStats(results, userResults);
        if (completedTests === totalTestSuites) {
          subscriber.next(results);
          subscriber.complete();
        }
      });

      // Test order endpoints
      this.testOrderEndpoints().subscribe(orderResults => {
        results.orders = orderResults;
        completedTests++;
        this.updateOverallStats(results, orderResults);
        if (completedTests === totalTestSuites) {
          subscriber.next(results);
          subscriber.complete();
        }
      });
    });
  }

  // Mock backend server for testing
  enableMockMode(): void {
    console.log('🔧 Mock mode enabled - using simulated responses');
    // In a real implementation, you might switch to a mock service or local data
  }

  // Get current backend status
  getCurrentStatus(): BackendStatus {
    return this.statusSubject.value;
  }

  // Check if backend is reachable
  isBackendReachable(): boolean {
    return this.statusSubject.value.isConnected;
  }

  private testEndpoint(method: string, endpoint: string, body?: any): Observable<TestResult> {
    const startTime = Date.now();
    const fullUrl = `${this.baseUrl}${endpoint}`;
    
    let httpRequest: Observable<any>;
    
    switch (method.toUpperCase()) {
      case 'GET':
        httpRequest = this.http.get(fullUrl, { headers: this.getHeaders() });
        break;
      case 'POST':
        httpRequest = this.http.post(fullUrl, body, { headers: this.getHeaders() });
        break;
      case 'PUT':
        httpRequest = this.http.put(fullUrl, body, { headers: this.getHeaders() });
        break;
      case 'DELETE':
        httpRequest = this.http.delete(fullUrl, { headers: this.getHeaders() });
        break;
      default:
        return of({
          endpoint,
          success: false,
          responseTime: 0,
          error: `Unsupported method: ${method}`
        });
    }

    return httpRequest.pipe(
      timeout(5000),
      map((response: any) => ({
        endpoint,
        success: true,
        responseTime: Date.now() - startTime,
        data: response
      })),
      catchError(error => of({
        endpoint,
        success: false,
        responseTime: Date.now() - startTime,
        error: this.getErrorMessage(error)
      }))
    );
  }

  private runTestSuite(tests: Observable<TestResult>[]): Observable<TestResult[]> {
    return new Observable(subscriber => {
      const results: TestResult[] = [];
      let completed = 0;

      tests.forEach(test => {
        test.subscribe(result => {
          results.push(result);
          completed++;
          
          if (completed === tests.length) {
            subscriber.next(results);
            subscriber.complete();
          }
        });
      });
    });
  }

  private updateOverallStats(results: any, testResults: TestResult[]): void {
    testResults.forEach(result => {
      results.overall.total++;
      if (result.success) {
        results.overall.passed++;
      } else {
        results.overall.failed++;
      }
    });
  }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  private getErrorMessage(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.message) {
      return error.message;
    }
    if (error.status === 0) {
      return 'Network error - unable to connect to server';
    }
    return `HTTP ${error.status}: ${error.statusText || 'Unknown error'}`;
  }

  // Generate connection report
  generateConnectionReport(): Observable<string> {
    return this.testConnection().pipe(
      map(status => {
        const report = [
          '# Backend Connection Report',
          `Generated: ${new Date().toLocaleString()}`,
          '',
          '## Connection Status',
          `Status: ${status.isConnected ? '✅ Connected' : '❌ Disconnected'}`,
          `Base URL: ${this.baseUrl}`,
          status.responseTime ? `Response Time: ${status.responseTime}ms` : '',
          status.error ? `Error: ${status.error}` : '',
          '',
          '## Server Information',
          status.serverInfo?.version ? `Version: ${status.serverInfo.version}` : 'Version: Unknown',
          status.serverInfo?.status ? `Status: ${status.serverInfo.status}` : 'Status: Unknown',
          status.serverInfo?.timestamp ? `Server Time: ${status.serverInfo.timestamp}` : '',
          '',
          '## Recommendations',
          status.isConnected 
            ? '- Connection is healthy' 
            : '- Check if backend server is running',
          !status.isConnected && status.error?.includes('Network error') 
            ? '- Check network connectivity' 
            : '',
          status.responseTime && status.responseTime > 2000 
            ? '- Response time is slow, consider optimization' 
            : ''
        ].filter(line => line !== '').join('\n');

        return report;
      })
    );
  }
}