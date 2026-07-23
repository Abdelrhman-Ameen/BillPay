import { afterNextRender, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideArrowRight, LucideLogOut, LucideMoon, LucideSun, LucideX } from '@lucide/angular';
import { AuthService } from './core/auth.service';
import { ThemeService } from './core/theme.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideArrowRight,
    LucideLogOut,
    LucideMoon,
    LucideSun,
    LucideX,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  protected readonly showFrontendNotice = signal(false);

  constructor() {
    afterNextRender(() => {
      const localHosts = new Set(['localhost', '127.0.0.1', '::1']);
      this.showFrontendNotice.set(!localHosts.has(window.location.hostname));

      const updateProgress = () => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
        document.documentElement.style.setProperty('--scroll-progress', `${progress}%`);
      };
      window.addEventListener('scroll', updateProgress, { passive: true });
      updateProgress();
    });
  }

  protected dismissFrontendNotice(): void {
    this.showFrontendNotice.set(false);
  }
}
