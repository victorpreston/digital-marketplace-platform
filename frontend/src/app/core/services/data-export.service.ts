import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ExportConfig {
  filename?: string;
  sheetName?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
  excludeColumns?: string[];
  columnMapping?: { [key: string]: string };
  customFormatter?: (data: any) => any;
}

export interface ExportColumn {
  key: string;
  header: string;
  width?: number;
  format?: 'text' | 'number' | 'date' | 'currency' | 'percentage';
  align?: 'left' | 'center' | 'right';
}

@Injectable({
  providedIn: 'root'
})
export class DataExportService {

  /**
   * Export data to CSV format
   */
  exportToCSV(data: any[], config: ExportConfig = {}): void {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const filename = config.filename || 'export.csv';
    const processedData = this.processDataForExport(data, config);
    const csvContent = this.convertToCSV(processedData, config);
    
    this.downloadFile(csvContent, filename, 'text/csv');
  }

  /**
   * Export data to Excel format (XLSX)
   */
  exportToExcel(data: any[], config: ExportConfig = {}): void {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const filename = config.filename || 'export.xlsx';
    const processedData = this.processDataForExport(data, config);
    
    // This would require a library like 'xlsx' in a real implementation
    // For now, we'll export as CSV with .xlsx extension for demonstration
    const csvContent = this.convertToCSV(processedData, config);
    this.downloadFile(csvContent, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  }

  /**
   * Export data to JSON format
   */
  exportToJSON(data: any[], config: ExportConfig = {}): void {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const filename = config.filename || 'export.json';
    const processedData = this.processDataForExport(data, config);
    const jsonContent = JSON.stringify(processedData, null, 2);
    
    this.downloadFile(jsonContent, filename, 'application/json');
  }

  /**
   * Export data to PDF format (basic table)
   */
  exportToPDF(data: any[], columns: ExportColumn[], config: ExportConfig = {}): Observable<string> {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const filename = config.filename || 'export.pdf';
    const processedData = this.processDataForExport(data, config);
    
    // Generate PDF content as HTML table that can be converted to PDF
    const htmlContent = this.generateHTMLTable(processedData, columns);
    
    // In a real implementation, you would use jsPDF or similar library
    // For now, we'll return the HTML content
    return of(htmlContent);
  }

  /**
   * Export data with advanced formatting
   */
  exportAdvanced(
    data: any[], 
    columns: ExportColumn[], 
    format: 'csv' | 'excel' | 'pdf' | 'json',
    config: ExportConfig = {}
  ): void {
    const processedData = this.processAdvancedData(data, columns, config);
    
    switch (format) {
      case 'csv':
        this.exportToCSV(processedData, config);
        break;
      case 'excel':
        this.exportToExcel(processedData, config);
        break;
      case 'json':
        this.exportToJSON(processedData, config);
        break;
      case 'pdf':
        this.exportToPDF(processedData, columns, config).subscribe(content => {
          // Convert HTML to PDF or display in new window
          this.showPDFPreview(content, config.filename || 'export.pdf');
        });
        break;
    }
  }

  /**
   * Batch export multiple datasets
   */
  exportMultiple(exports: Array<{
    data: any[];
    filename: string;
    format: 'csv' | 'excel' | 'json';
    config?: ExportConfig;
  }>): void {
    exports.forEach(exportItem => {
      switch (exportItem.format) {
        case 'csv':
          this.exportToCSV(exportItem.data, { 
            ...exportItem.config, 
            filename: exportItem.filename 
          });
          break;
        case 'excel':
          this.exportToExcel(exportItem.data, { 
            ...exportItem.config, 
            filename: exportItem.filename 
          });
          break;
        case 'json':
          this.exportToJSON(exportItem.data, { 
            ...exportItem.config, 
            filename: exportItem.filename 
          });
          break;
      }
    });
  }

  /**
   * Export filtered and sorted data
   */
  exportFiltered(
    originalData: any[],
    filters: { [key: string]: any },
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc',
    format: 'csv' | 'excel' | 'json' = 'csv',
    config: ExportConfig = {}
  ): void {
    let filteredData = this.applyFilters(originalData, filters);
    
    if (sortBy) {
      filteredData = this.sortData(filteredData, sortBy, sortOrder);
    }

    switch (format) {
      case 'csv':
        this.exportToCSV(filteredData, config);
        break;
      case 'excel':
        this.exportToExcel(filteredData, config);
        break;
      case 'json':
        this.exportToJSON(filteredData, config);
        break;
    }
  }

  /**
   * Preview data before export
   */
  previewExport(data: any[], config: ExportConfig = {}): {
    rowCount: number;
    columnCount: number;
    estimatedSize: string;
    preview: any[];
    columns: string[];
  } {
    if (!data || data.length === 0) {
      return {
        rowCount: 0,
        columnCount: 0,
        estimatedSize: '0 B',
        preview: [],
        columns: []
      };
    }

    const processedData = this.processDataForExport(data, config);
    const preview = processedData.slice(0, 5); // Show first 5 rows
    const columns = Object.keys(processedData[0] || {});
    const estimatedSize = this.estimateFileSize(processedData, 'csv');

    return {
      rowCount: processedData.length,
      columnCount: columns.length,
      estimatedSize: this.formatFileSize(estimatedSize),
      preview,
      columns
    };
  }

  private processDataForExport(data: any[], config: ExportConfig): any[] {
    let processedData = [...data];

    // Apply custom formatter if provided
    if (config.customFormatter) {
      processedData = processedData.map(config.customFormatter);
    }

    // Exclude specified columns
    if (config.excludeColumns && config.excludeColumns.length > 0) {
      processedData = processedData.map(row => {
        const newRow = { ...row };
        config.excludeColumns!.forEach(col => delete newRow[col]);
        return newRow;
      });
    }

    // Apply column mapping
    if (config.columnMapping) {
      processedData = processedData.map(row => {
        const mappedRow: any = {};
        Object.entries(row).forEach(([key, value]) => {
          const mappedKey = config.columnMapping![key] || key;
          mappedRow[mappedKey] = value;
        });
        return mappedRow;
      });
    }

    // Format dates
    if (config.dateFormat) {
      processedData = this.formatDates(processedData, config.dateFormat);
    }

    return processedData;
  }

  private processAdvancedData(data: any[], columns: ExportColumn[], config: ExportConfig): any[] {
    return data.map(row => {
      const processedRow: any = {};
      
      columns.forEach(column => {
        let value = row[column.key];
        
        // Apply column-specific formatting
        switch (column.format) {
          case 'date':
            value = this.formatDate(value, config.dateFormat || 'MM/dd/yyyy');
            break;
          case 'currency':
            value = this.formatCurrency(value);
            break;
          case 'percentage':
            value = this.formatPercentage(value);
            break;
          case 'number':
            value = this.formatNumber(value);
            break;
          default:
            value = value?.toString() || '';
        }
        
        processedRow[column.header] = value;
      });
      
      return processedRow;
    });
  }

  private convertToCSV(data: any[], config: ExportConfig): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows: string[] = [];

    // Add headers if required
    if (config.includeHeaders !== false) {
      csvRows.push(headers.map(header => this.escapeCsvValue(header)).join(','));
    }

    // Add data rows
    data.forEach(row => {
      const csvRow = headers.map(header => {
        const value = row[header];
        return this.escapeCsvValue(value);
      });
      csvRows.push(csvRow.join(','));
    });

    return csvRows.join('\n');
  }

  private escapeCsvValue(value: any): string {
    if (value === null || value === undefined) return '';
    
    const stringValue = value.toString();
    
    // Escape values that contain commas, quotes, or newlines
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  }

  private generateHTMLTable(data: any[], columns: ExportColumn[]): string {
    if (data.length === 0) return '<table></table>';

    let html = `
      <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif;">
        <thead>
          <tr style="background-color: #f8f9fa;">
    `;

    // Add headers
    columns.forEach(column => {
      html += `<th style="padding: 12px; text-align: ${column.align || 'left'}; border: 1px solid #dee2e6;">
        ${column.header}
      </th>`;
    });

    html += '</tr></thead><tbody>';

    // Add data rows
    data.forEach((row, index) => {
      html += `<tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8f9fa'};">`;
      
      columns.forEach(column => {
        const value = row[column.header] || '';
        html += `<td style="padding: 8px; text-align: ${column.align || 'left'}; border: 1px solid #dee2e6;">
          ${value}
        </td>`;
      });
      
      html += '</tr>';
    });

    html += '</tbody></table>';
    return html;
  }

  private formatDates(data: any[], dateFormat: string): any[] {
    return data.map(row => {
      const formattedRow: any = {};
      
      Object.entries(row).forEach(([key, value]) => {
        if (value instanceof Date || this.isDateString(value)) {
          formattedRow[key] = this.formatDate(value, dateFormat);
        } else {
          formattedRow[key] = value;
        }
      });
      
      return formattedRow;
    });
  }

  private formatDate(value: any, format: string): string {
    if (!value) return '';
    
    const date = new Date(value);
    if (isNaN(date.getTime())) return value?.toString() || '';
    
    // Simple date formatting - in a real app, use date-fns or moment.js
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    switch (format) {
      case 'MM/dd/yyyy':
        return `${month}/${day}/${year}`;
      case 'dd/MM/yyyy':
        return `${day}/${month}/${year}`;
      case 'yyyy-MM-dd':
        return `${year}-${month}-${day}`;
      default:
        return date.toLocaleDateString();
    }
  }

  private formatCurrency(value: any): string {
    if (typeof value !== 'number') return value?.toString() || '';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  private formatPercentage(value: any): string {
    if (typeof value !== 'number') return value?.toString() || '';
    
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  }

  private formatNumber(value: any): string {
    if (typeof value !== 'number') return value?.toString() || '';
    
    return new Intl.NumberFormat('en-US').format(value);
  }

  private isDateString(value: any): boolean {
    if (typeof value !== 'string') return false;
    
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  private applyFilters(data: any[], filters: { [key: string]: any }): any[] {
    return data.filter(item => {
      return Object.entries(filters).every(([key, filterValue]) => {
        if (filterValue === null || filterValue === undefined || filterValue === '') {
          return true; // Skip empty filters
        }
        
        const itemValue = item[key];
        
        // Handle different filter types
        if (typeof filterValue === 'string') {
          return itemValue?.toString().toLowerCase().includes(filterValue.toLowerCase());
        } else if (typeof filterValue === 'number') {
          return itemValue === filterValue;
        } else if (filterValue instanceof Array) {
          return filterValue.includes(itemValue);
        } else if (typeof filterValue === 'object' && filterValue.start && filterValue.end) {
          // Date range filter
          const itemDate = new Date(itemValue);
          const startDate = new Date(filterValue.start);
          const endDate = new Date(filterValue.end);
          return itemDate >= startDate && itemDate <= endDate;
        }
        
        return itemValue === filterValue;
      });
    });
  }

  private sortData(data: any[], sortBy: string, sortOrder: 'asc' | 'desc'): any[] {
    return [...data].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (aValue === bValue) return 0;
      
      let comparison = 0;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = aValue?.toString().localeCompare(bValue?.toString()) || 0;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  private estimateFileSize(data: any[], format: string): number {
    const jsonString = JSON.stringify(data);
    const baseSize = new Blob([jsonString]).size;
    
    // Rough estimation multipliers for different formats
    const multipliers = {
      csv: 0.7,
      excel: 0.8,
      json: 1.0,
      pdf: 1.5
    };
    
    return baseSize * (multipliers[format as keyof typeof multipliers] || 1);
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  }

  private showPDFPreview(htmlContent: string, filename: string): void {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>${filename}</title>
            <style>
              body { margin: 20px; }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            ${htmlContent}
            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  }

  /**
   * Generate export templates for common business entities
   */
  getExportTemplates(): { [key: string]: ExportColumn[] } {
    return {
      products: [
        { key: 'name', header: 'Product Name', width: 200, format: 'text' },
        { key: 'sku', header: 'SKU', width: 100, format: 'text' },
        { key: 'price', header: 'Price', width: 100, format: 'currency', align: 'right' },
        { key: 'stock', header: 'Stock', width: 80, format: 'number', align: 'right' },
        { key: 'category', header: 'Category', width: 150, format: 'text' },
        { key: 'createdAt', header: 'Created Date', width: 120, format: 'date' }
      ],
      orders: [
        { key: 'orderNumber', header: 'Order #', width: 120, format: 'text' },
        { key: 'customerName', header: 'Customer', width: 150, format: 'text' },
        { key: 'total', header: 'Total', width: 100, format: 'currency', align: 'right' },
        { key: 'status', header: 'Status', width: 100, format: 'text' },
        { key: 'orderDate', header: 'Order Date', width: 120, format: 'date' },
        { key: 'shippingAddress', header: 'Shipping Address', width: 200, format: 'text' }
      ],
      customers: [
        { key: 'name', header: 'Name', width: 150, format: 'text' },
        { key: 'email', header: 'Email', width: 200, format: 'text' },
        { key: 'phone', header: 'Phone', width: 120, format: 'text' },
        { key: 'totalOrders', header: 'Total Orders', width: 100, format: 'number', align: 'right' },
        { key: 'totalSpent', header: 'Total Spent', width: 120, format: 'currency', align: 'right' },
        { key: 'registeredDate', header: 'Registered Date', width: 120, format: 'date' }
      ],
      reviews: [
        { key: 'productName', header: 'Product', width: 200, format: 'text' },
        { key: 'customerName', header: 'Customer', width: 150, format: 'text' },
        { key: 'rating', header: 'Rating', width: 80, format: 'number', align: 'center' },
        { key: 'title', header: 'Review Title', width: 200, format: 'text' },
        { key: 'comment', header: 'Comment', width: 300, format: 'text' },
        { key: 'createdAt', header: 'Review Date', width: 120, format: 'date' }
      ]
    };
  }
}