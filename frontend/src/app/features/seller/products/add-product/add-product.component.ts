import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatStepperModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="add-product-container">
      <div class="header">
        <button mat-icon-button routerLink="/seller/products">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Add New Product</h1>
      </div>

      <mat-horizontal-stepper [linear]="true" #stepper>
        <!-- Basic Information -->
        <mat-step [stepControl]="basicInfoForm" label="Basic Information">
          <form [formGroup]="basicInfoForm">
            <mat-card>
              <mat-card-content>
                <div class="form-section">
                  <h3>Product Details</h3>
                  
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Product Name</mat-label>
                      <input matInput formControlName="name" placeholder="Enter product name">
                      <mat-error *ngIf="basicInfoForm.get('name')?.hasError('required')">
                        Product name is required
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Description</mat-label>
                      <textarea matInput rows="4" formControlName="description" 
                                placeholder="Describe your product..."></textarea>
                      <mat-error *ngIf="basicInfoForm.get('description')?.hasError('required')">
                        Description is required
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Category</mat-label>
                      <mat-select formControlName="categoryId">
                        <mat-option value="electronics">Electronics</mat-option>
                        <mat-option value="clothing">Clothing</mat-option>
                        <mat-option value="home">Home & Garden</mat-option>
                        <mat-option value="books">Books</mat-option>
                        <mat-option value="sports">Sports</mat-option>
                        <mat-option value="food">Food & Beverages</mat-option>
                      </mat-select>
                      <mat-error *ngIf="basicInfoForm.get('categoryId')?.hasError('required')">
                        Please select a category
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Price (\$)</mat-label>
                      <input matInput type="number" formControlName="price" 
                             placeholder="0.00" min="0" step="0.01">
                      <mat-error *ngIf="basicInfoForm.get('price')?.hasError('required')">
                        Price is required
                      </mat-error>
                      <mat-error *ngIf="basicInfoForm.get('price')?.hasError('min')">
                        Price must be greater than 0
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Original Price (\$)</mat-label>
                      <input matInput type="number" formControlName="originalPrice" 
                             placeholder="0.00" min="0" step="0.01">
                      <mat-hint>Optional - for showing discounts</mat-hint>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Stock Quantity</mat-label>
                      <input matInput type="number" formControlName="quantity" 
                             placeholder="0" min="0">
                      <mat-error *ngIf="basicInfoForm.get('quantity')?.hasError('required')">
                        Stock quantity is required
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Low Stock Threshold</mat-label>
                      <input matInput type="number" formControlName="threshold" 
                             placeholder="5" min="1">
                      <mat-hint>Get notified when stock falls below this level</mat-hint>
                    </mat-form-field>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <div class="step-actions">
              <button mat-raised-button color="primary" matStepperNext 
                      [disabled]="!basicInfoForm.valid">
                Next: Add Images
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Images -->
        <mat-step [stepControl]="imagesForm" label="Images">
          <form [formGroup]="imagesForm">
            <mat-card>
              <mat-card-content>
                <div class="form-section">
                  <h3>Product Images</h3>
                  <p>Upload high-quality images of your product. The first image will be the primary image.</p>
                  
                  <div class="image-upload-section">
                    <div class="upload-area" (click)="triggerFileInput()">
                      <input #fileInput type="file" multiple accept="image/*" 
                             (change)="onFilesSelected($event)" style="display: none;">
                      <mat-icon class="upload-icon">cloud_upload</mat-icon>
                      <h4>Upload Images</h4>
                      <p>Click to browse or drag and drop images here</p>
                      <small>Supports: JPG, PNG, WebP (Max 5MB each)</small>
                    </div>

                    <div class="uploaded-images" *ngIf="uploadedImages.length > 0">
                      <h4>Uploaded Images ({{ uploadedImages.length }})</h4>
                      <div class="image-grid">
                        <div *ngFor="let image of uploadedImages; let i = index" class="image-item">
                          <img [src]="image.preview" [alt]="'Product image ' + (i + 1)">
                          <div class="image-actions">
                            <button mat-icon-button color="primary" 
                                    [class.primary]="image.isPrimary" 
                                    (click)="setPrimaryImage(i)"
                                    matTooltip="Set as primary">
                              <mat-icon>star</mat-icon>
                            </button>
                            <button mat-icon-button color="warn" 
                                    (click)="removeImage(i)"
                                    matTooltip="Remove">
                              <mat-icon>delete</mat-icon>
                            </button>
                          </div>
                          <div class="image-label" *ngIf="image.isPrimary">Primary</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <div class="step-actions">
              <button mat-button matStepperPrevious>Back</button>
              <button mat-raised-button color="primary" matStepperNext>
                Next: Specifications
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Specifications -->
        <mat-step [stepControl]="specificationsForm" label="Specifications">
          <form [formGroup]="specificationsForm">
            <mat-card>
              <mat-card-content>
                <div class="form-section">
                  <h3>Product Specifications</h3>
                  <p>Add detailed specifications to help customers make informed decisions.</p>
                  
                  <div formArrayName="specifications">
                    <div *ngFor="let spec of specificationsArray.controls; let i = index" 
                         [formGroupName]="i" class="specification-row">
                      <mat-form-field appearance="outline">
                        <mat-label>Property</mat-label>
                        <input matInput formControlName="key" placeholder="e.g., Weight, Color, Size">
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline">
                        <mat-label>Value</mat-label>
                        <input matInput formControlName="value" placeholder="e.g., 2.5kg, Black, Large">
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline">
                        <mat-label>Unit</mat-label>
                        <input matInput formControlName="unit" placeholder="e.g., kg, cm, inches">
                      </mat-form-field>
                      
                      <button mat-icon-button color="warn" 
                              (click)="removeSpecification(i)"
                              [disabled]="specificationsArray.length === 1">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>

                  <button mat-button color="primary" (click)="addSpecification()">
                    <mat-icon>add</mat-icon>
                    Add Specification
                  </button>
                </div>

                <div class="form-section">
                  <h3>Tags</h3>
                  <p>Add tags to help customers find your product more easily.</p>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Tags (comma separated)</mat-label>
                    <input matInput formControlName="tags" 
                           placeholder="e.g., wireless, bluetooth, premium, portable">
                    <mat-hint>Separate tags with commas</mat-hint>
                  </mat-form-field>
                </div>
              </mat-card-content>
            </mat-card>

            <div class="step-actions">
              <button mat-button matStepperPrevious>Back</button>
              <button mat-raised-button color="primary" matStepperNext>
                Next: Review
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Review & Submit -->
        <mat-step label="Review & Submit">
          <mat-card>
            <mat-card-content>
              <div class="form-section">
                <h3>Review Your Product</h3>
                <p>Please review all information before submitting.</p>

                <div class="review-section">
                  <h4>Basic Information</h4>
                  <div class="review-item">
                    <strong>Name:</strong> {{ basicInfoForm.get('name')?.value }}
                  </div>
                  <div class="review-item">
                    <strong>Description:</strong> {{ basicInfoForm.get('description')?.value }}
                  </div>
                  <div class="review-item">
                    <strong>Category:</strong> {{ getCategoryName(basicInfoForm.get('categoryId')?.value) }}
                  </div>
                  <div class="review-item">
                    <strong>Price:</strong> \${{ basicInfoForm.get('price')?.value | number:'1.2-2' }}
                    <span *ngIf="basicInfoForm.get('originalPrice')?.value">
                      (was \${{ basicInfoForm.get('originalPrice')?.value | number:'1.2-2' }})
                    </span>
                  </div>
                  <div class="review-item">
                    <strong>Stock:</strong> {{ basicInfoForm.get('quantity')?.value }} units
                  </div>
                </div>

                <div class="review-section" *ngIf="uploadedImages.length > 0">
                  <h4>Images ({{ uploadedImages.length }})</h4>
                  <div class="review-images">
                    <img *ngFor="let image of uploadedImages" [src]="image.preview" 
                         [class.primary]="image.isPrimary">
                  </div>
                </div>

                <div class="review-section" *ngIf="hasSpecifications()">
                  <h4>Specifications</h4>
                  <div class="spec-list">
                    <div *ngFor="let spec of specificationsArray.controls" class="spec-item">
                      <strong>{{ spec.get('key')?.value }}:</strong>
                      {{ spec.get('value')?.value }}
                      <span *ngIf="spec.get('unit')?.value">{{ spec.get('unit')?.value }}</span>
                    </div>
                  </div>
                </div>

                <div class="review-section" *ngIf="getTags().length > 0">
                  <h4>Tags</h4>
                  <mat-chip-set>
                    <mat-chip *ngFor="let tag of getTags()">{{ tag }}</mat-chip>
                  </mat-chip-set>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <div class="step-actions">
            <button mat-button matStepperPrevious>Back</button>
            <button mat-raised-button color="primary" 
                    (click)="submitProduct()" 
                    [disabled]="isSubmitting">
              <mat-icon *ngIf="isSubmitting">hourglass_empty</mat-icon>
              <mat-icon *ngIf="!isSubmitting">save</mat-icon>
              {{ isSubmitting ? 'Creating Product...' : 'Create Product' }}
            </button>
          </div>
        </mat-step>
      </mat-horizontal-stepper>
    </div>
  `,
  styles: [`
    .add-product-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .header {
      display: flex;
      align-items: center;
      margin-bottom: 32px;
      gap: 16px;
    }

    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }

    .form-section {
      margin-bottom: 32px;
    }

    .form-section h3 {
      margin: 0 0 16px 0;
      color: #333;
      font-weight: 600;
    }

    .form-section p {
      margin: 0 0 24px 0;
      color: #666;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-row mat-form-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }

    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.3s ease;
      background: #fafafa;
    }

    .upload-area:hover {
      border-color: var(--primary-color);
    }

    .upload-icon {
      font-size: 48px !important;
      width: 48px !important;
      height: 48px !important;
      color: #ccc;
      margin-bottom: 16px;
    }

    .upload-area h4 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .upload-area p {
      margin: 0 0 8px 0;
      color: #666;
    }

    .upload-area small {
      color: #999;
    }

    .uploaded-images {
      margin-top: 32px;
    }

    .uploaded-images h4 {
      margin: 0 0 16px 0;
      color: #333;
    }

    .image-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 16px;
    }

    .image-item {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .image-item img {
      width: 100%;
      height: 150px;
      object-fit: cover;
    }

    .image-actions {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      gap: 4px;
    }

    .image-actions button {
      background: rgba(255,255,255,0.9);
      width: 32px;
      height: 32px;
    }

    .image-actions button.primary {
      background: rgba(255,193,7,0.9);
      color: #333;
    }

    .image-label {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(255,193,7,0.9);
      color: #333;
      padding: 4px 8px;
      font-size: 12px;
      font-weight: 600;
      text-align: center;
    }

    .specification-row {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 16px;
    }

    .specification-row mat-form-field {
      flex: 1;
    }

    .specification-row mat-form-field:last-of-type {
      max-width: 120px;
    }

    .review-section {
      margin-bottom: 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .review-section:last-child {
      border-bottom: none;
    }

    .review-section h4 {
      margin: 0 0 16px 0;
      color: #333;
      font-weight: 600;
    }

    .review-item {
      margin-bottom: 8px;
      line-height: 1.5;
    }

    .review-images {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .review-images img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 8px;
      border: 2px solid transparent;
    }

    .review-images img.primary {
      border-color: #ffc107;
    }

    .spec-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 12px;
    }

    .spec-item {
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    @media (max-width: 768px) {
      .add-product-container {
        padding: 16px;
      }

      .form-row {
        flex-direction: column;
        gap: 8px;
      }

      .specification-row {
        flex-direction: column;
        align-items: stretch;
      }

      .step-actions {
        flex-direction: column;
        gap: 16px;
      }

      .image-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      }
    }
  `]
})
export class AddProductComponent implements OnInit {
  basicInfoForm!: FormGroup;
  imagesForm!: FormGroup;
  specificationsForm!: FormGroup;

  uploadedImages: any[] = [];
  isSubmitting = false;

  categories = [
    { id: 'electronics', name: 'Electronics' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'home', name: 'Home & Garden' },
    { id: 'books', name: 'Books' },
    { id: 'sports', name: 'Sports' },
    { id: 'food', name: 'Food & Beverages' }
  ];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.createForms();
  }

  ngOnInit(): void {}

  private createForms(): void {
    this.basicInfoForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      categoryId: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0.01)]],
      originalPrice: [null],
      quantity: [null, [Validators.required, Validators.min(0)]],
      threshold: [5, [Validators.required, Validators.min(1)]]
    });

    this.imagesForm = this.fb.group({});

    this.specificationsForm = this.fb.group({
      specifications: this.fb.array([this.createSpecificationGroup()]),
      tags: ['']
    });
  }

  get specificationsArray(): FormArray {
    return this.specificationsForm.get('specifications') as FormArray;
  }

  private createSpecificationGroup(): FormGroup {
    return this.fb.group({
      key: [''],
      value: [''],
      unit: ['']
    });
  }

  addSpecification(): void {
    this.specificationsArray.push(this.createSpecificationGroup());
  }

  removeSpecification(index: number): void {
    if (this.specificationsArray.length > 1) {
      this.specificationsArray.removeAt(index);
    }
  }

  triggerFileInput(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  onFilesSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.uploadedImages.push({
              file: file,
              preview: e.target?.result,
              isPrimary: this.uploadedImages.length === 0
            });
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }

  setPrimaryImage(index: number): void {
    this.uploadedImages.forEach((img, i) => {
      img.isPrimary = i === index;
    });
  }

  removeImage(index: number): void {
    const wasPrimary = this.uploadedImages[index].isPrimary;
    
    // Remove image
    this.uploadedImages.splice(index, 1);
    
    // If we removed the primary image, set first image as primary
    if (wasPrimary && this.uploadedImages.length > 0) {
      this.uploadedImages[0].isPrimary = true;
    }
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  }

  hasSpecifications(): boolean {
    return this.specificationsArray.controls.some(control => 
      control.get('key')?.value || control.get('value')?.value
    );
  }

  getTags(): string[] {
    const tagsString = this.specificationsForm.get('tags')?.value || '';
    return tagsString.split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0);
  }

  submitProduct(): void {
    if (this.basicInfoForm.valid) {
      this.isSubmitting = true;

      // Prepare product data
      const productData = {
        ...this.basicInfoForm.value,
        specifications: this.specificationsArray.value.filter((spec: any) => 
          spec.key || spec.value
        ),
        tags: this.getTags(),
        images: this.uploadedImages.map((img, index) => ({
          file: img.file,
          isPrimary: img.isPrimary,
          order: index
        }))
      };

      // In a real implementation, you would upload images to a server
      // and create the product via API
      setTimeout(() => {
        this.isSubmitting = false;
        this.snackBar.open('Product created successfully!', 'Close', {
          duration: 3000
        });
        this.router.navigate(['/seller/products']);
      }, 2000);
    }
  }
}