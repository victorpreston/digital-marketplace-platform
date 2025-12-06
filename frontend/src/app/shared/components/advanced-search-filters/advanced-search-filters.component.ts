import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';

export interface SearchFilters {
  searchTerm: string;
  category: string[];
  priceRange: { min: number; max: number };
  rating: number;
  brand: string[];
  seller: string[];
  availability: string;
  condition: string;
  shippingOption: string[];
  dateRange: { start: Date | null; end: Date | null };
  features: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  discounted: boolean;
  freeShipping: boolean;
  inStock: boolean;
  location: string;
}

@Component({
  selector: 'app-advanced-search-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatCheckboxModule,
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="search-filters-container">
      <!-- Search Bar -->
      <div class="search-bar-section">
        <mat-form-field class="search-field">
          <mat-label>Search products...</mat-label>
          <input matInput 
                 formControlName="searchTerm" 
                 placeholder="Enter keywords, brand, or product name">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        
        <div class="quick-actions">
          <button mat-raised-button color="primary" (click)="applyFilters()">
            <mat-icon>search</mat-icon>
            Search
          </button>
          <button mat-button (click)="clearAllFilters()">
            <mat-icon>clear_all</mat-icon>
            Clear All
          </button>
        </div>
      </div>

      <!-- Active Filters Display -->
      <div class="active-filters" *ngIf="getActiveFiltersCount() > 0">
        <h3>Active Filters ({{ getActiveFiltersCount() }})</h3>
        <div class="filter-chips">
          <mat-chip-set>
            <mat-chip *ngFor="let filter of getActiveFiltersList()" 
                     (removed)="removeFilter(filter.key, filter.value)">
              {{ filter.label }}
              <mat-icon matChipRemove>cancel</mat-icon>
            </mat-chip>
          </mat-chip-set>
        </div>
      </div>

      <!-- Filter Panels -->
      <mat-accordion class="filter-panels">
        
        <!-- Price Range Filter -->
        <mat-expansion-panel [expanded]="true">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>attach_money</mat-icon>
              Price Range
            </mat-panel-title>
            <mat-panel-description *ngIf="currentPriceMin !== null && currentPriceMax !== null">
              $\${this.currentPriceMin} - $\${this.currentPriceMax}
            </mat-panel-description>
          </mat-expansion-panel-header>
          
          <div class="price-filter-content">
            <div class="price-inputs">
              <mat-form-field>
                <mat-label>Min Price</mat-label>
                <input matInput 
                       type="number" 
                       [formControl]="priceMinControl"
                       min="0">
                <span matPrefix>$</span>
              </mat-form-field>
              
              <mat-form-field>
                <mat-label>Max Price</mat-label>
                <input matInput 
                       type="number" 
                       [formControl]="priceMaxControl"
                       min="0">
                <span matPrefix>$</span>
              </mat-form-field>
            </div>
            
            <mat-slider class="price-slider" 
                       [min]="0" 
                       [max]="1000" 
                       [step]="10">
              <input matSliderStartThumb [formControl]="priceMinControl">
              <input matSliderEndThumb [formControl]="priceMaxControl">
            </mat-slider>
            
            <div class="price-presets">
              <button mat-button *ngFor="let preset of pricePresets" 
                      (click)="setPricePreset(preset)">
                {{ preset.label }}
              </button>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Category Filter -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>category</mat-icon>
              Categories
            </mat-panel-title>
            <mat-panel-description *ngIf="filtersForm.get('category')?.value?.length > 0">
              {{ filtersForm.get('category')?.value?.length }} selected
            </mat-panel-description>
          </mat-expansion-panel-header>
          
          <div class="category-filter-content">
            <div class="category-search">
              <mat-form-field class="full-width">
                <mat-label>Search categories</mat-label>
                <input matInput #categorySearch placeholder="Type to search...">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>
            </div>
            
            <div class="category-tree">
              <div class="category-item" *ngFor="let category of filteredCategories">
                <mat-checkbox [value]="category.id" 
                             (change)="toggleCategory($event, category.id)">
                  {{ category.name }}
                  <span class="product-count">({{ category.productCount }})</span>
                </mat-checkbox>
                
                <div class="subcategories" *ngIf="category.children?.length > 0">
                  <div class="subcategory-item" *ngFor="let sub of category.children">
                    <mat-checkbox [value]="sub.id" 
                                 (change)="toggleCategory($event, sub.id)">
                      {{ sub.name }}
                      <span class="product-count">({{ sub.productCount }})</span>
                    </mat-checkbox>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Brand Filter -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>business</mat-icon>
              Brands
            </mat-panel-title>
            <mat-panel-description *ngIf="filtersForm.get('brand')?.value?.length > 0">
              {{ filtersForm.get('brand')?.value?.length }} selected
            </mat-panel-description>
          </mat-expansion-panel-header>
          
          <div class="brand-filter-content">
            <div class="brand-search">
              <mat-form-field class="full-width">
                <mat-label>Search brands</mat-label>
                <input matInput #brandSearch placeholder="Type to search...">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>
            </div>
            
            <div class="brand-list">
              <mat-checkbox *ngFor="let brand of filteredBrands" 
                           [value]="brand.id"
                           (change)="toggleBrand($event, brand.id)">
                {{ brand.name }}
                <span class="product-count">({{ brand.productCount }})</span>
              </mat-checkbox>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Rating Filter -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>star</mat-icon>
              Customer Rating
            </mat-panel-title>
            <mat-panel-description *ngIf="filtersForm.get('rating')?.value > 0">
              {{ filtersForm.get('rating')?.value }}+ stars
            </mat-panel-description>
          </mat-expansion-panel-header>
          
          <div class="rating-filter-content">
            <mat-radio-group formControlName="rating" class="rating-options">
              <mat-radio-button [value]="0">Any Rating</mat-radio-button>
              <mat-radio-button *ngFor="let rating of [4, 3, 2, 1]" [value]="rating">
                <div class="rating-option">
                  <div class="stars">
                    <mat-icon *ngFor="let star of getStarsArray(rating)">star</mat-icon>
                    <mat-icon *ngFor="let star of getEmptyStarsArray(rating)">star_border</mat-icon>
                  </div>
                  <span>{{ rating }}+ stars & up</span>
                </div>
              </mat-radio-button>
            </mat-radio-group>
          </div>
        </mat-expansion-panel>

        <!-- Availability Filter -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>inventory</mat-icon>
              Availability
            </mat-panel-title>
          </mat-expansion-panel-header>
          
          <div class="availability-filter-content">
            <div class="availability-toggles">
              <mat-slide-toggle formControlName="inStock">
                In Stock Only
              </mat-slide-toggle>
              
              <mat-slide-toggle formControlName="freeShipping">
                Free Shipping
              </mat-slide-toggle>
              
              <mat-slide-toggle formControlName="discounted">
                On Sale/Discounted
              </mat-slide-toggle>
            </div>
            
            <mat-form-field class="full-width">
              <mat-label>Condition</mat-label>
              <mat-select formControlName="condition">
                <mat-option value="">Any Condition</mat-option>
                <mat-option value="new">New</mat-option>
                <mat-option value="like-new">Like New</mat-option>
                <mat-option value="good">Good</mat-option>
                <mat-option value="fair">Fair</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-expansion-panel>

        <!-- Shipping Options -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>local_shipping</mat-icon>
              Shipping Options
            </mat-panel-title>
          </mat-expansion-panel-header>
          
          <div class="shipping-filter-content">
            <div class="shipping-checkboxes">
              <mat-checkbox *ngFor="let option of shippingOptions" 
                           [value]="option.value"
                           (change)="toggleShippingOption($event, option.value)">
                <div class="shipping-option">
                  <mat-icon>{{ option.icon }}</mat-icon>
                  <span>{{ option.label }}</span>
                </div>
              </mat-checkbox>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Sort Options -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>sort</mat-icon>
              Sort Results
            </mat-panel-title>
            <mat-panel-description *ngIf="filtersForm.get('sortBy')?.value">
              {{ getSortLabel() }}
            </mat-panel-description>
          </mat-expansion-panel-header>
          
          <div class="sort-filter-content">
            <mat-form-field class="full-width">
              <mat-label>Sort by</mat-label>
              <mat-select formControlName="sortBy">
                <mat-option value="relevance">Relevance</mat-option>
                <mat-option value="price">Price</mat-option>
                <mat-option value="rating">Customer Rating</mat-option>
                <mat-option value="newest">Newest First</mat-option>
                <mat-option value="popularity">Most Popular</mat-option>
                <mat-option value="discount">Highest Discount</mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-radio-group formControlName="sortOrder" *ngIf="filtersForm.get('sortBy')?.value !== 'relevance'">
              <mat-radio-button value="asc">
                <mat-icon>arrow_upward</mat-icon>
                Ascending
              </mat-radio-button>
              <mat-radio-button value="desc">
                <mat-icon>arrow_downward</mat-icon>
                Descending
              </mat-radio-button>
            </mat-radio-group>
          </div>
        </mat-expansion-panel>

      </mat-accordion>
      
      <!-- Apply/Reset Actions -->
      <div class="filter-actions">
        <button mat-raised-button color="primary" (click)="applyFilters()" [disabled]="!hasChanges()">
          <mat-icon>search</mat-icon>
          Apply Filters ({{ getResultsCount() }} results)
        </button>
        
        <button mat-stroked-button (click)="resetToDefaults()">
          <mat-icon>restore</mat-icon>
          Reset to Defaults
        </button>
      </div>
    </div>
  `,
  styles: [`
    .search-filters-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .search-bar-section {
      padding: 20px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .search-field {
      flex: 1;
    }

    .quick-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    .active-filters {
      padding: 16px 20px;
      border-bottom: 1px solid #e9ecef;
      background: rgba(255, 112, 67, 0.05);
    }

    .active-filters h3 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 500;
      color: #666;
    }

    .filter-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .filter-panels {
      border: none;
      box-shadow: none;
    }

    .filter-panels .mat-expansion-panel {
      border-bottom: 1px solid #e9ecef;
    }

    .filter-panels .mat-expansion-panel-header {
      padding: 0 20px;
      height: 56px;
    }

    .filter-panels .mat-expansion-panel-body {
      padding: 0 20px 20px;
    }

    .price-filter-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .price-inputs {
      display: flex;
      gap: 16px;
    }

    .price-inputs mat-form-field {
      flex: 1;
    }

    .price-slider {
      margin: 8px 0;
    }

    .price-presets {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .category-filter-content,
    .brand-filter-content {
      max-height: 300px;
      overflow-y: auto;
    }

    .category-search,
    .brand-search {
      position: sticky;
      top: 0;
      background: white;
      padding-bottom: 12px;
      z-index: 1;
    }

    .category-tree,
    .brand-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .category-item {
      display: flex;
      flex-direction: column;
    }

    .subcategories {
      margin-left: 24px;
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .product-count {
      color: #666;
      font-size: 12px;
      margin-left: 4px;
    }

    .rating-filter-content {
      display: flex;
      flex-direction: column;
    }

    .rating-options {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .rating-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .stars {
      display: flex;
      color: #ffc107;
    }

    .availability-filter-content,
    .shipping-filter-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .availability-toggles,
    .shipping-checkboxes {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .shipping-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sort-filter-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .filter-actions {
      padding: 20px;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
      display: flex;
      gap: 12px;
    }

    .filter-actions button {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .search-bar-section {
        flex-direction: column;
        gap: 12px;
      }

      .quick-actions {
        width: 100%;
      }

      .quick-actions button {
        flex: 1;
      }

      .price-inputs {
        flex-direction: column;
      }

      .filter-actions {
        flex-direction: column;
      }
    }
  `]
})
export class AdvancedSearchFiltersComponent implements OnInit {
  @Input() initialFilters?: Partial<SearchFilters>;
  @Output() filtersChange = new EventEmitter<SearchFilters>();
  @Output() search = new EventEmitter<SearchFilters>();

  filtersForm!: FormGroup;
  priceMinControl!: FormControl<number | null>;
  priceMaxControl!: FormControl<number | null>;

  // Mock data - replace with actual data from services
  filteredCategories = [
    { id: 'electronics', name: 'Electronics', productCount: 1250, children: [
      { id: 'phones', name: 'Smartphones', productCount: 450 },
      { id: 'laptops', name: 'Laptops', productCount: 320 }
    ]},
    { id: 'clothing', name: 'Clothing', productCount: 890, children: [] }
  ];

  filteredBrands = [
    { id: 'apple', name: 'Apple', productCount: 245 },
    { id: 'samsung', name: 'Samsung', productCount: 180 }
  ];

  pricePresets = [
    { label: 'Under $25', min: 0, max: 25 },
    { label: '$25 - $50', min: 25, max: 50 },
    { label: '$50 - $100', min: 50, max: 100 },
    { label: 'Over $100', min: 100, max: 1000 }
  ];

  shippingOptions = [
    { value: 'free', label: 'Free Shipping', icon: 'local_shipping' },
    { value: 'express', label: 'Express Delivery', icon: 'flash_on' },
    { value: 'overnight', label: 'Overnight', icon: 'schedule' }
  ];

  private resultsCount = 0;
  private hasFormChanges = false;

  get currentPriceMin(): number {
    return this.priceMinControl?.value ?? 0;
  }

  get currentPriceMax(): number {
    return this.priceMaxControl?.value ?? 1000;
  }

  constructor(private fb: FormBuilder) {
    this.priceMinControl = this.fb.control(0);
    this.priceMaxControl = this.fb.control(1000);
    this.filtersForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.initialFilters) {
      this.filtersForm.patchValue(this.initialFilters);
      this.priceMinControl.setValue(this.initialFilters.priceRange?.min || 0);
      this.priceMaxControl.setValue(this.initialFilters.priceRange?.max || 1000);
    }

    // Watch for form changes
    this.filtersForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.hasFormChanges = true;
      this.updatePriceRange();
      this.filtersChange.emit(this.getCurrentFilters());
    });

    // Watch price slider changes
    this.priceMinControl.valueChanges.subscribe(() => this.updatePriceRange());
    this.priceMaxControl.valueChanges.subscribe(() => this.updatePriceRange());
  }

  private createForm(): FormGroup {
    return this.fb.group({
      searchTerm: [''],
      category: [[]],
      rating: [0],
      brand: [[]],
      seller: [[]],
      availability: [''],
      condition: [''],
      shippingOption: [[]],
      features: [[]],
      sortBy: ['relevance'],
      sortOrder: ['desc'],
      discounted: [false],
      freeShipping: [false],
      inStock: [false],
      location: ['']
    });
  }

  private updatePriceRange(): void {
    const min = this.priceMinControl.value || 0;
    const max = this.priceMaxControl.value || 1000;
    
    this.filtersForm.patchValue({
      priceRange: { min, max }
    }, { emitEvent: false });
  }

  toggleCategory(event: any, categoryId: string): void {
    const categories = this.filtersForm.get('category')?.value || [];
    if (event.checked) {
      categories.push(categoryId);
    } else {
      const index = categories.indexOf(categoryId);
      if (index > -1) categories.splice(index, 1);
    }
    this.filtersForm.patchValue({ category: categories });
  }

  toggleBrand(event: any, brandId: string): void {
    const brands = this.filtersForm.get('brand')?.value || [];
    if (event.checked) {
      brands.push(brandId);
    } else {
      const index = brands.indexOf(brandId);
      if (index > -1) brands.splice(index, 1);
    }
    this.filtersForm.patchValue({ brand: brands });
  }

  toggleShippingOption(event: any, option: string): void {
    const options = this.filtersForm.get('shippingOption')?.value || [];
    if (event.checked) {
      options.push(option);
    } else {
      const index = options.indexOf(option);
      if (index > -1) options.splice(index, 1);
    }
    this.filtersForm.patchValue({ shippingOption: options });
  }

  setPricePreset(preset: { min: number; max: number }): void {
    this.priceMinControl.setValue(preset.min);
    this.priceMaxControl.setValue(preset.max);
  }

  getStarsArray(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getEmptyStarsArray(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }

  getSortLabel(): string {
    const sortBy = this.filtersForm.get('sortBy')?.value;
    const sortOrder = this.filtersForm.get('sortOrder')?.value;
    
    const labels: { [key: string]: string } = {
      price: 'Price',
      rating: 'Rating',
      newest: 'Date Added',
      popularity: 'Popularity',
      discount: 'Discount'
    };

    const label = labels[sortBy] || sortBy;
    return sortOrder === 'asc' ? `${label} ↑` : `${label} ↓`;
  }

  getActiveFiltersCount(): number {
    const filters = this.getCurrentFilters();
    let count = 0;
    
    if (filters.searchTerm) count++;
    if (filters.category.length > 0) count++;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 1000) count++;
    if (filters.rating > 0) count++;
    if (filters.brand.length > 0) count++;
    if (filters.condition) count++;
    if (filters.discounted || filters.freeShipping || filters.inStock) count++;
    if (filters.shippingOption.length > 0) count++;
    
    return count;
  }

  getActiveFiltersList(): Array<{ key: string; value: any; label: string }> {
    const filters = this.getCurrentFilters();
    const active = [];

    if (filters.searchTerm) {
      active.push({ key: 'searchTerm', value: '', label: `Search: "${filters.searchTerm}"` });
    }
    
    filters.category.forEach(cat => {
      const category = this.filteredCategories.find(c => c.id === cat);
      active.push({ key: 'category', value: cat, label: `Category: ${category?.name}` });
    });
    
    if (filters.rating > 0) {
      active.push({ key: 'rating', value: '', label: `${filters.rating}+ stars` });
    }

    return active;
  }

  removeFilter(key: string, value: any): void {
    if (key === 'searchTerm') {
      this.filtersForm.patchValue({ searchTerm: '' });
    } else if (key === 'category') {
      const categories = this.filtersForm.get('category')?.value.filter((c: string) => c !== value);
      this.filtersForm.patchValue({ category: categories });
    } else if (key === 'rating') {
      this.filtersForm.patchValue({ rating: 0 });
    }
  }

  getCurrentFilters(): SearchFilters {
    const formValue = this.filtersForm.value;
    return {
      ...formValue,
      priceRange: {
        min: this.priceMinControl.value || 0,
        max: this.priceMaxControl.value || 1000
      },
      dateRange: { start: null, end: null }
    };
  }

  hasChanges(): boolean {
    return this.hasFormChanges;
  }

  getResultsCount(): number {
    return this.resultsCount; // This would be updated from parent component
  }

  applyFilters(): void {
    this.hasFormChanges = false;
    this.search.emit(this.getCurrentFilters());
  }

  clearAllFilters(): void {
    this.filtersForm.reset();
    this.priceMinControl.setValue(0);
    this.priceMaxControl.setValue(1000);
    this.filtersForm.patchValue({
      sortBy: 'relevance',
      sortOrder: 'desc',
      category: [],
      brand: [],
      shippingOption: [],
      features: []
    });
  }

  resetToDefaults(): void {
    this.clearAllFilters();
    this.applyFilters();
  }
}