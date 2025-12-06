import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Product Detail</h1>
      <p>Product details will be implemented here.</p>
    </div>
  `
})
export class ProductDetailComponent {}