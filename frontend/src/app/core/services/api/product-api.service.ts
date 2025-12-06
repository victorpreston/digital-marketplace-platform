import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Product, ProductFilter, ProductCategory } from '../models/product.model';
import { PaginationRequest, PaginationResponse } from '../models/common.model';

export interface ProductCreateRequest {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  brandId?: string;
  specifications: { [key: string]: string };
  images: string[];
  tags: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  stockQuantity: number;
  sku?: string;
  isActive: boolean;
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
  id: string;
}

export interface ProductSearchRequest extends PaginationRequest {
  query?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  inStock?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductApiService {
  private readonly endpoint = '/products';
  private productsCache = new BehaviorSubject<Product[]>([]);
  private categoriesCache = new BehaviorSubject<ProductCategory[]>([]);

  constructor(private apiService: ApiService) {
    this.loadCategories();
  }

  // Product CRUD Operations
  getProducts(request: ProductSearchRequest = { page: 0, size: 20 }): Observable<PaginationResponse<Product>> {
    return this.apiService.getPaginated<Product>(this.endpoint, request).pipe(
      tap(response => {
        // Update cache with new products
        const currentProducts = this.productsCache.value;
        const updatedProducts = [...currentProducts];
        
        response.content.forEach(product => {
          const existingIndex = updatedProducts.findIndex(p => p.id === product.id);
          if (existingIndex >= 0) {
            updatedProducts[existingIndex] = product;
          } else {
            updatedProducts.push(product);
          }
        });
        
        this.productsCache.next(updatedProducts);
      })
    );
  }

  getProduct(id: string): Observable<Product> {
    // Check cache first
    const cachedProduct = this.productsCache.value.find(p => p.id === id);
    if (cachedProduct) {
      return of(cachedProduct);
    }

    return this.apiService.get<Product>(`${this.endpoint}/${id}`).pipe(
      tap(product => {
        // Update cache
        const currentProducts = this.productsCache.value;
        const index = currentProducts.findIndex(p => p.id === product.id);
        if (index >= 0) {
          currentProducts[index] = product;
        } else {
          currentProducts.push(product);
        }
        this.productsCache.next([...currentProducts]);
      })
    );
  }

  createProduct(product: ProductCreateRequest): Observable<Product> {
    return this.apiService.post<Product>(this.endpoint, product).pipe(
      tap(newProduct => {
        // Add to cache
        const currentProducts = this.productsCache.value;
        this.productsCache.next([newProduct, ...currentProducts]);
      })
    );
  }

  updateProduct(product: ProductUpdateRequest): Observable<Product> {
    return this.apiService.put<Product>(`${this.endpoint}/${product.id}`, product).pipe(
      tap(updatedProduct => {
        // Update cache
        const currentProducts = this.productsCache.value;
        const index = currentProducts.findIndex(p => p.id === updatedProduct.id);
        if (index >= 0) {
          currentProducts[index] = updatedProduct;
          this.productsCache.next([...currentProducts]);
        }
      })
    );
  }

  deleteProduct(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`).pipe(
      tap(() => {
        // Remove from cache
        const currentProducts = this.productsCache.value;
        const updatedProducts = currentProducts.filter(p => p.id !== id);
        this.productsCache.next(updatedProducts);
      })
    );
  }

  // Image Management
  uploadProductImages(productId: string, images: File[]): Observable<string[]> {
    return this.apiService.uploadFiles(`${this.endpoint}/${productId}/images`, images);
  }

  deleteProductImage(productId: string, imageId: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${productId}/images/${imageId}`);
  }

  // Product Categories
  getCategories(): Observable<ProductCategory[]> {
    // Return cached categories if available
    if (this.categoriesCache.value.length > 0) {
      return this.categoriesCache.asObservable();
    }

    return this.apiService.get<ProductCategory[]>('/categories').pipe(
      tap(categories => this.categoriesCache.next(categories))
    );
  }

  createCategory(category: Omit<ProductCategory, 'id'>): Observable<ProductCategory> {
    return this.apiService.post<ProductCategory>('/categories', category).pipe(
      tap(newCategory => {
        const currentCategories = this.categoriesCache.value;
        this.categoriesCache.next([...currentCategories, newCategory]);
      })
    );
  }

  // Product Search and Filtering
  searchProducts(query: string, filters?: ProductFilter): Observable<Product[]> {
    const params = {
      q: query,
      ...filters
    };
    
    return this.apiService.get<Product[]>(`${this.endpoint}/search`, params);
  }

  getProductsByCategory(categoryId: string, pagination: PaginationRequest): Observable<PaginationResponse<Product>> {
    return this.apiService.getPaginated<Product>(`/categories/${categoryId}/products`, pagination);
  }

  getFeaturedProducts(limit: number = 10): Observable<Product[]> {
    return this.apiService.get<Product[]>(`${this.endpoint}/featured`, { limit });
  }

  getRelatedProducts(productId: string, limit: number = 6): Observable<Product[]> {
    return this.apiService.get<Product[]>(`${this.endpoint}/${productId}/related`, { limit });
  }

  // Product Reviews (integrated with product service)
  getProductReviews(productId: string, pagination: PaginationRequest): Observable<PaginationResponse<any>> {
    return this.apiService.getPaginated(`${this.endpoint}/${productId}/reviews`, pagination);
  }

  addProductReview(productId: string, review: any): Observable<any> {
    return this.apiService.post(`${this.endpoint}/${productId}/reviews`, review);
  }

  // Inventory Management
  updateStock(productId: string, quantity: number): Observable<Product> {
    return this.apiService.patch<Product>(`${this.endpoint}/${productId}/stock`, { quantity }).pipe(
      tap(updatedProduct => {
        // Update cache
        const currentProducts = this.productsCache.value;
        const index = currentProducts.findIndex(p => p.id === updatedProduct.id);
        if (index >= 0) {
          currentProducts[index] = updatedProduct;
          this.productsCache.next([...currentProducts]);
        }
      })
    );
  }

  bulkUpdateStock(updates: { productId: string; quantity: number }[]): Observable<Product[]> {
    return this.apiService.post<Product[]>(`${this.endpoint}/bulk-stock-update`, { updates }).pipe(
      tap(updatedProducts => {
        // Update cache
        const currentProducts = this.productsCache.value;
        updatedProducts.forEach(updatedProduct => {
          const index = currentProducts.findIndex(p => p.id === updatedProduct.id);
          if (index >= 0) {
            currentProducts[index] = updatedProduct;
          }
        });
        this.productsCache.next([...currentProducts]);
      })
    );
  }

  // Product Analytics
  getProductAnalytics(productId: string, dateRange?: { start: Date; end: Date }): Observable<any> {
    const params = dateRange ? {
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString()
    } : {};

    return this.apiService.get(`${this.endpoint}/${productId}/analytics`, params);
  }

  // Cache Management
  getCachedProducts(): Observable<Product[]> {
    return this.productsCache.asObservable();
  }

  getCachedCategories(): Observable<ProductCategory[]> {
    return this.categoriesCache.asObservable();
  }

  clearProductCache(): void {
    this.productsCache.next([]);
  }

  clearCategoriesCache(): void {
    this.categoriesCache.next([]);
  }

  private loadCategories(): void {
    this.getCategories().subscribe({
      next: categories => console.log(`Loaded ${categories.length} product categories`),
      error: error => console.error('Error loading categories:', error)
    });
  }
}