import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);  

  if (authService.isLoggedIn()) {
    return true;
  } else {
    authService.setRedirectUrl(state.url);
    authService.logout(); // clear token if expired
    return router.createUrlTree(['auth/login']);
  }
};
