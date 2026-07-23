import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<'dark' | 'light'>(
    (localStorage.getItem('billpay_theme') as 'dark' | 'light' | null) ?? 'dark',
  );

  constructor() {
    this.apply();
  }

  toggle(): void {
    this.theme.update((theme) => (theme === 'dark' ? 'light' : 'dark'));
    localStorage.setItem('billpay_theme', this.theme());
    this.apply();
  }

  private apply(): void {
    document.documentElement.dataset['theme'] = this.theme();
  }
}
