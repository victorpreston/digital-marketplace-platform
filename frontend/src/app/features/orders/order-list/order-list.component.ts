import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Orders</h1>
      <p>Order management will be implemented here.</p>
    </div>
  `
})
export class OrderListComponent {}