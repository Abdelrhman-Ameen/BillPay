import { afterNextRender, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideArrowRight, LucideLogOut, LucideMoon, LucideSun } from '@lucide/angular';
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
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);

  constructor() {
    afterNextRender(() => {
      const updateProgress = () => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
        document.documentElement.style.setProperty('--scroll-progress', `${progress}%`);
      };
      window.addEventListener('scroll', updateProgress, { passive: true });
      updateProgress();
    });
  }
}
