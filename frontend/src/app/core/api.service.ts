import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { DemoDataService } from './demo-data.service';
import { Bill, Payment, PaymentMethod, ServiceProvider, User } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly demo = inject(DemoDataService);
  private readonly baseUrl = '/api';

  getProviders(): Observable<ServiceProvider[]> {
    if (this.auth.isDemoSession()) return this.demo.getProviders();
    return this.http.get<ServiceProvider[]>(`${this.baseUrl}/providers`);
  }

  getBills(): Observable<Bill[]> {
    if (this.auth.isDemoSession()) return this.demo.getBills();
    return this.http.get<Bill[]>(`${this.baseUrl}/customer/bills`);
  }

  payBill(billId: number, method: PaymentMethod): Observable<Payment> {
    if (this.auth.isDemoSession()) return this.demo.payBill(billId, method);
    return this.http.post<Payment>(`${this.baseUrl}/customer/bills/${billId}/payments`, {
      method,
    });
  }

  getPaymentHistory(): Observable<Payment[]> {
    if (this.auth.isDemoSession()) return this.demo.getPaymentHistory();
    return this.http.get<Payment[]>(`${this.baseUrl}/customer/payments`);
  }

  getCustomers(): Observable<User[]> {
    if (this.auth.isDemoSession()) return this.demo.getCustomers();
    return this.http.get<User[]>(`${this.baseUrl}/admin/customers`);
  }

  getAllPayments(): Observable<Payment[]> {
    if (this.auth.isDemoSession()) return this.demo.getAllPayments();
    return this.http.get<Payment[]>(`${this.baseUrl}/admin/payments`);
  }

  createProvider(provider: {
    name: string;
    category: string;
    description: string;
  }): Observable<ServiceProvider> {
    if (this.auth.isDemoSession()) return this.demo.createProvider(provider);
    return this.http.post<ServiceProvider>(`${this.baseUrl}/admin/providers`, provider);
  }

  createBill(bill: {
    customerId: number;
    serviceProviderId: number;
    referenceNumber: string;
    amount: number;
    dueDate: string;
  }): Observable<Bill> {
    if (this.auth.isDemoSession()) return this.demo.createBill(bill);
    return this.http.post<Bill>(`${this.baseUrl}/admin/bills`, bill);
  }
}
