import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductApiService } from './api/product-api.service';
import { 
  Product, 
  ProductSearchRequest, 
  ProductSearchResponse, 
  CreateProductRequest,
  UpdateProductRequest,
  ProductCategory
} from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private productApi: ProductApiService) {}

  // Get all products with search/filter
  searchProducts(searchRequest: ProductSearchRequest = {}): Observable<ProductSearchResponse> {
    // Use the string-based search method and convert to response format
    const query = searchRequest.searchTerm || '';
    return this.productApi.searchProducts(query).pipe(
      map(products => ({
        products: products,
        totalElements: products.length,
        totalPages: 1,
        currentPage: 0,
        size: products.length
      }))
    );
  }

  // Get product by ID
  getProduct(id: string): Observable<Product> {
    return this.productApi.getProduct(id);
  }

  // Get products by seller
  getProductsBySeller(sellerId: string, page = 0, size = 20): Observable<ProductSearchResponse> {
    return this.productApi.getProducts({ page, size }).pipe(
      map(response => ({
        products: response.content.filter(p => p.sellerId === sellerId),
        totalElements: response.content.filter(p => p.sellerId === sellerId).length,
        totalPages: Math.ceil(response.content.filter(p => p.sellerId === sellerId).length / size),
        currentPage: page,
        size: size
      }))
    );
  }

  // Create new product (seller only)
  createProduct(productData: CreateProductRequest): Observable<Product> {
    const createRequest = {
      ...productData,
      images: productData.images || [],
      stockQuantity: productData.stockQuantity || 0,
      isActive: productData.isActive ?? true
    };
    return this.productApi.createProduct(createRequest);
  }

  // Update product (seller only)
  updateProduct(id: string, productData: UpdateProductRequest): Observable<Product> {
    const updateRequest = {
      id,
      ...productData
    };
    return this.productApi.updateProduct(updateRequest);
  }

  // Delete product (seller only)
  deleteProduct(id: string): Observable<void> {
    return this.productApi.deleteProduct(id);
  }

  // Update product inventory
  updateInventory(id: string, quantity: number, threshold: number): Observable<Product> {
    return this.productApi.updateStock(id, quantity);
  }

  // Upload product images
  uploadProductImages(productId: string, files: File[]): Observable<any> {
    return this.productApi.uploadProductImages(productId, files);
  }

  // Get product categories
  getCategories(): Observable<ProductCategory[]> {
    return this.productApi.getCategories();
  }

  // Get featured products
  getFeaturedProducts(limit = 10): Observable<Product[]> {
    return this.productApi.getFeaturedProducts(limit);
  }

  // Get trending products
  getTrendingProducts(limit = 10): Observable<Product[]> {
    return this.productApi.getFeaturedProducts(limit);
  }

  // Search products by category
  getProductsByCategory(categoryId: string, page = 0, size = 20): Observable<ProductSearchResponse> {
    return this.productApi.getProductsByCategory(categoryId, { page, size }).pipe(
      map(response => ({
        products: response.content,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        currentPage: response.number,
        size: response.size
      }))
    );
  }

  // Get product analytics (seller only)
  getProductAnalytics(sellerId: string, timeRange: 'week' | 'month' | 'year' = 'month'): Observable<any> {
    // Mock implementation since API expects different parameters
    const now = new Date();
    const start = new Date();
    if (timeRange === 'week') start.setDate(now.getDate() - 7);
    else if (timeRange === 'month') start.setMonth(now.getMonth() - 1);
    else start.setFullYear(now.getFullYear() - 1);
    
    return this.productApi.getProductAnalytics(sellerId, { start, end: now });
  }

  // Get inventory alerts (seller only)
  getInventoryAlerts(sellerId: string): Observable<Product[]> {
    // Mock implementation since this method doesn't exist in API
    return this.productApi.getProducts().pipe(
      map(response => response.content.filter(p => p.sellerId === sellerId && p.stockQuantity < 10))
    );
  }
}