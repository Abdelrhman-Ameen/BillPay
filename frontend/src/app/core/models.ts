export type Role = 'CUSTOMER' | 'ADMIN';
export type BillStatus = 'PENDING' | 'PAID' | 'CANCELLED';
export type PaymentStatus = 'SUCCESS' | 'FAILED';
export type PaymentMethod = 'CASH' | 'CARD' | 'WALLET';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ServiceProvider {
  id: number;
  name: string;
  category: string;
  description: string;
  createdAt: string;
}

export interface Bill {
  id: number;
  referenceNumber: string;
  amount: number;
  dueDate: string;
  status: BillStatus;
  serviceProviderId: number;
  serviceProviderName: string;
  serviceCategory: string;
  customerId: number;
  customerName: string;
  createdAt: string;
}

export interface Payment {
  id: number;
  transactionReference: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  message: string;
  createdAt: string;
  billId: number;
  billReference: string;
  serviceProviderName: string;
  customerId: number;
  customerName: string;
}

export interface ApiError {
  message?: string;
  validationErrors?: Record<string, string>;
}
