import { Routes } from '@angular/router';
import { adminGuard, customerGuard } from './core/guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then((module) => module.LandingComponent),
    title: 'BillPay — Every bill, one clear view',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/auth-page.component').then((module) => module.AuthPageComponent),
    data: { mode: 'login' },
    title: 'Log in — BillPay',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/auth-page.component').then((module) => module.AuthPageComponent),
    data: { mode: 'register' },
    title: 'Create account — BillPay',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/customer/customer-dashboard.component').then(
        (module) => module.CustomerDashboardComponent,
      ),
    canActivate: [customerGuard],
    title: 'My bills — BillPay',
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./features/customer/payment-history.component').then(
        (module) => module.PaymentHistoryComponent,
      ),
    canActivate: [customerGuard],
    title: 'Payment history — BillPay',
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin-dashboard.component').then(
        (module) => module.AdminDashboardComponent,
      ),
    canActivate: [adminGuard],
    title: 'Admin workspace — BillPay',
  },
  { path: '**', redirectTo: '' },
];
