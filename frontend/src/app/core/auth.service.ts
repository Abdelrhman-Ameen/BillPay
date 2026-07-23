import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, User } from './models';

const TOKEN_KEY = 'billpay_token';
const USER_KEY = 'billpay_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = '/api/auth';

  readonly user = signal<User | null>(this.restoreUser());
  readonly isAuthenticated = computed(() => Boolean(this.user()));
  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, { email, password })
      .pipe(tap((response) => this.storeSession(response)));
  }

  register(fullName: string, email: string, password: string): Observable<AuthResponse> {
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
