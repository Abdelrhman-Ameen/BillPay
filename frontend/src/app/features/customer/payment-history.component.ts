import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  LucideCheck,
  LucideHistory,
  LucideRefreshCw,
  LucideSearch,
  LucideX,
} from '@lucide/angular';
import { finalize } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Payment } from '../../core/models';

@Component({
  selector: 'app-payment-history',
  imports: [
    CurrencyPipe,
    DatePipe,
    TitleCasePipe,
    LucideCheck,
    LucideHistory,
    LucideRefreshCw,
    LucideSearch,
    LucideX,
  ],
  templateUrl: './payment-history.component.html',
  styleUrl: './payment-history.component.scss',
})
export class PaymentHistoryComponent {
  private readonly api = inject(ApiService);

  readonly payments = signal<Payment[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly search = signal('');
  readonly statusFilter = signal<'ALL' | 'SUCCESS' | 'FAILED'>('ALL');

  readonly successfulTotal = computed(() =>
    this.payments()
      .filter((payment) => payment.status === 'SUCCESS')
      .reduce((total, payment) => total + Number(payment.amount), 0),
  );

  readonly filteredPayments = computed(() => {
    const search = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    return this.payments().filter((payment) => {
      const matchesStatus = status === 'ALL' || payment.status === status;
      const matchesSearch =
        !search ||
        payment.serviceProviderName.toLowerCase().includes(search) ||
        payment.transactionReference.toLowerCase().includes(search) ||
        payment.billReference.toLowerCase().includes(search);
      return matchesStatus && matchesSearch;
    });
  });

  constructor() {
    this.load();
  }

  get failedCount(): string {
    return this.payments()
      .filter((payment) => payment.status === 'FAILED')
      .length.toString()
      .padStart(2, '0');
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api
      .getPaymentHistory()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (payments) => this.payments.set(payments),
        error: () => this.error.set('Could not load payment history.'),
      });
  }
}
