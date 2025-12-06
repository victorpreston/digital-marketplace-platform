import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <h1>Order Detail</h1>
      <p>Order detail functionality will be implemented here.</p>
    </div>
  `
})
export class OrderDetailComponent {}