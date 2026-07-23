import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideBuilding2,
  LucideCheck,
  LucideCircleDollarSign,
  LucideFilePlus2,
  LucidePlus,
  LucideReceiptText,
  LucideRefreshCw,
  LucideUsers,
  LucideX,
} from '@lucide/angular';
import { finalize, forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ApiError, Payment, ServiceProvider, User } from '../../core/models';

type AdminTab = 'providers' | 'bills' | 'payments';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    TitleCasePipe,
    LucideBuilding2,
    LucideCheck,
    LucideCircleDollarSign,
    LucideFilePlus2,
    LucidePlus,
    LucideReceiptText,
    LucideRefreshCw,
    LucideUsers,
    LucideX,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {
  private readonly api = inject(ApiService);
  private readonly formBuilder = inject(FormBuilder);

  readonly tab = signal<AdminTab>('providers');
  readonly providers = signal<ServiceProvider[]>([]);
  readonly customers = signal<User[]>([]);
  readonly payments = signal<Payment[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  readonly successfulVolume = computed(() =>
    this.payments()
      .filter((payment) => payment.status === 'SUCCESS')
      .reduce((total, payment) => total + Number(payment.amount), 0),
  );

  readonly providerForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    category: ['', [Validators.required, Validators.maxLength(60)]],
    description: ['', [Validators.required, Validators.maxLength(280)]],
  });

  readonly billForm = this.formBuilder.nonNullable.group({
    customerId: [0, [Validators.required, Validators.min(1)]],
    serviceProviderId: [0, [Validators.required, Validators.min(1)]],
    referenceNumber: ['', [Validators.required, Validators.maxLength(60)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    dueDate: ['', Validators.required],
  });

  readonly minDate = new Date().toISOString().slice(0, 10);

  constructor() {
    this.load();
  }

  switchTab(tab: AdminTab): void {
    this.tab.set(tab);
    this.error.set('');
    this.success.set('');
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    forkJoin({
      providers: this.api.getProviders(),
      customers: this.api.getCustomers(),
      payments: this.api.getAllPayments(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ providers, customers, payments }) => {
          this.providers.set(providers);
          this.customers.set(customers);
          this.payments.set(payments);
        },
        error: () => this.error.set('Could not load the admin workspace. Check the API connection.'),
      });
  }

  createProvider(): void {
    this.error.set('');
    this.success.set('');
    if (this.providerForm.invalid) {
      this.providerForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.api
      .createProvider(this.providerForm.getRawValue())
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (provider) => {
          this.providers.update((providers) =>
            [...providers, provider].sort((a, b) => a.name.localeCompare(b.name)),
          );
          this.providerForm.reset({ name: '', category: '', description: '' });
          this.success.set(`${provider.name} is now available for bills.`);
        },
        error: (response) => this.setApiError(response.error),
      });
  }

  createBill(): void {
    this.error.set('');
    this.success.set('');
    if (this.billForm.invalid) {
      this.billForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.api
      .createBill(this.billForm.getRawValue())
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (bill) => {
          this.billForm.reset({
            customerId: 0,
            serviceProviderId: 0,
            referenceNumber: '',
            amount: 0,
            dueDate: '',
          });
          this.success.set(`Bill ${bill.referenceNumber} was created for ${bill.customerName}.`);
        },
        error: (response) => this.setApiError(response.error),
      });
  }

  private setApiError(error: ApiError | undefined): void {
    this.error.set(error?.message ?? 'The request could not be completed.');
  }
}
