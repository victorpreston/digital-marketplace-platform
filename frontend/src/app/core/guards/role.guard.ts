import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const user = authService.getCurrentUser();
    if (user && allowedRoles.includes(user.role)) {
      return true;
    }

    // Redirect to unauthorized page or dashboard
    router.navigate(['/dashboard']);
    return false;
  };
};

// Convenience guards for specific roles
export const customerGuard: CanActivateFn = roleGuard([UserRole.CUSTOMER]);
export const sellerGuard: CanActivateFn = roleGuard([UserRole.SELLER]);
export const courierGuard: CanActivateFn = roleGuard([UserRole.COURIER]);
export const sellerOrCourierGuard: CanActivateFn = roleGuard([UserRole.SELLER, UserRole.COURIER]);