import { Routes } from '@angular/router';
import { onboardingGuard } from './guards/onboarding.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'onboarding',
    pathMatch: 'full'
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./onboarding/onboarding.page').then(m => m.OnboardingPage),
    canActivate: [onboardingGuard]
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
    canActivate: [onboardingGuard]
  },
  {
    path: 'bills',
    loadComponent: () => import('./bills/bills.page').then(m => m.BillsPage),
    canActivate: [onboardingGuard]
  },
  {
    path: 'wallet',
    loadComponent: () => import('./wallet/wallet.page').then(m => m.WalletPage),
    canActivate: [onboardingGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.page').then(m => m.SettingsPage),
    canActivate: [onboardingGuard]
  },
  {
    path: 'add-entry',
    loadComponent: () => import('./add-entry/add-entry-page').then(m => m.AddEntryPage),
    canActivate: [onboardingGuard]
  }
];