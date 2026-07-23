import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Bill, Payment, PaymentMethod, ServiceProvider, User } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  getProviders(): Observable<ServiceProvider[]> {
    return this.http.get<ServiceProvider[]>(`${this.baseUrl}/providers`);
  }

  getBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(`${this.baseUrl}/customer/bills`);
  }

  payBill(billId: number, method: PaymentMethod): Observable<Payment> {
    return this.http.post<Payment>(`${this.baseUrl}/customer/bills/${billId}/payments`, {
      method,
    });
  }

  getPaymentHistory(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.baseUrl}/customer/payments`);
  }

  getCustomers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/admin/customers`);
  }

  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.baseUrl}/admin/payments`);
  }

  createProvider(provider: {
    name: string;
    category: string;
    description: string;
  }): Observable<ServiceProvider> {
    return this.http.post<ServiceProvider>(`${this.baseUrl}/admin/providers`, provider);
  }

  createBill(bill: {
    customerId: number;
    serviceProviderId: number;
    referenceNumber: string;
    amount: number;
    dueDate: string;
  }): Observable<Bill> {
    return this.http.post<Bill>(`${this.baseUrl}/admin/bills`, bill);
  }
}
