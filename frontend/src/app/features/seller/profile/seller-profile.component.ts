import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-seller-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <h1>Seller Profile</h1>
      <p>Seller profile functionality will be implemented here.</p>
    </div>
  `
})
export class SellerProfileComponent {}