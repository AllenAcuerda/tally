import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

export const onboardingGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const router = inject(Router);
  
  const hasSeenOnboarding = 
    localStorage.getItem('has_seen_onboarding') === 'true' || 
    localStorage.getItem('user_name') !== null;

  // If user already finished onboarding, but tries to visit /onboarding, send them home securely
  if (state.url.includes('/onboarding') && hasSeenOnboarding) {
    return router.createUrlTree(['/home']);
  }

  // If user has NOT finished onboarding, send them to onboarding
  if (!state.url.includes('/onboarding') && !hasSeenOnboarding) {
    return router.createUrlTree(['/onboarding']);
  }

  return true;
};