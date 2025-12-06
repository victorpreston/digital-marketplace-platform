import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Profile</h1>
      <p>Profile management will be implemented here.</p>
    </div>
  `
})
export class ProfileComponent {}