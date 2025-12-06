import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

export interface ImageViewerData {
  images: { url: string; altText?: string; title?: string }[];
  currentIndex?: number;
}

@Component({
  selector: 'app-image-viewer',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule
  ],
  template: `
    <div class="image-viewer-container">
      <mat-toolbar class="viewer-toolbar">
        <span class="image-counter">{{ currentIndex + 1 }} of {{ images.length }}</span>
        
        <div class="toolbar-actions">
          <button mat-icon-button (click)="zoomOut()" [disabled]="zoomLevel <= 0.5">
            <mat-icon>zoom_out</mat-icon>
          </button>
          
          <span class="zoom-level">{{ (zoomLevel * 100).toFixed(0) }}%</span>
          
          <button mat-icon-button (click)="zoomIn()" [disabled]="zoomLevel >= 3">
            <mat-icon>zoom_in</mat-icon>
          </button>
          
          <button mat-icon-button (click)="resetZoom()">
            <mat-icon>center_focus_strong</mat-icon>
          </button>
          
          <button mat-icon-button (click)="downloadImage()" *ngIf="currentImage">
            <mat-icon>download</mat-icon>
          </button>
          
          <button mat-icon-button (click)="close()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </mat-toolbar>

      <div class="viewer-content" (wheel)="onWheel($event)">
        <div class="navigation-area">
          <!-- Previous Button -->
          <button mat-fab 
                  color="primary" 
                  class="nav-button prev-button"
                  (click)="previousImage()"
                  [disabled]="images.length <= 1"
                  *ngIf="images.length > 1">
            <mat-icon>chevron_left</mat-icon>
          </button>

          <!-- Image Container -->
          <div class="image-container" 
               #imageContainer
               (mousedown)="startDrag($event)"
               (mousemove)="drag($event)"
               (mouseup)="endDrag()"
               (mouseleave)="endDrag()"
               (click)="toggleZoom($event)">
            
            <img [src]="currentImage?.url" 
                 [alt]="currentImage?.altText || 'Product image'"
                 [style.transform]="getImageTransform()"
                 [style.cursor]="isDragging ? 'grabbing' : (zoomLevel > 1 ? 'grab' : 'zoom-in')"
                 class="viewer-image"
                 (load)="onImageLoad()"
                 (error)="onImageError()">
            
            <div class="loading-overlay" *ngIf="isLoading">
              <div class="loading-spinner"></div>
            </div>
            
            <div class="error-overlay" *ngIf="hasError">
              <mat-icon>broken_image</mat-icon>
              <p>Failed to load image</p>
            </div>
          </div>

          <!-- Next Button -->
          <button mat-fab 
                  color="primary" 
                  class="nav-button next-button"
                  (click)="nextImage()"
                  [disabled]="images.length <= 1"
                  *ngIf="images.length > 1">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>

        <!-- Thumbnails -->
        <div class="thumbnails-container" *ngIf="images.length > 1">
          <div class="thumbnails-scroll">
            <div class="thumbnail" 
                 *ngFor="let image of images; let i = index"
                 [class.active]="i === currentIndex"
                 (click)="goToImage(i)">
              <img [src]="image.url" 
                   [alt]="image.altText || 'Thumbnail'"
                   class="thumbnail-image">
            </div>
          </div>
        </div>

        <!-- Image Info -->
        <div class="image-info" *ngIf="currentImage?.title">
          <h3>{{ currentImage.title }}</h3>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .image-viewer-container {
      display: flex;
      flex-direction: column;
      height: 90vh;
      width: 90vw;
      max-width: 1200px;
      background: #000;
    }

    .viewer-toolbar {
      background: rgba(0, 0, 0, 0.8);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
      min-height: 56px;
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .zoom-level {
      font-size: 14px;
      min-width: 50px;
      text-align: center;
    }

    .viewer-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }

    .navigation-area {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .nav-button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 10;
      opacity: 0.7;
      transition: opacity 0.3s ease;
    }

    .nav-button:hover {
      opacity: 1;
    }

    .prev-button {
      left: 20px;
    }

    .next-button {
      right: 20px;
    }

    .image-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      user-select: none;
    }

    .viewer-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      transition: transform 0.3s ease;
      user-drag: none;
      -webkit-user-drag: none;
    }

    .loading-overlay,
    .error-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid #ff7043;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .thumbnails-container {
      background: rgba(0, 0, 0, 0.8);
      padding: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .thumbnails-scroll {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 4px;
    }

    .thumbnail {
      flex-shrink: 0;
      width: 60px;
      height: 60px;
      border: 2px solid transparent;
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
      transition: border-color 0.3s ease;
    }

    .thumbnail:hover {
      border-color: rgba(255, 112, 67, 0.5);
    }

    .thumbnail.active {
      border-color: #ff7043;
    }

    .thumbnail-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-info {
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 16px;
      text-align: center;
    }

    .image-info h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    /* Mobile Styles */
    @media (max-width: 768px) {
      .image-viewer-container {
        height: 100vh;
        width: 100vw;
      }

      .nav-button {
        width: 40px;
        height: 40px;
      }

      .prev-button {
        left: 10px;
      }

      .next-button {
        right: 10px;
      }

      .thumbnails-container {
        padding: 12px;
      }

      .thumbnail {
        width: 50px;
        height: 50px;
      }
    }

    /* Hide scrollbar */
    .thumbnails-scroll::-webkit-scrollbar {
      height: 4px;
    }

    .thumbnails-scroll::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
    }

    .thumbnails-scroll::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
    }
  `]
})
export class ImageViewerComponent implements OnInit {
  images: { url: string; altText?: string; title?: string }[] = [];
  currentIndex = 0;
  zoomLevel = 1;
  translateX = 0;
  translateY = 0;
  isDragging = false;
  dragStartX = 0;
  dragStartY = 0;
  isLoading = true;
  hasError = false;

  constructor(
    public dialogRef: MatDialogRef<ImageViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImageViewerData
  ) {}

  ngOnInit(): void {
    this.images = this.data.images || [];
    this.currentIndex = this.data.currentIndex || 0;

    // Handle keyboard events
    document.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  get currentImage() {
    return this.images[this.currentIndex];
  }

  handleKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        this.close();
        break;
      case 'ArrowLeft':
        this.previousImage();
        break;
      case 'ArrowRight':
        this.nextImage();
        break;
      case '+':
      case '=':
        this.zoomIn();
        break;
      case '-':
        this.zoomOut();
        break;
      case '0':
        this.resetZoom();
        break;
    }
  }

  previousImage(): void {
    if (this.images.length > 1) {
      this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.images.length - 1;
      this.resetZoom();
    }
  }

  nextImage(): void {
    if (this.images.length > 1) {
      this.currentIndex = this.currentIndex < this.images.length - 1 ? this.currentIndex + 1 : 0;
      this.resetZoom();
    }
  }

  goToImage(index: number): void {
    this.currentIndex = index;
    this.resetZoom();
  }

  zoomIn(): void {
    this.zoomLevel = Math.min(this.zoomLevel * 1.2, 3);
  }

  zoomOut(): void {
    this.zoomLevel = Math.max(this.zoomLevel / 1.2, 0.5);
    this.constrainTranslation();
  }

  resetZoom(): void {
    this.zoomLevel = 1;
    this.translateX = 0;
    this.translateY = 0;
  }

  toggleZoom(event: MouseEvent): void {
    if (this.isDragging) return;

    if (this.zoomLevel === 1) {
      this.zoomLevel = 2;
      // Zoom to click point
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;
      
      this.translateX = (centerX - clickX) * this.zoomLevel;
      this.translateY = (centerY - clickY) * this.zoomLevel;
    } else {
      this.resetZoom();
    }
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    if (event.deltaY < 0) {
      this.zoomIn();
    } else {
      this.zoomOut();
    }
  }

  startDrag(event: MouseEvent): void {
    if (this.zoomLevel > 1) {
      this.isDragging = true;
      this.dragStartX = event.clientX - this.translateX;
      this.dragStartY = event.clientY - this.translateY;
      event.preventDefault();
    }
  }

  drag(event: MouseEvent): void {
    if (this.isDragging) {
      this.translateX = event.clientX - this.dragStartX;
      this.translateY = event.clientY - this.dragStartY;
      this.constrainTranslation();
    }
  }

  endDrag(): void {
    this.isDragging = false;
  }

  private constrainTranslation(): void {
    const maxTranslate = 100 * (this.zoomLevel - 1);
    this.translateX = Math.max(-maxTranslate, Math.min(maxTranslate, this.translateX));
    this.translateY = Math.max(-maxTranslate, Math.min(maxTranslate, this.translateY));
  }

  getImageTransform(): string {
    return `scale(${this.zoomLevel}) translate(${this.translateX / this.zoomLevel}px, ${this.translateY / this.zoomLevel}px)`;
  }

  onImageLoad(): void {
    this.isLoading = false;
    this.hasError = false;
  }

  onImageError(): void {
    this.isLoading = false;
    this.hasError = true;
  }

  downloadImage(): void {
    if (this.currentImage) {
      const link = document.createElement('a');
      link.href = this.currentImage.url;
      link.download = this.currentImage.title || 'image';
      link.click();
    }
  }

  close(): void {
    document.removeEventListener('keydown', this.handleKeydown);
    this.dialogRef.close();
  }
}