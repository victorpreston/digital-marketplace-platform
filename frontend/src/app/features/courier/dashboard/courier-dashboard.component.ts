import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-courier-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Courier Dashboard</h1>
      <p>Courier features will be implemented here.</p>
    </div>
  `
})
export class CourierDashboardComponent {}