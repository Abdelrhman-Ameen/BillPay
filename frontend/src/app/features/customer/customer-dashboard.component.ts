import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  LucideArrowRight,
  LucideBanknote,
  LucideCheck,
  LucideCreditCard,
  LucideDroplets,
  LucideReceiptText,
  LucideRefreshCw,
  LucideShieldCheck,
  LucideWallet,
  LucideWifi,
  LucideX,
  LucideZap,
} from '@lucide/angular';
import { finalize } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ApiError, Bill, Payment, PaymentMethod } from '../../core/models';

@Component({
  selector: 'app-customer-dashboard',
  imports: [
    CurrencyPipe,
    DatePipe,
    TitleCasePipe,
    LucideArrowRight,
    LucideBanknote,
    LucideCheck,
    LucideCreditCard,
    LucideDroplets,
    LucideReceiptText,
    LucideRefreshCw,
    LucideShieldCheck,
    LucideWallet,
    LucideWifi,
    LucideX,
    LucideZap,
  ],
  templateUrl: './customer-dashboard.component.html',
  styleUrl: './customer-dashboard.component.scss',
})
export class CustomerDashboardComponent {
  private readonly api = inject(ApiService);
  protected readonly auth = inject(AuthService);

  readonly bills = signal<Bill[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly selectedBill = signal<Bill | null>(null);
  readonly selectedMethod = signal<PaymentMethod>('CARD');
  readonly paying = signal(false);
  readonly paymentResult = signal<Payment | null>(null);
  readonly paymentError = signal('');
  readonly today = new Date();

  readonly pendingBills = computed(() => this.bills().filter((bill) => bill.status === 'PENDING'));
  readonly paidBills = computed(() => this.bills().filter((bill) => bill.status === 'PAID'));
  readonly totalDue = computed(() =>
    this.pendingBills().reduce((total, bill) => total + Number(bill.amount), 0),
  );

  constructor() {
    this.loadBills();
  }

  openPayment(bill: Bill): void {
    this.selectedBill.set(bill);
    this.selectedMethod.set('CARD');
    this.paymentResult.set(null);
    this.paymentError.set('');
  }

  closePayment(): void {
    if (!this.paying()) {
      this.selectedBill.set(null);
      this.paymentResult.set(null);
    }
  }

  pay(): void {
    const bill = this.selectedBill();
    if (!bill) return;
    this.paying.set(true);
    this.paymentError.set('');
    this.api
      .payBill(bill.id, this.selectedMethod())
      .pipe(finalize(() => this.paying.set(false)))
      .subscribe({
        next: (payment) => {
          this.paymentResult.set(payment);
          if (payment.status === 'SUCCESS') {
            this.bills.update((bills) =>
              bills.map((item) => (item.id === bill.id ? { ...item, status: 'PAID' } : item)),
            );
          }
        },
        error: (response) => {
          const error = response.error as ApiError | undefined;
          this.paymentError.set(error?.message ?? 'Payment could not be completed.');
        },
      });
  }

  loadBills(): void {
    this.loading.set(true);
    this.loadError.set('');
    this.api
      .getBills()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (bills) => this.bills.set(bills),
        error: () => this.loadError.set('Could not load bills. Check that the API is running.'),
      });
  }

  methodNote(method: PaymentMethod): string {
    if (method === 'WALLET') return 'Demo limit: EGP 5,000';
    if (method === 'CARD') return 'Demo limit: EGP 20,000';
    return 'Always accepted in demo';
  }
}
