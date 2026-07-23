import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { delay, Observable, of, tap, throwError } from 'rxjs';
import { AuthResponse, User } from './models';

const TOKEN_KEY = 'billpay_token';
const USER_KEY = 'billpay_user';
const DEMO_TOKEN_PREFIX = 'billpay-demo-';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

const DEMO_ACCOUNTS = {
  customer: {
    email: 'customer@billpay.dev',
    password: 'Customer123!',
    user: {
      id: 2,
      fullName: 'Abdurrahman Ameen',
      email: 'customer@billpay.dev',
      role: 'CUSTOMER',
    } satisfies User,
  },
  admin: {
    email: 'admin@billpay.dev',
    password: 'Admin123!',
    user: {
      id: 1,
      fullName: 'BillPay Admin',
      email: 'admin@billpay.dev',
      role: 'ADMIN',
    } satisfies User,
  },
} as const;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = '/api/auth';

  readonly hostedPreview =
    typeof window !== 'undefined' && !LOCAL_HOSTS.has(window.location.hostname);
  readonly user = signal<User | null>(this.restoreUser());
  readonly isAuthenticated = computed(() => Boolean(this.user()));
  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');
  readonly isDemoSession = computed(
    () => Boolean(this.user()) && this.token()?.startsWith(DEMO_TOKEN_PREFIX) === true,
  );

  login(email: string, password: string): Observable<AuthResponse> {
    if (this.hostedPreview) {
      const account = Object.values(DEMO_ACCOUNTS).find(
        (candidate) =>
          candidate.email.toLowerCase() === email.trim().toLowerCase() &&
          candidate.password === password,
      );
      if (!account) {
        return this.previewError(
          'The hosted preview accepts the Customer and Admin demo accounts only.',
        );
      }
      return this.demoResponse(account.user);
    }
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, { email, password })
      .pipe(tap((response) => this.storeSession(response)));
  }

  loginDemo(role: keyof typeof DEMO_ACCOUNTS): Observable<AuthResponse> {
    const account = DEMO_ACCOUNTS[role];
    return this.hostedPreview
      ? this.demoResponse(account.user)
      : this.login(account.email, account.password);
  }

  register(fullName: string, email: string, password: string): Observable<AuthResponse> {
    if (this.hostedPreview) {
      return this.previewError(
        'Registration needs the local Spring Boot API. Use either demo account in this preview.',
      );
    }
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, { fullName, email, password })
      .pipe(tap((response) => this.storeSession(response)));
  }

  token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.user.set(null);
    void this.router.navigate(['/']);
  }

  goToWorkspace(): void {
    void this.router.navigate([this.isAdmin() ? '/admin' : '/dashboard']);
  }

  private storeSession(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.user.set(response.user);
  }

  private demoResponse(user: User): Observable<AuthResponse> {
    return of({
      token: `${DEMO_TOKEN_PREFIX}${user.role.toLowerCase()}`,
      user,
    }).pipe(
      delay(180),
      tap((response) => this.storeSession(response)),
    );
  }

  private previewError(message: string): Observable<never> {
    return throwError(
      () =>
        new HttpErrorResponse({
          status: 503,
          error: { message },
        }),
    );
  }

  private restoreUser(): User | null {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored || !localStorage.getItem(TOKEN_KEY)) {
      return null;
    }
    try {
      return JSON.parse(stored) as User;
    } catch {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  }
}
