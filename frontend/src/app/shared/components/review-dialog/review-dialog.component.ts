import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export interface ReviewDialogData {
  productId: string;
  productName: string;
  productImage: string;
  orderId?: string;
  existingReview?: {
    id: string;
    rating: number;
    title: string;
    comment: string;
    images: string[];
  };
}

export interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
  images: File[];
  pros: string[];
  cons: string[];
  wouldRecommend: boolean;
}

@Component({
  selector: 'app-review-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  template: `
    <div class="review-dialog">
      <div mat-dialog-title class="dialog-title">
        <div class="product-info">
          <img [src]="data.productImage" 
               [alt]="data.productName" 
               class="product-image">
          <div class="product-details">
            <h2>{{ isEditing ? 'Edit Review' : 'Write a Review' }}</h2>
            <p class="product-name">{{ data.productName }}</p>
          </div>
        </div>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div mat-dialog-content class="dialog-content">
        <form [formGroup]="reviewForm" class="review-form">
          
          <!-- Rating Section -->
          <div class="rating-section">
            <h3>Overall Rating *</h3>
            <div class="rating-stars">
              <button type="button"
                      *ngFor="let star of [1,2,3,4,5]; let i = index"
                      class="star-button"
                      [class.filled]="i < reviewForm.get('rating')?.value"
                      (click)="setRating(i + 1)">
                <mat-icon>{{ i < reviewForm.get('rating')?.value ? 'star' : 'star_border' }}</mat-icon>
              </button>
            </div>
            <p class="rating-text">{{ getRatingText() }}</p>
          </div>

          <!-- Review Title -->
          <mat-form-field class="full-width">
            <mat-label>Review Title *</mat-label>
            <input matInput formControlName="title" 
                   placeholder="Summarize your experience in a few words"
                   maxlength="100">
            <mat-hint align="end">{{ reviewForm.get('title')?.value?.length || 0 }}/100</mat-hint>
            <mat-error *ngIf="reviewForm.get('title')?.hasError('required')">
              Please provide a title for your review
            </mat-error>
            <mat-error *ngIf="reviewForm.get('title')?.hasError('minlength')">
              Title must be at least 5 characters long
            </mat-error>
          </mat-form-field>

          <!-- Review Comment -->
          <mat-form-field class="full-width">
            <mat-label>Detailed Review *</mat-label>
            <textarea matInput 
                      formControlName="comment"
                      placeholder="Tell others about your experience with this product..."
                      rows="5"
                      maxlength="1000">
            </textarea>
            <mat-hint align="end">{{ reviewForm.get('comment')?.value?.length || 0 }}/1000</mat-hint>
            <mat-error *ngIf="reviewForm.get('comment')?.hasError('required')">
              Please share your detailed experience
            </mat-error>
            <mat-error *ngIf="reviewForm.get('comment')?.hasError('minlength')">
              Review must be at least 20 characters long
            </mat-error>
          </mat-form-field>

          <!-- Pros and Cons -->
          <div class="pros-cons-section">
            <div class="pros-section">
              <h3>What did you like? (Optional)</h3>
              <div class="tags-input">
                <mat-chip-listbox class="chip-list">
                  <mat-chip-option *ngFor="let pro of pros; let i = index"
                                   class="pro-chip"
                                   (removed)="removePro(i)">
                    <mat-icon>thumb_up</mat-icon>
                    {{ pro }}
                    <button matChipRemove>
                      <mat-icon>cancel</mat-icon>
                    </button>
                  </mat-chip-option>
                </mat-chip-listbox>
                <div class="add-tag">
                  <input #prosInput
                         placeholder="Add what you liked..."
                         (keyup.enter)="addPro(prosInput.value); prosInput.value = ''"
                         maxlength="50">
                  <button type="button" 
                          mat-icon-button 
                          (click)="addPro(prosInput.value); prosInput.value = ''"
                          [disabled]="!prosInput.value?.trim()">
                    <mat-icon>add</mat-icon>
                  </button>
                </div>
              </div>
            </div>

            <div class="cons-section">
              <h3>What could be improved? (Optional)</h3>
              <div class="tags-input">
                <mat-chip-listbox class="chip-list">
                  <mat-chip-option *ngFor="let con of cons; let i = index"
                                   class="con-chip"
                                   (removed)="removeCon(i)">
                    <mat-icon>thumb_down</mat-icon>
                    {{ con }}
                    <button matChipRemove>
                      <mat-icon>cancel</mat-icon>
                    </button>
                  </mat-chip-option>
                </mat-chip-listbox>
                <div class="add-tag">
                  <input #consInput
                         placeholder="Add areas for improvement..."
                         (keyup.enter)="addCon(consInput.value); consInput.value = ''"
                         maxlength="50">
                  <button type="button" 
                          mat-icon-button 
                          (click)="addCon(consInput.value); consInput.value = ''"
                          [disabled]="!consInput.value?.trim()">
                    <mat-icon>add</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Photo Upload -->
          <div class="photo-section">
            <h3>Add Photos (Optional)</h3>
            <p class="photo-hint">Help others by sharing photos of the product</p>
            
            <div class="photo-upload-area">
              <input type="file" 
                     #fileInput 
                     multiple 
                     accept="image/*" 
                     (change)="onFileSelected($event)"
                     style="display: none;">
              
              <div class="uploaded-photos" *ngIf="uploadedImages.length > 0">
                <div class="photo-preview" *ngFor="let image of uploadedImages; let i = index">
                  <img [src]="image.preview" [alt]="'Review photo ' + (i + 1)">
                  <button type="button" 
                          class="remove-photo" 
                          (click)="removeImage(i)">
                    <mat-icon>close</mat-icon>
                  </button>
                  <div class="upload-progress" *ngIf="image.uploading">
                    <mat-progress-bar mode="indeterminate"></mat-progress-bar>
                  </div>
                </div>
              </div>

              <button type="button" 
                      mat-stroked-button 
                      class="upload-button"
                      (click)="fileInput.click()"
                      [disabled]="uploadedImages.length >= 5">
                <mat-icon>add_photo_alternate</mat-icon>
                Add Photos ({{ uploadedImages.length }}/5)
              </button>
            </div>
          </div>

          <!-- Recommendation -->
          <div class="recommendation-section">
            <h3>Would you recommend this product?</h3>
            <div class="recommendation-buttons">
              <button type="button"
                      mat-button
                      [class.selected]="wouldRecommend === true"
                      (click)="setRecommendation(true)">
                <mat-icon>thumb_up</mat-icon>
                Yes, I recommend it
              </button>
              <button type="button"
                      mat-button
                      [class.selected]="wouldRecommend === false"
                      (click)="setRecommendation(false)">
                <mat-icon>thumb_down</mat-icon>
                No, I don't recommend it
              </button>
            </div>
          </div>

        </form>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="close()">Cancel</button>
        <button mat-raised-button 
                color="primary" 
                (click)="submitReview()"
                [disabled]="!reviewForm.valid || isSubmitting">
          <mat-icon *ngIf="isSubmitting">hourglass_empty</mat-icon>
          {{ isEditing ? 'Update Review' : 'Submit Review' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .review-dialog {
      width: 600px;
      max-width: 90vw;
    }

    .dialog-title {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 0;
      margin-bottom: 16px;
    }

    .product-info {
      display: flex;
      gap: 16px;
      flex: 1;
    }

    .product-image {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 8px;
    }

    .product-details h2 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 500;
    }

    .product-name {
      color: #666;
      margin: 0;
      font-size: 14px;
    }

    .dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }

    .review-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .rating-section {
      text-align: center;
    }

    .rating-section h3 {
      margin: 0 0 16px 0;
      color: #333;
    }

    .rating-stars {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .star-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 50%;
      transition: all 0.3s ease;
      color: #ddd;
    }

    .star-button:hover {
      background-color: rgba(255, 112, 67, 0.1);
      transform: scale(1.1);
    }

    .star-button.filled {
      color: #ff7043;
    }

    .rating-text {
      color: #666;
      font-size: 14px;
      margin: 0;
    }

    .full-width {
      width: 100%;
    }

    .pros-cons-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .pros-section h3,
    .cons-section h3 {
      margin: 0 0 12px 0;
      font-size: 16px;
      color: #333;
    }

    .tags-input {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .chip-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      min-height: 40px;
      align-items: flex-start;
      align-content: flex-start;
    }

    .pro-chip {
      background-color: rgba(76, 175, 80, 0.1);
      color: #4caf50;
    }

    .con-chip {
      background-color: rgba(244, 67, 54, 0.1);
      color: #f44336;
    }

    .add-tag {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .add-tag input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .add-tag input:focus {
      outline: none;
      border-color: #ff7043;
    }

    .photo-section h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .photo-hint {
      color: #666;
      font-size: 14px;
      margin: 0 0 16px 0;
    }

    .photo-upload-area {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .uploaded-photos {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 12px;
    }

    .photo-preview {
      position: relative;
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid #e0e0e0;
    }

    .photo-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove-photo {
      position: absolute;
      top: 4px;
      right: 4px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 16px;
    }

    .upload-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
    }

    .upload-button {
      align-self: flex-start;
    }

    .recommendation-section h3 {
      margin: 0 0 16px 0;
      color: #333;
    }

    .recommendation-buttons {
      display: flex;
      gap: 12px;
    }

    .recommendation-buttons button {
      border: 2px solid #e0e0e0;
      transition: all 0.3s ease;
    }

    .recommendation-buttons button.selected {
      background-color: rgba(255, 112, 67, 0.1);
      border-color: #ff7043;
      color: #ff7043;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }

    @media (max-width: 768px) {
      .review-dialog {
        width: 100%;
      }

      .pros-cons-section {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .uploaded-photos {
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      }

      .recommendation-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class ReviewDialogComponent implements OnInit {
  reviewForm: FormGroup;
  isEditing = false;
  isSubmitting = false;
  uploadedImages: Array<{ file: File; preview: string; uploading?: boolean }> = [];
  pros: string[] = [];
  cons: string[] = [];
  wouldRecommend: boolean | null = null;

  private ratingTexts = [
    '',
    'Poor - Not satisfied',
    'Fair - Below expectations',
    'Good - Met expectations',
    'Very Good - Exceeded expectations',
    'Excellent - Outstanding!'
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReviewDialogData
  ) {
    this.reviewForm = this.createForm();
    this.isEditing = !!data.existingReview;
  }

  ngOnInit(): void {
    if (this.data.existingReview) {
      this.loadExistingReview();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      rating: [0, [Validators.required, Validators.min(1)]],
      title: ['', [Validators.required, Validators.minLength(5)]],
      comment: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  private loadExistingReview(): void {
    const review = this.data.existingReview!;
    this.reviewForm.patchValue({
      rating: review.rating,
      title: review.title,
      comment: review.comment
    });
  }

  setRating(rating: number): void {
    this.reviewForm.patchValue({ rating });
  }

  getRatingText(): string {
    const rating = this.reviewForm.get('rating')?.value || 0;
    return this.ratingTexts[rating];
  }

  addPro(value: string): void {
    const trimmed = value.trim();
    if (trimmed && !this.pros.includes(trimmed) && this.pros.length < 5) {
      this.pros.push(trimmed);
    }
  }

  removePro(index: number): void {
    this.pros.splice(index, 1);
  }

  addCon(value: string): void {
    const trimmed = value.trim();
    if (trimmed && !this.cons.includes(trimmed) && this.cons.length < 5) {
      this.cons.push(trimmed);
    }
  }

  removeCon(index: number): void {
    this.cons.splice(index, 1);
  }

  setRecommendation(recommend: boolean): void {
    this.wouldRecommend = recommend;
  }

  onFileSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (this.uploadedImages.length >= 5) return;

      // Validate file
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Please select only image files', 'Close', { duration: 3000 });
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.snackBar.open('Image size should be less than 5MB', 'Close', { duration: 3000 });
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedImages.push({
          file,
          preview: e.target?.result as string,
          uploading: false
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    (event.target as HTMLInputElement).value = '';
  }

  removeImage(index: number): void {
    this.uploadedImages.splice(index, 1);
  }

  submitReview(): void {
    if (!this.reviewForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;

    const reviewData: ReviewFormData = {
      rating: this.reviewForm.value.rating,
      title: this.reviewForm.value.title,
      comment: this.reviewForm.value.comment,
      images: this.uploadedImages.map(img => img.file),
      pros: this.pros,
      cons: this.cons,
      wouldRecommend: this.wouldRecommend ?? true
    };

    // Simulate API call
    setTimeout(() => {
      this.dialogRef.close(reviewData);
      this.snackBar.open(
        this.isEditing ? 'Review updated successfully!' : 'Review submitted successfully!',
        'Close',
        { duration: 3000 }
      );
    }, 2000);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.reviewForm.controls).forEach(key => {
      this.reviewForm.get(key)?.markAsTouched();
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}