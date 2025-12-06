export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: ProductCategory;
  sellerId: string;
  seller?: User;
  images: ProductImage[];
  specifications?: ProductSpecification[];
  inventory: ProductInventory;
  status: ProductStatus;
  rating: number;
  reviewCount: number;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  parentId?: string;
  level: number;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductSpecification {
  key: string;
  value: string;
  unit?: string;
}

export interface ProductInventory {
  quantity: number;
  reserved: number;
  available: number;
  threshold: number;
  status: InventoryStatus;
}

export enum InventoryStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK'
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export interface ProductRating {
  average: number;
  count: number;
  distribution: { [key: number]: number };
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  specifications: ProductSpecification[];
  tags: string[];
  inventory: {
    quantity: number;
    threshold: number;
  };
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  specifications?: ProductSpecification[];
  tags?: string[];
  isActive?: boolean;
}

export interface ProductSearchRequest {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  tags?: string[];
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

export interface ProductSearchResponse {
  products: Product[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

// Import User interface
import { User } from './user.model';