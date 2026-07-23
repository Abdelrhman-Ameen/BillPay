import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { Bill, Payment, PaymentMethod, ServiceProvider, User } from './models';

const DEMO_STATE_KEY = 'billpay_demo_state_v1';
const PRIMARY_CUSTOMER_ID = 2;
const RESPONSE_DELAY_MS = 220;

interface DemoState {
  providers: ServiceProvider[];
  customers: User[];
  bills: Bill[];
  payments: Payment[];
  nextProviderId: number;
  nextBillId: number;
  nextPaymentId: number;
}

@Injectable({ providedIn: 'root' })
export class DemoDataService {
  private state = this.restoreState();

  getProviders(): Observable<ServiceProvider[]> {
    return this.respond([...this.state.providers].sort((a, b) => a.name.localeCompare(b.name)));
  }

  getBills(): Observable<Bill[]> {
    return this.respond(
      this.state.bills
        .filter((bill) => bill.customerId === PRIMARY_CUSTOMER_ID)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    );
  }

  payBill(billId: number, method: PaymentMethod): Observable<Payment> {
    const bill = this.state.bills.find(
      (candidate) => candidate.id === billId && candidate.customerId === PRIMARY_CUSTOMER_ID,
    );
    if (!bill) {
      return this.fail('Bill not found in this demo account.');
    }
    if (bill.status === 'PAID') {
      return this.fail('This bill has already been paid.');
    }
    if (bill.status === 'CANCELLED') {
      return this.fail('A cancelled bill cannot be paid.');
    }

    const successful =
      method === 'CASH' ||
      (method === 'CARD' && Number(bill.amount) <= 20_000) ||
      (method === 'WALLET' && Number(bill.amount) <= 5_000);
    const messages: Record<PaymentMethod, [string, string]> = {
      CASH: ['Cash payment accepted at the service counter', 'Cash payment could not be accepted'],
      CARD: ['Card authorized successfully', 'Card authorization declined by the simulator'],
      WALLET: ['Wallet payment confirmed', 'Wallet balance is insufficient in the simulator'],
    };
    const paymentId = this.state.nextPaymentId++;
    const payment: Payment = {
      id: paymentId,
      transactionReference: `${this.methodPrefix(method)}-DEMO-${paymentId.toString().padStart(5, '0')}`,
      amount: bill.amount,
      method,
      status: successful ? 'SUCCESS' : 'FAILED',
      message: messages[method][successful ? 0 : 1],
      createdAt: new Date().toISOString(),
      billId: bill.id,
      billReference: bill.referenceNumber,
      serviceProviderName: bill.serviceProviderName,
      customerId: bill.customerId,
      customerName: bill.customerName,
    };

    this.state.payments.unshift(payment);
    if (successful) {
      bill.status = 'PAID';
    }
    this.persist();
    return this.respond(payment);
  }

  getPaymentHistory(): Observable<Payment[]> {
    return this.respond(
      this.state.payments
        .filter((payment) => payment.customerId === PRIMARY_CUSTOMER_ID)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  }

  getCustomers(): Observable<User[]> {
    return this.respond(
      [...this.state.customers].sort((a, b) => a.fullName.localeCompare(b.fullName)),
    );
  }

  getAllPayments(): Observable<Payment[]> {
    return this.respond(
      [...this.state.payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  }

  createProvider(provider: {
    name: string;
    category: string;
    description: string;
  }): Observable<ServiceProvider> {
    const created: ServiceProvider = {
      id: this.state.nextProviderId++,
      ...provider,
      createdAt: new Date().toISOString(),
    };
    this.state.providers.push(created);
    this.persist();
    return this.respond(created);
  }

  createBill(input: {
    customerId: number;
    serviceProviderId: number;
    referenceNumber: string;
    amount: number;
    dueDate: string;
  }): Observable<Bill> {
    const customer = this.state.customers.find((candidate) => candidate.id === input.customerId);
    const provider = this.state.providers.find(
      (candidate) => candidate.id === input.serviceProviderId,
    );
    if (!customer || !provider) {
      return this.fail('Choose a valid customer and service provider.');
    }
    if (input.amount <= 0) {
      return this.fail('Bill amount must be positive.');
    }

    const bill: Bill = {
      id: this.state.nextBillId++,
      referenceNumber: input.referenceNumber,
      amount: input.amount,
      dueDate: input.dueDate,
      status: 'PENDING',
      serviceProviderId: provider.id,
      serviceProviderName: provider.name,
      serviceCategory: provider.category,
      customerId: customer.id,
      customerName: customer.fullName,
      createdAt: new Date().toISOString(),
    };
    this.state.bills.push(bill);
    this.persist();
    return this.respond(bill);
  }

  private respond<T>(value: T): Observable<T> {
    return of(structuredClone(value)).pipe(delay(RESPONSE_DELAY_MS));
  }

  private fail<T>(message: string): Observable<T> {
    return throwError(() => ({ status: 400, error: { message } }));
  }

  private methodPrefix(method: PaymentMethod): string {
    return method === 'CARD' ? 'CRD' : method === 'WALLET' ? 'WLT' : 'CSH';
  }

  private persist(): void {
    localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(this.state));
  }

  private restoreState(): DemoState {
    const stored = localStorage.getItem(DEMO_STATE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as DemoState;
        if (
          Array.isArray(parsed.providers) &&
          Array.isArray(parsed.customers) &&
          Array.isArray(parsed.bills) &&
          Array.isArray(parsed.payments)
        ) {
          return parsed;
        }
      } catch {
        localStorage.removeItem(DEMO_STATE_KEY);
      }
    }
    return this.createInitialState();
  }

  private createInitialState(): DemoState {
    const providers: ServiceProvider[] = [
      {
        id: 1,
        name: 'Cairo Electric',
        category: 'Electricity',
        description: 'Residential electricity bills and meter services',
        createdAt: this.daysFromNow(-90, true),
      },
      {
        id: 2,
        name: 'Nile Connect',
        category: 'Internet',
        description: 'Home internet subscriptions and monthly packages',
        createdAt: this.daysFromNow(-80, true),
      },
      {
        id: 3,
        name: 'PureFlow',
        category: 'Water',
        description: 'Municipal water and utility account payments',
        createdAt: this.daysFromNow(-70, true),
      },
    ];
    const customers: User[] = [
      {
        id: PRIMARY_CUSTOMER_ID,
        fullName: 'Abdurrahman Ameen',
        email: 'customer@billpay.dev',
        role: 'CUSTOMER',
      },
      {
        id: 3,
        fullName: 'Salma Hassan',
        email: 'salma@example.dev',
        role: 'CUSTOMER',
      },
    ];
    const bills: Bill[] = [
      this.bill(1, customers[0], providers[0], 'CE-2026-10482', 745.5, 5, 'PENDING'),
      this.bill(2, customers[0], providers[1], 'NC-883104', 1280, 11, 'PENDING'),
      this.bill(3, customers[0], providers[2], 'PF-42071', 6200, 17, 'PENDING'),
      this.bill(4, customers[0], providers[0], 'CE-2026-09112', 410.25, -16, 'PAID'),
      this.bill(5, customers[0], providers[1], 'NC-771508', 950, -28, 'CANCELLED'),
      this.bill(6, customers[1], providers[2], 'PF-66291', 560, 8, 'PAID'),
    ];
    const payments: Payment[] = [
      this.payment(1, bills[3], 'CARD', 'SUCCESS', -15, 'Card authorized successfully'),
      this.payment(
        2,
        bills[2],
        'WALLET',
        'FAILED',
        -4,
        'Wallet balance is insufficient in the simulator',
      ),
      this.payment(3, bills[5], 'CASH', 'SUCCESS', -2, 'Cash payment accepted at the service counter'),
    ];

    return {
      providers,
      customers,
      bills,
      payments,
      nextProviderId: 4,
      nextBillId: 7,
      nextPaymentId: 4,
    };
  }

  private bill(
    id: number,
    customer: User,
    provider: ServiceProvider,
    referenceNumber: string,
    amount: number,
    dueInDays: number,
    status: Bill['status'],
  ): Bill {
    return {
      id,
      referenceNumber,
      amount,
      dueDate: this.daysFromNow(dueInDays),
      status,
      serviceProviderId: provider.id,
      serviceProviderName: provider.name,
      serviceCategory: provider.category,
      customerId: customer.id,
      customerName: customer.fullName,
      createdAt: this.daysFromNow(dueInDays - 30, true),
    };
  }

  private payment(
    id: number,
    bill: Bill,
    method: PaymentMethod,
    status: Payment['status'],
    createdDaysAgo: number,
    message: string,
  ): Payment {
    return {
      id,
      transactionReference: `${this.methodPrefix(method)}-DEMO-${id.toString().padStart(5, '0')}`,
      amount: bill.amount,
      method,
      status,
      message,
      createdAt: this.daysFromNow(createdDaysAgo, true),
      billId: bill.id,
      billReference: bill.referenceNumber,
      serviceProviderName: bill.serviceProviderName,
      customerId: bill.customerId,
      customerName: bill.customerName,
    };
  }

  private daysFromNow(days: number, includeTime = false): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return includeTime ? date.toISOString() : date.toISOString().slice(0, 10);
  }
}
