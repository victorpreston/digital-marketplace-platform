import { ErrorHandler, Injectable } from '@angular/core';
import { ErrorHandlingService } from '../services/error-handling.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private errorHandlingService: ErrorHandlingService) {}

  handleError(error: any): void {
    // Determine error context
    let context = 'unknown';
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';

    if (error?.rejection) {
      context = 'promise-rejection';
      severity = 'high';
    } else if (error?.message?.includes('ChunkLoadError')) {
      context = 'chunk-load-error';
      severity = 'medium';
    } else if (error?.message?.includes('Loading chunk')) {
      context = 'dynamic-import-error'; 
      severity = 'medium';
    } else if (error?.message?.includes('Network Error')) {
      context = 'network-error';
      severity = 'high';
    } else if (error instanceof TypeError) {
      context = 'type-error';
      severity = 'medium';
    } else if (error instanceof ReferenceError) {
      context = 'reference-error';
      severity = 'high';
    }

    // Log the error
    this.errorHandlingService.logError(error, context, severity);

    // Still log to console for development
    console.error('Global Error Handler:', error);
  }
}