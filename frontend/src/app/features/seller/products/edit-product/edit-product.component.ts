import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <h1>Edit Product</h1>
      <p>Edit product functionality will be implemented here.</p>
      <button [routerLink]="'/seller/products'">Back to Products</button>
    </div>
  `
})
export class EditProductComponent {}