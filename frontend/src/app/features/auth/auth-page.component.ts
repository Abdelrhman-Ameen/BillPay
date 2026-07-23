import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideCheck,
  LucideEye,
  LucideEyeOff,
  LucideLockKeyhole,
  LucideShieldCheck,
  LucideZap,
} from '@lucide/angular';
import { finalize } from 'rxjs';
import { ApiError } from '../../core/models';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-auth-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LucideArrowRight,
    LucideCheck,
    LucideEye,
    LucideEyeOff,
    LucideLockKeyhole,
    LucideShieldCheck,
    LucideZap,
  ],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.scss',
})
export class AuthPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly mode = signal<'login' | 'register'>(
    this.route.snapshot.data['mode'] === 'register' ? 'register' : 'login',
  );
  readonly loading = signal(false);
  readonly error = signal('');
  readonly showPassword = signal(false);

  readonly form = this.formBuilder.nonNullable.group({
    fullName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor() {
    if (this.mode() === 'register') {
      this.form.controls.fullName.addValidators([Validators.required, Validators.maxLength(100)]);
    }
  }

  useDemo(role: 'customer' | 'admin'): void {
    this.form.patchValue({
      email: role === 'admin' ? 'admin@billpay.dev' : 'customer@billpay.dev',
      password: role === 'admin' ? 'Admin123!' : 'Customer123!',
    });
  }

  togglePassword(): void {
    this.showPassword.update((show) => !show);
  }

  submit(): void {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { fullName, email, password } = this.form.getRawValue();
    const request =
      this.mode() === 'register'
        ? this.auth.register(fullName, email, password)
        : this.auth.login(email, password);

    request.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (response) => {
        void this.router.navigate([response.user.role === 'ADMIN' ? '/admin' : '/dashboard']);
      },
      error: (response) => {
        const apiError = response.error as ApiError | undefined;
        const connectionHint =
          response.status === 0
            ? 'Could not reach the BillPay API. Check that the backend is running.'
            : `The server could not complete this request (HTTP ${response.status}).`;
        this.error.set(apiError?.message ?? connectionHint);
      },
    });
  }
}
